from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.main import app
from app.models.entities import User, VendorProfile
from app.core.security import hash_password

import pytest


@pytest.fixture
def client():
    test_client = setup_client()
    yield test_client
    test_client.close()
    teardown()


TEST_ENGINE = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(
    bind=TEST_ENGINE,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)


def create_user(db, email, role):
    user = User(
        email=email,
        display_name=email.split("@")[0],
        password_hash=hash_password("SecurePass123!"),
        role=role,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def create_vendor(db, user_id, status="pending"):
    vendor = VendorProfile(
        user_id=user_id,
        business_name="Test Protein Kitchen",
        description="Test vendor",
        location="Veritas University",
        opening_time="08:00",
        closing_time="18:00",
        approval_status=status,
    )
    db.add(vendor)
    db.commit()
    db.refresh(vendor)
    return vendor


def login(client, email):
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": email,
            "password": "SecurePass123!",
        },
    )
    assert response.status_code == 200
    return response.json()["access_token"]


def headers(token):
    return {"Authorization": f"Bearer {token}"}


def setup_client():
    Base.metadata.create_all(bind=TEST_ENGINE)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    return TestClient(app)


def teardown():
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=TEST_ENGINE)


def test_pending_vendor_requires_admin(client):
    response = client.get("/api/v1/vendors/pending")

    assert response.status_code == 401


def test_consumer_cannot_approve_vendor(client):
    db = TestingSessionLocal()

    consumer = create_user(db, "consumer@example.com", "consumer")
    vendor_user = create_user(db, "vendor@example.com", "vendor")
    vendor = create_vendor(db, vendor_user.id)

    consumer_email = consumer.email
    db.close()
    
    token = login(client, consumer_email)

    response = client.post(
        f"/api/v1/vendors/{vendor.id}/approve",
        headers=headers(token),
    )

    assert response.status_code == 403


def test_admin_can_list_pending_vendors(client):
    db = TestingSessionLocal()

    admin = create_user(db, "admin@example.com", "admin")
    vendor_user = create_user(db, "vendor@example.com", "vendor")
    create_vendor(db, vendor_user.id)

    admin_email = admin.email
    db.close()

    token = login(client, admin_email)

    response = client.get(
        "/api/v1/vendors/pending",
        headers=headers(token),
    )

    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["approval_status"] == "pending"


def test_admin_can_approve_vendor(client):
    db = TestingSessionLocal()

    admin = create_user(db, "admin@example.com", "admin")
    vendor_user = create_user(db, "vendor@example.com", "vendor")
    vendor = create_vendor(db, vendor_user.id)

    admin_email = admin.email
    db.close()

    token = login(client, admin_email)

    response = client.post(
        f"/api/v1/vendors/{vendor.id}/approve",
        headers=headers(token),
    )

    assert response.status_code == 200
    assert response.json()["approval_status"] == "approved"


def test_admin_can_reject_vendor(client):
    db = TestingSessionLocal()

    admin = create_user(db, "admin@example.com", "admin")
    vendor_user = create_user(db, "vendor@example.com", "vendor")
    vendor = create_vendor(db, vendor_user.id)

    admin_email = admin.email
    db.close()

    token = login(client, admin_email)

    response = client.post(
        f"/api/v1/vendors/{vendor.id}/reject",
        headers=headers(token),
        json={"rejection_reason": "Incomplete application"},
    )

    assert response.status_code == 200
    assert response.json()["approval_status"] == "rejected"
    assert response.json()["rejection_reason"] == "Incomplete application"


def test_admin_can_suspend_vendor(client):
    db = TestingSessionLocal()

    admin = create_user(db, "admin@example.com", "admin")
    vendor_user = create_user(db, "vendor@example.com", "vendor")
    vendor = create_vendor(db, vendor_user.id, status="approved")

    admin_email = admin.email
    db.close()

    token = login(client, admin_email)

    response = client.post(
        f"/api/v1/vendors/{vendor.id}/suspend",
        headers=headers(token),
    )

    assert response.status_code == 200
    assert response.json()["approval_status"] == "suspended"


def test_vendor_not_found(client):
    db = TestingSessionLocal()

    admin = create_user(db, "admin@example.com", "admin")

    admin_email = admin.email
    db.close()

    token = login(client, admin_email)

    response = client.post(
        "/api/v1/vendors/99999/approve",
        headers=headers(token),
    )

    assert response.status_code == 404


def test_suspended_vendor_cannot_be_approved_directly(client):
    db = TestingSessionLocal()

    admin = create_user(db, "admin@example.com", "admin")
    vendor_user = create_user(db, "vendor@example.com", "vendor")
    vendor = create_vendor(db, vendor_user.id, status="suspended")

    admin_email = admin.email
    db.close()

    token = login(client, admin_email)

    response = client.post(
        f"/api/v1/vendors/{vendor.id}/approve",
        headers=headers(token),
    )

    assert response.status_code == 409


