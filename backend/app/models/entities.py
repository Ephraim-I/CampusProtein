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


class ConsumerProfile(Base):
    __tablename__ = "consumer_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True)
    
    protein_goal_g: Mapped[int] = mapped_column(Integer, default=55)
    budget_ngn: Mapped[int | None] = mapped_column(Integer, nullable=True)
    dietary_restrictions: Mapped[str] = mapped_column(Text, default="")  # comma-separated
    preferred_proteins: Mapped[str] = mapped_column(Text, default="")  # comma-separated categories
    
    onboarding_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    order_code: Mapped[str] = mapped_column(String(10), unique=True, index=True)
    
    consumer_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    vendor_id: Mapped[int] = mapped_column(ForeignKey("vendor_profiles.id"))
    
    status: Mapped[str] = mapped_column(String(30), default="placed")  # placed, accepted, preparing, ready, completed, rejected
    total_ngn: Mapped[int] = mapped_column(Integer)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)
    
    consumer: Mapped["User"] = relationship(foreign_keys=[consumer_id])
    vendor: Mapped["VendorProfile"] = relationship(foreign_keys=[vendor_id])


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"))
    listing_id: Mapped[int] = mapped_column(ForeignKey("food_listings.id"))
    
    quantity: Mapped[int] = mapped_column(Integer)
    price_ngn: Mapped[int] = mapped_column(Integer)  # Price at time of order
    
    order: Mapped["Order"] = relationship()
    listing: Mapped["FoodListing"] = relationship()


class MealLog(Base):
    __tablename__ = "meal_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    consumer_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    food_id: Mapped[int] = mapped_column(ForeignKey("food_catalogue.id"))
    
    servings: Mapped[float] = mapped_column(default=1.0)
    protein_g: Mapped[float] = mapped_column()
    calories: Mapped[float] = mapped_column()
    
    logged_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    
    consumer: Mapped["User"] = relationship()
    food: Mapped["FoodCatalogue"] = relationship()


class GamificationProfile(Base):
    __tablename__ = "gamification_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True)
    
    points: Mapped[int] = mapped_column(Integer, default=0)
    current_streak: Mapped[int] = mapped_column(Integer, default=0)
    longest_streak: Mapped[int] = mapped_column(Integer, default=0)
    last_log_date: Mapped[str | None] = mapped_column(String(10), nullable=True)  # YYYY-MM-DD
    
    badges: Mapped[str] = mapped_column(Text, default="")  # comma-separated badge IDs
    challenge_joined: Mapped[bool] = mapped_column(Boolean, default=False)
    challenge_progress: Mapped[int] = mapped_column(Integer, default=0)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)


class Cart(Base):
    __tablename__ = "carts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    consumer_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    listing_id: Mapped[int] = mapped_column(ForeignKey("food_listings.id"))
    
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    
    consumer: Mapped["User"] = relationship()
    listing: Mapped["FoodListing"] = relationship()
