from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.auth import require_role
from app.models.entities import User, VendorProfile
from app.schemas.vendors import VendorReviewRequest, VendorReviewResponse

from sqlalchemy.orm import joinedload

from app.models.entities import FoodListing, FoodCatalogue
from app.schemas.foods import (
    FoodListingCreate,
    FoodListingUpdate,
    FoodListingAvailabilityUpdate,
    FoodListingResponse,
)

router = APIRouter(prefix="/vendors", tags=["Vendor Management"])


@router.get(
    "/pending",
    response_model=list[VendorReviewResponse],
)
def list_pending_vendors(
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("admin")),
):
    return db.scalars(
        select(VendorProfile)
        .where(VendorProfile.approval_status == "pending")
        .order_by(VendorProfile.id)
    ).all()


@router.post(
    "/{vendor_id}/approve",
    response_model=VendorReviewResponse,
)
def approve_vendor(
    vendor_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("admin")),
):
    vendor = db.get(VendorProfile, vendor_id)

    if vendor is None:
        raise HTTPException(status_code=404, detail="Vendor not found")

    if vendor.approval_status == "suspended":
        raise HTTPException(
            status_code=409,
            detail="Suspended vendors cannot be approved directly",
        )

    vendor.approval_status = "approved"
    vendor.rejection_reason = None

    db.commit()
    db.refresh(vendor)

    return vendor


@router.post(
    "/{vendor_id}/reject",
    response_model=VendorReviewResponse,
)
def reject_vendor(
    vendor_id: int,
    data: VendorReviewRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("admin")),
):
    vendor = db.get(VendorProfile, vendor_id)

    if vendor is None:
        raise HTTPException(status_code=404, detail="Vendor not found")

    if vendor.approval_status == "approved":
        raise HTTPException(
            status_code=409,
            detail="Approved vendors must be suspended instead of rejected",
        )

    vendor.approval_status = "rejected"
    vendor.rejection_reason = (
        data.rejection_reason or "Application rejected"
    )

    db.commit()
    db.refresh(vendor)

    return vendor


@router.post(
    "/{vendor_id}/suspend",
    response_model=VendorReviewResponse,
)
def suspend_vendor(
    vendor_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("admin")),
):
    vendor = db.get(VendorProfile, vendor_id)

    if vendor is None:
        raise HTTPException(status_code=404, detail="Vendor not found")

    vendor.approval_status = "suspended"
    vendor.rejection_reason = None

    db.commit()
    db.refresh(vendor)

    return vendor


@router.get(
    "/me/status",
    response_model=VendorReviewResponse,
)
def get_my_vendor_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("vendor")),
):
    vendor = db.scalar(
        select(VendorProfile).where(
            VendorProfile.user_id == current_user.id
        )
    )

    if vendor is None:
        raise HTTPException(
            status_code=404,
            detail="Vendor profile not found",
        )

    return vendor

def get_approved_vendor_profile(
    db: Session,
    user_id: int,
) -> VendorProfile:
    vendor = db.scalar(
        select(VendorProfile).where(
            VendorProfile.user_id == user_id
        )
    )

    if vendor is None:
        raise HTTPException(
            status_code=404,
            detail="Vendor profile not found",
        )

    if vendor.approval_status != "approved":
        raise HTTPException(
            status_code=403,
            detail="Your vendor account must be approved to manage listings",
        )

    return vendor


def get_vendor_listing(
    db: Session,
    vendor_id: int,
    listing_id: int,
) -> FoodListing:
    listing = db.scalar(
        select(FoodListing)
        .options(
            joinedload(FoodListing.food),
            joinedload(FoodListing.vendor),
        )
        .where(
            FoodListing.id == listing_id,
            FoodListing.vendor_id == vendor_id,
        )
    )

    if listing is None:
        raise HTTPException(
            status_code=404,
            detail="Listing not found",
        )

    return listing


@router.get(
    "/me/listings",
    response_model=list[FoodListingResponse],
)
def get_my_listings(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("vendor")),
):
    vendor = get_approved_vendor_profile(db, current_user.id)

    query = (
        select(FoodListing)
        .options(
            joinedload(FoodListing.food),
            joinedload(FoodListing.vendor),
        )
        .where(FoodListing.vendor_id == vendor.id)
        .order_by(FoodListing.id.desc())
    )

    return db.scalars(query).unique().all()


@router.post(
    "/me/listings",
    response_model=FoodListingResponse,
    status_code=201,
)
def create_listing(
    data: FoodListingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("vendor")),
):
    vendor = get_approved_vendor_profile(db, current_user.id)

    food = db.get(FoodCatalogue, data.food_id)

    if food is None or not food.is_active:
        raise HTTPException(
            status_code=404,
            detail="Food catalogue item not found or inactive",
        )

    listing = FoodListing(
        vendor_id=vendor.id,
        food_id=food.id,
        title=data.title.strip(),
        description=data.description.strip(),
        price_ngn=data.price_ngn,
        quantity_available=data.quantity_available,
        serving_size_g=data.serving_size_g,
        is_available=data.quantity_available > 0,
        is_active=True,
    )

    db.add(listing)
    db.commit()
    db.refresh(listing)

    return get_vendor_listing(db, vendor.id, listing.id)


@router.put(
    "/me/listings/{listing_id}",
    response_model=FoodListingResponse,
)
def update_listing(
    listing_id: int,
    data: FoodListingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("vendor")),
):
    vendor = get_approved_vendor_profile(db, current_user.id)

    listing = get_vendor_listing(
        db,
        vendor.id,
        listing_id,
    )

    food = db.get(FoodCatalogue, data.food_id)

    if food is None or not food.is_active:
        raise HTTPException(
            status_code=404,
            detail="Food catalogue item not found or inactive",
        )

    listing.food_id = data.food_id
    listing.title = data.title.strip()
    listing.description = data.description.strip()
    listing.price_ngn = data.price_ngn
    listing.quantity_available = data.quantity_available
    listing.serving_size_g = data.serving_size_g

    if listing.quantity_available == 0:
        listing.is_available = False

    db.commit()
    db.refresh(listing)

    return get_vendor_listing(db, vendor.id, listing.id)


@router.patch(
    "/me/listings/{listing_id}/availability",
    response_model=FoodListingResponse,
)
def update_listing_availability(
    listing_id: int,
    data: FoodListingAvailabilityUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("vendor")),
):
    vendor = get_approved_vendor_profile(db, current_user.id)

    listing = get_vendor_listing(
        db,
        vendor.id,
        listing_id,
    )

    if data.is_available and listing.quantity_available <= 0:
        raise HTTPException(
            status_code=409,
            detail="Cannot make a listing available with zero stock",
        )

    listing.is_available = data.is_available

    db.commit()
    db.refresh(listing)

    return get_vendor_listing(db, vendor.id, listing.id)
    