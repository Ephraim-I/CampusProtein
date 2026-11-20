from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.models import FoodListing, FoodCatalogue
from app.schemas import FoodListingResponse

router = APIRouter(prefix="/foods", tags=["Marketplace"])


@router.get("/", response_model=list[FoodListingResponse])
def get_food_listings(
    search: Optional[str] = Query(default=None),
    category: Optional[str] = Query(default=None),
    min_protein: Optional[float] = Query(default=None, ge=0),
    max_price: Optional[int] = Query(default=None, ge=0),
    db: Session = Depends(get_db),
):
    query = (
        select(FoodListing)
        .join(FoodListing.food)
        .join(FoodListing.vendor)
        .options(
            joinedload(FoodListing.food),
            joinedload(FoodListing.vendor),
        )
        .where(
            FoodListing.is_active.is_(True),
            FoodListing.is_available.is_(True),
            FoodListing.quantity_available > 0,
            FoodListing.food.has(is_active=True),
            FoodListing.vendor.has(approval_status="approved"),
        )
    )

    if search:
        term = f"%{search.strip()}%"
        query = query.where(
            FoodListing.title.ilike(term)
            | FoodListing.food.has(FoodCatalogue.name.ilike(term))
        )

    if category:
        query = query.where(
            FoodListing.food.has(
                FoodCatalogue.protein_category == category
            )
        )

    if min_protein is not None:
        query = query.where(
            FoodListing.food.has(
                FoodCatalogue.protein_per_100g >= min_protein
            )
        )

    if max_price is not None:
        query = query.where(FoodListing.price_ngn <= max_price)

    query = query.order_by(FoodListing.price_ngn.asc())

    return db.scalars(query).unique().all()
