"""Orders and Cart API endpoints"""
import secrets
import string
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, and_
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.api.auth import get_current_user, require_role
from app.models.entities import User, Order, OrderItem, Cart, FoodListing, VendorProfile
from app.schemas.orders import (
    CartItemCreate,
    CartItemResponse,
    OrderCreate,
    OrderResponse,
    OrderItemResponse,
)

router = APIRouter(prefix="/orders", tags=["Orders"])


def generate_order_code() -> str:
    """Generate a 6-character alphanumeric order code"""
    return ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(6))


# Cart endpoints
@router.post("/cart", response_model=CartItemResponse, status_code=status.HTTP_201_CREATED)
def add_to_cart(
    item: CartItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("consumer")),
):
    """Add item to cart"""
    # Check if listing exists and is available
    listing = db.get(FoodListing, item.listing_id)
    if not listing or not listing.is_available or listing.quantity_available < item.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Listing not available or insufficient quantity"
        )
    
    # Check if item already in cart
    existing = db.scalar(
        select(Cart).where(
            and_(
                Cart.consumer_id == current_user.id,
                Cart.listing_id == item.listing_id
            )
        )
    )
    
    if existing:
        existing.quantity += item.quantity
        db.commit()
        db.refresh(existing)
        return existing
    
    cart_item = Cart(
        consumer_id=current_user.id,
        listing_id=item.listing_id,
        quantity=item.quantity,
    )
    db.add(cart_item)
    db.commit()
    db.refresh(cart_item)
    return cart_item


@router.get("/cart", response_model=list[CartItemResponse])
def get_cart(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("consumer")),
):
    """Get current user's cart"""
    query = (
        select(Cart)
        .where(Cart.consumer_id == current_user.id)
        .options(
            joinedload(Cart.listing).joinedload(FoodListing.food),
            joinedload(Cart.listing).joinedload(FoodListing.vendor),
        )
    )
    return db.scalars(query).unique().all()


@router.delete("/cart/{listing_id}")
def remove_from_cart(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("consumer")),
):
    """Remove item from cart"""
    cart_item = db.scalar(
        select(Cart).where(
            and_(
                Cart.consumer_id == current_user.id,
                Cart.listing_id == listing_id
            )
        )
    )
    
    if not cart_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not in cart"
        )
    
    db.delete(cart_item)
    db.commit()
    return {"message": "Item removed from cart"}


@router.delete("/cart")
def clear_cart(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("consumer")),
):
    """Clear entire cart"""
    db.execute(
        select(Cart).where(Cart.consumer_id == current_user.id)
    )
    db.query(Cart).filter(Cart.consumer_id == current_user.id).delete()
    db.commit()
    return {"message": "Cart cleared"}


# Order endpoints
@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("consumer")),
):
    """Create order from cart or specified items"""
    if not order_data.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order must contain at least one item"
        )
    
    # Verify all items are from the same vendor
    vendors = set()
    total = 0
    items_to_create = []
    
    for item_data in order_data.items:
        listing = db.get(FoodListing, item_data.listing_id)
        if not listing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Listing {item_data.listing_id} not found"
            )
        
        if not listing.is_available or listing.quantity_available < item_data.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient quantity for {listing.title}"
            )
        
        vendors.add(listing.vendor_id)
        item_total = listing.price_ngn * item_data.quantity
        total += item_total
        
        items_to_create.append({
            "listing_id": listing.id,
            "listing": listing,
            "quantity": item_data.quantity,
            "price_ngn": listing.price_ngn,
        })
    
    if len(vendors) > 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="All items must be from the same vendor"
        )
    
    vendor_id = vendors.pop()
    
    # Generate unique order code
    order_code = generate_order_code()
    while db.scalar(select(Order).where(Order.order_code == order_code)):
        order_code = generate_order_code()
    
    # Create order
    order = Order(
        order_code=order_code,
        consumer_id=current_user.id,
        vendor_id=vendor_id,
        status="placed",
        total_ngn=total,
    )
    db.add(order)
    db.flush()
    
    # Create order items and update inventory
    for item_info in items_to_create:
        order_item = OrderItem(
            order_id=order.id,
            listing_id=item_info["listing_id"],
            quantity=item_info["quantity"],
            price_ngn=item_info["price_ngn"],
        )
        db.add(order_item)
        
        # Reduce inventory
        listing = item_info["listing"]
        listing.quantity_available -= item_info["quantity"]
    
    # Clear cart items that were ordered
    db.query(Cart).filter(
        and_(
            Cart.consumer_id == current_user.id,
            Cart.listing_id.in_([item["listing_id"] for item in items_to_create])
        )
    ).delete(synchronize_session=False)
    
    db.commit()
    db.refresh(order)
    
    return order


@router.get("/", response_model=list[OrderResponse])
def get_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("consumer")),
):
    """Get current user's orders"""
    query = (
        select(Order)
        .where(Order.consumer_id == current_user.id)
        .order_by(Order.created_at.desc())
    )
    return db.scalars(query).all()


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("consumer")),
):
    """Get specific order"""
    order = db.get(Order, order_id)
    if not order or order.consumer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    return order
