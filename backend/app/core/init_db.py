from app.core.database import Base, engine
from app.models import (
    User,
    VendorProfile,
    FoodCatalogue,
    FoodListing,
)


def initialize_database():
    Base.metadata.create_all(bind=engine)
    print("CampusProtein database initialized successfully.")
    print("Tables:", list(Base.metadata.tables.keys()))


if __name__ == "__main__":
    initialize_database()
