from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    display_name: Mapped[str] = mapped_column(String(40))
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(20), default="consumer")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now
    )


class VendorProfile(Base):
    __tablename__ = "vendor_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"), unique=True
    )

    business_name: Mapped[str] = mapped_column(String(60))
    description: Mapped[str] = mapped_column(Text, default="")
    location: Mapped[str] = mapped_column(String(150))
    opening_time: Mapped[str] = mapped_column(String(10))
    closing_time: Mapped[str] = mapped_column(String(10))

    approval_status: Mapped[str] = mapped_column(
        String(20), default="pending"
    )
    rejection_reason: Mapped[str | None] = mapped_column(Text, nullable=True)

    user: Mapped["User"] = relationship()


class FoodCatalogue(Base):
    __tablename__ = "food_catalogue"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    name: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    protein_category: Mapped[str] = mapped_column(String(40))
    food_type: Mapped[str] = mapped_column(String(30))

    protein_per_100g: Mapped[float] = mapped_column()
    calories_per_100g: Mapped[float] = mapped_column()
    carbohydrates_per_100g: Mapped[float] = mapped_column()
    fat_per_100g: Mapped[float] = mapped_column()

    allergens: Mapped[str] = mapped_column(Text, default="")
    dietary_tags: Mapped[str] = mapped_column(Text, default="")
    nutrition_source: Mapped[str] = mapped_column(Text)
    source_url: Mapped[str | None] = mapped_column(Text, nullable=True)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class FoodListing(Base):
    __tablename__ = "food_listings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    vendor_id: Mapped[int] = mapped_column(
        ForeignKey("vendor_profiles.id")
    )
    food_id: Mapped[int] = mapped_column(
        ForeignKey("food_catalogue.id")
    )

    title: Mapped[str] = mapped_column(String(100))
    description: Mapped[str] = mapped_column(Text, default="")
    price_ngn: Mapped[int] = mapped_column(Integer)
    quantity_available: Mapped[int] = mapped_column(Integer, default=0)

    serving_size_g: Mapped[float] = mapped_column(default=100.0)

    is_available: Mapped[bool] = mapped_column(Boolean, default=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now
    )

    vendor: Mapped["VendorProfile"] = relationship()
    food: Mapped["FoodCatalogue"] = relationship()
