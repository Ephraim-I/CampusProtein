from sqlalchemy import select

from app.core.database import SessionLocal
from app.models import User, VendorProfile, FoodCatalogue, FoodListing


FOODS = [
    {
        "name": "Cowpea (Dry)",
        "protein_category": "Legume",
        "food_type": "Alternative",
        "protein_per_100g": 23.0,
        "calories_per_100g": 331,
        "carbohydrates_per_100g": 50.3,
        "fat_per_100g": 1.8,
        "nutrition_source": "FAO/INFOODS Western Africa 2019, cowpea dry seeds",
        "allergens": "",
        "dietary_tags": "vegan,vegetarian",
    },
    {
        "name": "Cowpea (Boiled)",
        "protein_category": "Legume",
        "food_type": "Alternative",
        "protein_per_100g": 7.1,
        "calories_per_100g": 118,
        "carbohydrates_per_100g": 19.3,
        "fat_per_100g": 0.6,
        "nutrition_source": "FAO/INFOODS West African food composition tables",
        "allergens": "",
        "dietary_tags": "vegan,vegetarian",
    },
    {
        "name": "Soybean (Dry)",
        "protein_category": "Soy_Product",
        "food_type": "Alternative",
        "protein_per_100g": 32.0,
        "calories_per_100g": 410,
        "carbohydrates_per_100g": 27.6,
        "fat_per_100g": 17.0,
        "nutrition_source": "FAO/INFOODS West African food composition table",
        "allergens": "soy",
        "dietary_tags": "vegan,vegetarian",
    },
    {
        "name": "Soybean (Boiled)",
        "protein_category": "Soy_Product",
        "food_type": "Alternative",
        "protein_per_100g": 13.9,
        "calories_per_100g": 178,
        "carbohydrates_per_100g": 12.0,
        "fat_per_100g": 7.4,
        "nutrition_source": "FAO/INFOODS West African food composition table",
        "allergens": "soy",
        "dietary_tags": "vegan,vegetarian",
    },
    {
        "name": "Lentils (Dry)",
        "protein_category": "Legume",
        "food_type": "Alternative",
        "protein_per_100g": 25.4,
        "calories_per_100g": 297,
        "carbohydrates_per_100g": 29.4,
        "fat_per_100g": 1.8,
        "nutrition_source": "FAO/INFOODS West African food composition table",
        "allergens": "",
        "dietary_tags": "vegan,vegetarian",
    },
    {
        "name": "Lentils (Boiled)",
        "protein_category": "Legume",
        "food_type": "Alternative",
        "protein_per_100g": 9.3,
        "calories_per_100g": 109,
        "carbohydrates_per_100g": 10.8,
        "fat_per_100g": 0.7,
        "nutrition_source": "FAO/INFOODS West African food composition table",
        "allergens": "",
        "dietary_tags": "vegan,vegetarian",
    },
    {
        "name": "Pigeon Peas (Dry)",
        "protein_category": "Legume",
        "food_type": "Alternative",
        "protein_per_100g": 18.4,
        "calories_per_100g": 301,
        "carbohydrates_per_100g": 43.2,
        "fat_per_100g": 1.5,
        "nutrition_source": "FAO/INFOODS West African food composition table",
        "allergens": "",
        "dietary_tags": "vegan,vegetarian",
    },
    {
        "name": "Pigeon Peas (Boiled)",
        "protein_category": "Legume",
        "food_type": "Alternative",
        "protein_per_100g": 6.8,
        "calories_per_100g": 111,
        "carbohydrates_per_100g": 16.0,
        "fat_per_100g": 0.6,
        "nutrition_source": "FAO/INFOODS West African food composition table",
        "allergens": "",
        "dietary_tags": "vegan,vegetarian",
    },
    {
        "name": "Groundnuts",
        "protein_category": "Seed_or_Nut",
        "food_type": "Alternative",
        "protein_per_100g": 25.0,
        "calories_per_100g": 570,
        "carbohydrates_per_100g": 23.0,
        "fat_per_100g": 49.0,
        "nutrition_source": "Demo estimate; requires source verification",
        "allergens": "peanut",
        "dietary_tags": "vegan,vegetarian",
    },
    {
        "name": "Sesame Seeds",
        "protein_category": "Seed_or_Nut",
        "food_type": "Alternative",
        "protein_per_100g": 20.0,
        "calories_per_100g": 592,
        "carbohydrates_per_100g": 22.0,
        "fat_per_100g": 50.0,
        "nutrition_source": "Demo estimate; requires source verification",
        "allergens": "sesame",
        "dietary_tags": "vegan,vegetarian",
    },
    {
        "name": "Mushrooms",
        "protein_category": "Mushroom",
        "food_type": "Alternative",
        "protein_per_100g": 3.1,
        "calories_per_100g": 22,
        "carbohydrates_per_100g": 3.3,
        "fat_per_100g": 0.3,
        "nutrition_source": "Demo estimate; requires source verification",
        "allergens": "",
        "dietary_tags": "vegan,vegetarian",
    },
    {
        "name": "Egg",
        "protein_category": "Conventional",
        "food_type": "Conventional",
        "protein_per_100g": 12.6,
        "calories_per_100g": 143,
        "carbohydrates_per_100g": 0.7,
        "fat_per_100g": 9.5,
        "nutrition_source": "Demo estimate; requires source verification",
        "allergens": "egg",
        "dietary_tags": "vegetarian",
    },
]


def seed_database():
    db = SessionLocal()

    try:
        vendor_user = db.scalar(
            select(User).where(User.email == "demo-vendor@campusprotein.test")
        )

        if not vendor_user:
            vendor_user = User(
                email="demo-vendor@campusprotein.test",
                display_name="Demo Vendor",
                password_hash="NOT-A-REAL-LOGIN",
                role="vendor",
                is_active=True,
            )
            db.add(vendor_user)
            db.flush()

        vendor = db.scalar(
            select(VendorProfile).where(
                VendorProfile.user_id == vendor_user.id
            )
        )

        if not vendor:
            vendor = VendorProfile(
                user_id=vendor_user.id,
                business_name="CampusProtein Demo Kitchen",
                description="Synthetic vendor for demonstration purposes.",
                location="Veritas University Campus",
                opening_time="08:00",
                closing_time="18:00",
                approval_status="approved",
            )
            db.add(vendor)
            db.flush()

        for food_data in FOODS:
            food = db.scalar(
                select(FoodCatalogue).where(
                    FoodCatalogue.name == food_data["name"]
                )
            )

            if not food:
                food = FoodCatalogue(**food_data)
                db.add(food)
                db.flush()

            listing_exists = db.scalar(
                select(FoodListing).where(
                    FoodListing.vendor_id == vendor.id,
                    FoodListing.food_id == food.id,
                )
            )

            if not listing_exists:
                db.add(
                    FoodListing(
                        vendor_id=vendor.id,
                        food_id=food.id,
                        title=food.name,
                        description="Synthetic demonstration listing.",
                        price_ngn=1000,
                        quantity_available=20,
                        serving_size_g=100,
                        is_available=True,
                        is_active=True,
                    )
                )

        db.commit()

        print(f"Seed complete. Loaded {len(FOODS)} catalogue foods.")
        print("Created synthetic demo vendor and marketplace listings.")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
