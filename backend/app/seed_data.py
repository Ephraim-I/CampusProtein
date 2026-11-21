"""
Database seeding script for CampusProtein demo data.
Creates synthetic users, vendors, foods, and listings.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base
from app.core.security import hash_password
from app.models.entities import User, VendorProfile, FoodCatalogue, FoodListing

DATABASE_URL = "sqlite:///./campusprotein.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)


def seed_database():
    """Seed the database with demo data."""
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Clear existing data
        db.query(FoodListing).delete()
        db.query(FoodCatalogue).delete()
        db.query(VendorProfile).delete()
        db.query(User).delete()
        db.commit()
        
        print("✓ Cleared existing data")
        
        # Create admin user
        admin = User(
            email="admin@campusprotein.ng",
            display_name="Campus Administrator",
            password_hash=hash_password("admin123"),
            role="admin",
            is_active=True,
        )
        db.add(admin)
        
        # Create consumer users
        consumer1 = User(
            email="student@veritas.edu.ng",
            display_name="Chioma Adeleke",
            password_hash=hash_password("student123"),
            role="consumer",
            is_active=True,
        )
        db.add(consumer1)
        
        consumer2 = User(
            email="john@veritas.edu.ng",
            display_name="John Okafor",
            password_hash=hash_password("student123"),
            role="consumer",
            is_active=True,
        )
        db.add(consumer2)
        
        db.flush()
        print("✓ Created users (admin, 2 consumers)")
        
        # Create vendor users and profiles
        vendors_data = [
            {
                "email": "mama_put@veritas.ng",
                "display_name": "Mama Put Kitchen",
                "business_name": "Mama Put Kitchen",
                "description": "Traditional Nigerian meals made with love and alternative proteins",
                "location": "Campus Main Gate",
                "opening_time": "08:00",
                "closing_time": "20:00",
                "approval_status": "approved",
            },
            {
                "email": "healthy_bites@veritas.ng",
                "display_name": "Healthy Bites Café",
                "business_name": "Healthy Bites Café",
                "description": "Fresh, nutritious meals for health-conscious students",
                "location": "Student Centre",
                "opening_time": "07:00",
                "closing_time": "18:00",
                "approval_status": "approved",
            },
            {
                "email": "protein_corner@veritas.ng",
                "display_name": "Protein Corner",
                "business_name": "Protein Corner",
                "description": "Specializing in high-protein alternative meals and snacks",
                "location": "Library Building",
                "opening_time": "09:00",
                "closing_time": "17:00",
                "approval_status": "approved",
            },
            {
                "email": "new_vendor@veritas.ng",
                "display_name": "Fresh Foods",
                "business_name": "Fresh Foods Spot",
                "description": "New vendor awaiting approval",
                "location": "Sports Complex",
                "opening_time": "10:00",
                "closing_time": "19:00",
                "approval_status": "pending",
            },
        ]
        
        vendor_profiles = []
        for vendor_data in vendors_data:
            vendor_user = User(
                email=vendor_data["email"],
                display_name=vendor_data["display_name"],
                password_hash=hash_password("vendor123"),
                role="vendor",
                is_active=True,
            )
            db.add(vendor_user)
            db.flush()
            
            vendor_profile = VendorProfile(
                user_id=vendor_user.id,
                business_name=vendor_data["business_name"],
                description=vendor_data["description"],
                location=vendor_data["location"],
                opening_time=vendor_data["opening_time"],
                closing_time=vendor_data["closing_time"],
                approval_status=vendor_data["approval_status"],
            )
            db.add(vendor_profile)
            db.flush()
            vendor_profiles.append(vendor_profile)
        
        print(f"✓ Created {len(vendors_data)} vendors (3 approved, 1 pending)")
        
        # Create food catalogue entries
        foods_data = [
            # Legumes
            {
                "name": "Moi Moi (Steamed Bean Pudding)",
                "protein_category": "legume",
                "food_type": "meal",
                "protein_per_100g": 12.5,
                "calories_per_100g": 180,
                "carbohydrates_per_100g": 18.0,
                "fat_per_100g": 6.5,
                "allergens": "soy",
                "dietary_tags": "vegan,vegetarian",
                "nutrition_source": "Nigerian Food Composition Table 2019",
                "source_url": "https://www.fao.org/nutrition/en/",
            },
            {
                "name": "Akara (Bean Fritters)",
                "protein_category": "legume",
                "food_type": "snack",
                "protein_per_100g": 10.2,
                "calories_per_100g": 210,
                "carbohydrates_per_100g": 15.5,
                "fat_per_100g": 11.0,
                "allergens": "",
                "dietary_tags": "vegan,vegetarian",
                "nutrition_source": "Nigerian Food Composition Table 2019",
                "source_url": "https://www.fao.org/nutrition/en/",
            },
            {
                "name": "Beans Porridge",
                "protein_category": "legume",
                "food_type": "meal",
                "protein_per_100g": 9.8,
                "calories_per_100g": 165,
                "carbohydrates_per_100g": 22.0,
                "fat_per_100g": 4.5,
                "allergens": "",
                "dietary_tags": "vegan,vegetarian",
                "nutrition_source": "West African Food Composition Database",
                "source_url": "https://www.fao.org/nutrition/en/",
            },
            {
                "name": "Bambara Groundnut Soup",
                "protein_category": "legume",
                "food_type": "meal",
                "protein_per_100g": 15.5,
                "calories_per_100g": 195,
                "carbohydrates_per_100g": 16.0,
                "fat_per_100g": 7.2,
                "allergens": "peanut",
                "dietary_tags": "vegan,vegetarian",
                "nutrition_source": "West African Food Composition Database",
                "source_url": "https://www.fao.org/nutrition/en/",
            },
            # Soy products
            {
                "name": "Awara (Nigerian Tofu)",
                "protein_category": "soy_product",
                "food_type": "meal",
                "protein_per_100g": 16.0,
                "calories_per_100g": 145,
                "carbohydrates_per_100g": 4.5,
                "fat_per_100g": 8.5,
                "allergens": "soy",
                "dietary_tags": "vegan,vegetarian",
                "nutrition_source": "Nigerian Food Composition Table 2019",
                "source_url": "https://www.fao.org/nutrition/en/",
            },
            {
                "name": "Soy Milk",
                "protein_category": "soy_product",
                "food_type": "drink",
                "protein_per_100g": 3.3,
                "calories_per_100g": 54,
                "carbohydrates_per_100g": 4.5,
                "fat_per_100g": 1.8,
                "allergens": "soy",
                "dietary_tags": "vegan,vegetarian",
                "nutrition_source": "USDA FoodData Central",
                "source_url": "https://fdc.nal.usda.gov/",
            },
            {
                "name": "Soy Chunks Stew",
                "protein_category": "soy_product",
                "food_type": "meal",
                "protein_per_100g": 52.0,
                "calories_per_100g": 330,
                "carbohydrates_per_100g": 33.0,
                "fat_per_100g": 1.2,
                "allergens": "soy",
                "dietary_tags": "vegan,vegetarian",
                "nutrition_source": "USDA FoodData Central",
                "source_url": "https://fdc.nal.usda.gov/",
            },
            # Seeds and nuts
            {
                "name": "Groundnut Soup",
                "protein_category": "seed_or_nut",
                "food_type": "meal",
                "protein_per_100g": 11.5,
                "calories_per_100g": 245,
                "carbohydrates_per_100g": 12.0,
                "fat_per_100g": 18.5,
                "allergens": "peanut",
                "dietary_tags": "vegan,vegetarian",
                "nutrition_source": "Nigerian Food Composition Table 2019",
                "source_url": "https://www.fao.org/nutrition/en/",
            },
            {
                "name": "Roasted Groundnuts",
                "protein_category": "seed_or_nut",
                "food_type": "snack",
                "protein_per_100g": 25.8,
                "calories_per_100g": 567,
                "carbohydrates_per_100g": 16.1,
                "fat_per_100g": 49.2,
                "allergens": "peanut",
                "dietary_tags": "vegan,vegetarian",
                "nutrition_source": "USDA FoodData Central",
                "source_url": "https://fdc.nal.usda.gov/",
            },
            {
                "name": "Egusi Soup",
                "protein_category": "seed_or_nut",
                "food_type": "meal",
                "protein_per_100g": 28.0,
                "calories_per_100g": 485,
                "carbohydrates_per_100g": 10.0,
                "fat_per_100g": 42.0,
                "allergens": "",
                "dietary_tags": "vegan,vegetarian",
                "nutrition_source": "Nigerian Food Composition Table 2019",
                "source_url": "https://www.fao.org/nutrition/en/",
            },
            # Mushrooms
            {
                "name": "Mushroom Stir-Fry",
                "protein_category": "mushroom",
                "food_type": "meal",
                "protein_per_100g": 5.8,
                "calories_per_100g": 85,
                "carbohydrates_per_100g": 9.5,
                "fat_per_100g": 3.2,
                "allergens": "",
                "dietary_tags": "vegan,vegetarian",
                "nutrition_source": "USDA FoodData Central",
                "source_url": "https://fdc.nal.usda.gov/",
            },
            {
                "name": "Mushroom Pepper Soup",
                "protein_category": "mushroom",
                "food_type": "meal",
                "protein_per_100g": 4.5,
                "calories_per_100g": 75,
                "carbohydrates_per_100g": 8.0,
                "fat_per_100g": 2.8,
                "allergens": "",
                "dietary_tags": "vegan,vegetarian",
                "nutrition_source": "USDA FoodData Central",
                "source_url": "https://fdc.nal.usda.gov/",
            },
        ]
        
        food_entries = []
        for food_data in foods_data:
            food = FoodCatalogue(**food_data, is_active=True)
            db.add(food)
            db.flush()
            food_entries.append(food)
        
        print(f"✓ Created {len(foods_data)} food catalogue entries")
        
        # Create food listings (only for approved vendors)
        approved_vendors = [v for v in vendor_profiles if v.approval_status == "approved"]
        
        listings_data = [
            # Mama Put Kitchen listings
            {"vendor_idx": 0, "food_idx": 0, "title": "Steamed Moi Moi (1 wrap)", "price": 400, "qty": 25, "serving_g": 150},
            {"vendor_idx": 0, "food_idx": 1, "title": "Hot Akara (3 pieces)", "price": 300, "qty": 30, "serving_g": 120},
            {"vendor_idx": 0, "food_idx": 2, "title": "Beans Porridge Bowl", "price": 500, "qty": 20, "serving_g": 250},
            {"vendor_idx": 0, "food_idx": 7, "title": "Groundnut Soup with Eba", "price": 800, "qty": 15, "serving_g": 300},
            
            # Healthy Bites Café listings
            {"vendor_idx": 1, "food_idx": 4, "title": "Awara Stir-Fry Plate", "price": 700, "qty": 18, "serving_g": 200},
            {"vendor_idx": 1, "food_idx": 5, "title": "Fresh Soy Milk (350ml)", "price": 350, "qty": 40, "serving_g": 350},
            {"vendor_idx": 1, "food_idx": 10, "title": "Grilled Mushroom Bowl", "price": 900, "qty": 12, "serving_g": 220},
            {"vendor_idx": 1, "food_idx": 1, "title": "Protein Akara (5 pieces)", "price": 450, "qty": 25, "serving_g": 180},
            
            # Protein Corner listings
            {"vendor_idx": 2, "food_idx": 6, "title": "Soy Chunks Protein Bowl", "price": 1200, "qty": 10, "serving_g": 180},
            {"vendor_idx": 2, "food_idx": 8, "title": "Roasted Groundnuts Pack", "price": 200, "qty": 50, "serving_g": 50},
            {"vendor_idx": 2, "food_idx": 3, "title": "Bambara Nut Soup Combo", "price": 850, "qty": 14, "serving_g": 280},
            {"vendor_idx": 2, "food_idx": 11, "title": "Mushroom Pepper Soup", "price": 600, "qty": 16, "serving_g": 250},
            {"vendor_idx": 2, "food_idx": 9, "title": "Egusi Soup Special", "price": 1000, "qty": 8, "serving_g": 200},
        ]
        
        for listing_data in listings_data:
            vendor = approved_vendors[listing_data["vendor_idx"]]
            food = food_entries[listing_data["food_idx"]]
            
            listing = FoodListing(
                vendor_id=vendor.id,
                food_id=food.id,
                title=listing_data["title"],
                description=f"Delicious {food.name} prepared fresh daily",
                price_ngn=listing_data["price"],
                quantity_available=listing_data["qty"],
                serving_size_g=listing_data["serving_g"],
                is_available=True,
                is_active=True,
            )
            db.add(listing)
        
        db.commit()
        print(f"✓ Created {len(listings_data)} food listings")
        
        print("\n✅ Database seeded successfully!")
        print("\n📋 Demo Accounts:")
        print("   Admin: admin@campusprotein.ng / admin123")
        print("   Consumer: student@veritas.edu.ng / student123")
        print("   Vendor (approved): mama_put@veritas.ng / vendor123")
        print("   Vendor (pending): new_vendor@veritas.ng / vendor123")
        
    except Exception as e:
        db.rollback()
        print(f"\n❌ Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
