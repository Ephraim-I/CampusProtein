from typing import Literal

from pydantic import BaseModel, EmailStr, Field


class UserRegister(BaseModel):
    email: EmailStr
    display_name: str = Field(min_length=1, max_length=40)
    password: str = Field(min_length=8, max_length=128)

    role: Literal["consumer", "vendor"] = "consumer"

    # Required for vendor registration
    business_name: str | None = Field(default=None, max_length=60)
    location: str | None = Field(default=None, max_length=150)
    opening_time: str | None = Field(default=None, max_length=10)
    closing_time: str | None = Field(default=None, max_length=10)
    description: str | None = Field(default="", max_length=2000)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    display_name: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse


class MessageResponse(BaseModel):
    message: str
