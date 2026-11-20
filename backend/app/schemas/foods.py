from pydantic import BaseModel, ConfigDict


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
    food: FoodInfo
    vendor: VendorInfo
