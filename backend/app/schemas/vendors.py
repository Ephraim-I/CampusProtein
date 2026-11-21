from pydantic import BaseModel, ConfigDict


class VendorReviewRequest(BaseModel):
    rejection_reason: str | None = None


class VendorReviewResponse(BaseModel):
    id: int
    user_id: int
    business_name: str
    description: str
    location: str
    opening_time: str
    closing_time: str
    approval_status: str
    rejection_reason: str | None

    model_config = ConfigDict(from_attributes=True)
