import getpass

from sqlalchemy import select

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.entities import User


def main():
    email = input("Admin email: ").strip().lower()
    display_name = input("Admin display name: ").strip()
    password = getpass.getpass("Admin password: ")
    confirm_password = getpass.getpass("Confirm password: ")

    if password != confirm_password:
        print("Passwords do not match.")
        return

    if len(password) < 12:
        print("Admin password must be at least 12 characters.")
        return

    db = SessionLocal()

    try:
        existing = db.scalar(
            select(User).where(User.email == email)
        )

        if existing:
            print("An account with this email already exists.")
            return

        admin = User(
            email=email,
            display_name=display_name,
            password_hash=hash_password(password),
            role="admin",
            is_active=True,
        )

        db.add(admin)
        db.commit()

        print(f"Admin account created successfully: {email}")

    finally:
        db.close()


if __name__ == "__main__":
    main()
