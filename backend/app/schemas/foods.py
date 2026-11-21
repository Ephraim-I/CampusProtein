from pydantic import BaseModel, ConfigDict, Field


class FoodInfo(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    protein_category: str
    food_type: str
    protein_per_100g: float
    calories_per_100g: float
    carbohydrates_per_100g: float
    fat_per_100g: float
    allergens: str
    dietary_tags: str
    nutrition_source: str
    source_url: str | None


class VendorInfo(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    business_name: str
    location: str


class FoodListingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str
    price_ngn: int
    quantity_available: int
    serving_size_g: float
    is_available: bool
    is_active: bool
    food: FoodInfo
    vendor: VendorInfo

class FoodListingCreate(BaseModel):
    food_id: int = Field(gt=0)
    title: str = Field(min_length=1, max_length=100)
    description: str = Field(default="", max_length=2000)
    price_ngn: int = Field(ge=0)
    quantity_available: int = Field(ge=0)
    serving_size_g: float = Field(gt=0, le=5000)


class FoodListingUpdate(BaseModel):
    food_id: int = Field(gt=0)
    title: str = Field(min_length=1, max_length=100)
    description: str = Field(default="", max_length=2000)
    price_ngn: int = Field(ge=0)
    quantity_available: int = Field(ge=0)
    serving_size_g: float = Field(gt=0, le=5000)


class FoodListingAvailabilityUpdate(BaseModel):
    is_available: bool
