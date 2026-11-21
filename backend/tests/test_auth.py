import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.main import app

# Ensure all models are registered with Base
from app.models.entities import User, VendorProfile, FoodCatalogue, FoodListing


TEST_ENGINE = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(
    bind=TEST_ENGINE,
    autoflush=False,
    autocommit=False,
)


@pytest.fixture
def client():
    Base.metadata.create_all(bind=TEST_ENGINE)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=TEST_ENGINE)


def register_consumer(client, email="consumer@example.com"):
    return client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "display_name": "Test Consumer",
            "password": "SecurePass123!",
            "role": "consumer",
        },
    )


def register_vendor(client, email="vendor@example.com"):
    return client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "display_name": "Test Vendor",
            "password": "SecurePass123!",
            "role": "vendor",
            "business_name": "Test Kitchen",
            "location": "Veritas University",
            "opening_time": "08:00",
            "closing_time": "18:00",
        },
    )


def auth_headers(response):
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_consumer_registration(client):
    response = register_consumer(client)

    assert response.status_code == 201
    data = response.json()

    assert data["user"]["email"] == "consumer@example.com"
    assert data["user"]["role"] == "consumer"
    assert "access_token" in data
    assert "password_hash" not in data["user"]


def test_vendor_registration(client):
    response = register_vendor(client)

    assert response.status_code == 201
    assert response.json()["user"]["role"] == "vendor"


def test_duplicate_registration(client):
    register_consumer(client)

    response = register_consumer(client)

    assert response.status_code == 409


def test_admin_registration_blocked(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "admin@example.com",
            "display_name": "Admin",
            "password": "SecurePass123!",
            "role": "admin",
        },
    )

    assert response.status_code == 422


def test_login_success(client):
    register_consumer(client)

    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "consumer@example.com",
            "password": "SecurePass123!",
        },
    )

    assert response.status_code == 200
    assert "access_token" in response.json()


def test_login_wrong_password(client):
    register_consumer(client)

    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "consumer@example.com",
            "password": "WrongPassword123!",
        },
    )

    assert response.status_code == 401


def test_me_requires_authentication(client):
    response = client.get("/api/v1/auth/me")

    assert response.status_code == 401


def test_me_with_valid_token(client):
    registration = register_consumer(client)

    response = client.get(
        "/api/v1/auth/me",
        headers=auth_headers(registration),
    )

    assert response.status_code == 200
    assert response.json()["email"] == "consumer@example.com"


def test_consumer_role_access(client):
    registration = register_consumer(client)

    response = client.get(
        "/api/v1/auth/consumer-only",
        headers=auth_headers(registration),
    )

    assert response.status_code == 200


def test_consumer_cannot_access_vendor_route(client):
    registration = register_consumer(client)

    response = client.get(
        "/api/v1/auth/vendor-only",
        headers=auth_headers(registration),
    )

    assert response.status_code == 403


def test_vendor_access(client):
    registration = register_vendor(client)

    response = client.get(
        "/api/v1/auth/vendor-only",
        headers=auth_headers(registration),
    )

    assert response.status_code == 200


def test_vendor_profile_pending(client):
    register_vendor(client)

    db = TestingSessionLocal()

    try:
        profile = db.query(VendorProfile).first()
        assert profile is not None
        assert profile.approval_status == "pending"
    finally:
        db.close()


def test_invalid_token(client):
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer invalid.token.value"},
    )

    assert response.status_code == 401


def test_short_password_rejected(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "short@example.com",
            "display_name": "Short Password",
            "password": "123",
            "role": "consumer",
        },
    )

    assert response.status_code == 422
