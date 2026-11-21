from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import select
from sqlalchemy.orm import Session
import jwt

from app.core.database import get_db
from app.core.config import settings
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
)
from app.models.entities import User, VendorProfile
from app.schemas.auth import UserRegister, UserLogin, TokenResponse, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or missing authentication credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if credentials is None:
        raise unauthorized

    try:
        payload = decode_access_token(credentials.credentials)
        user_id = payload.get("sub")

        if not user_id:
            raise unauthorized

        user = db.get(User, int(user_id))

    except (jwt.InvalidTokenError, ValueError, TypeError):
        raise unauthorized

    if user is None or not user.is_active:
        raise unauthorized

    return user


def require_role(*allowed_roles: str):
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this resource",
            )
        return current_user

    return role_checker


def create_token_response(user: User) -> TokenResponse:
    token = create_access_token(subject=str(user.id))

    return TokenResponse(
        access_token=token,
        expires_in=settings.access_token_expire_minutes * 60,
        user=UserResponse.model_validate(user),
    )


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    data: UserRegister,
    db: Session = Depends(get_db),
):
    normalized_email = data.email.strip().lower()

    existing_user = db.scalar(
        select(User).where(User.email == normalized_email)
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    if data.role == "vendor":
        required_vendor_fields = {
            "business_name": data.business_name,
            "location": data.location,
            "opening_time": data.opening_time,
            "closing_time": data.closing_time,
        }

        missing_fields = [
            field
            for field, value in required_vendor_fields.items()
            if not value or not value.strip()
        ]

        if missing_fields:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={
                    "message": "Vendor registration requires business details",
                    "missing_fields": missing_fields,
                },
            )

    user = User(
        email=normalized_email,
        display_name=data.display_name.strip(),
        password_hash=hash_password(data.password),
        role=data.role,
        is_active=True,
    )

    db.add(user)
    db.flush()

    if data.role == "vendor":
        vendor_profile = VendorProfile(
            user_id=user.id,
            business_name=data.business_name.strip(),
            description=data.description or "",
            location=data.location.strip(),
            opening_time=data.opening_time.strip(),
            closing_time=data.closing_time.strip(),
            approval_status="pending",
        )

        db.add(vendor_profile)

    db.commit()
    db.refresh(user)

    return create_token_response(user)


@router.post("/login", response_model=TokenResponse)
def login(
    data: UserLogin,
    db: Session = Depends(get_db),
):
    normalized_email = data.email.strip().lower()

    user = db.scalar(
        select(User).where(User.email == normalized_email)
    )

    # Generic error prevents account enumeration.
    if user is None or not verify_password(
        data.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been disabled",
        )

    return create_token_response(user)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/consumer-only")
def consumer_only(
    current_user: User = Depends(require_role("consumer")),
):
    return {"message": "Consumer access granted"}


@router.get("/vendor-only")
def vendor_only(
    current_user: User = Depends(require_role("vendor")),
):
    return {"message": "Vendor access granted"}


@router.get("/admin-only")
def admin_only(
    current_user: User = Depends(require_role("admin")),
):
    return {"message": "Admin access granted"}
