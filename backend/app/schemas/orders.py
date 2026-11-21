"""Schemas for orders and cart"""
from datetime import datetime
from pydantic import BaseModel, Field

class CartItemCreate(BaseModel):
    listing_id: int
    quantity: int = Field(ge=1)

class CartItemResponse(BaseModel):
    id: int
    listing_id: int
    quantity: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class OrderItemCreate(BaseModel):
    listing_id: int
    quantity: int = Field(ge=1)

class OrderItemResponse(BaseModel):
    id: int
    listing_id: int
    quantity: int
    price_ngn: int
    
    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    items: list[OrderItemCreate]

class OrderResponse(BaseModel):
    id: int
    order_code: str
    consumer_id: int
    vendor_id: int
    status: str
    total_ngn: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
