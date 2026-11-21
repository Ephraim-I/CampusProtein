from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.auth import require_role
from app.models.entities import User, VendorProfile
from app.schemas.vendors import VendorReviewRequest, VendorReviewResponse

router = APIRouter(prefix="/vendors", tags=["Vendor Management"])


@router.get(
    "/pending",
    response_model=list[VendorReviewResponse],
)
def list_pending_vendors(
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("admin")),
):
    return db.scalars(
        select(VendorProfile)
        .where(VendorProfile.approval_status == "pending")
        .order_by(VendorProfile.id)
    ).all()


@router.post(
    "/{vendor_id}/approve",
    response_model=VendorReviewResponse,
)
def approve_vendor(
    vendor_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("admin")),
):
    vendor = db.get(VendorProfile, vendor_id)

    if vendor is None:
        raise HTTPException(status_code=404, detail="Vendor not found")

    if vendor.approval_status == "suspended":
        raise HTTPException(
            status_code=409,
            detail="Suspended vendors cannot be approved directly",
        )

    vendor.approval_status = "approved"
    vendor.rejection_reason = None

    db.commit()
    db.refresh(vendor)

    return vendor


@router.post(
    "/{vendor_id}/reject",
    response_model=VendorReviewResponse,
)
def reject_vendor(
    vendor_id: int,
    data: VendorReviewRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("admin")),
):
    vendor = db.get(VendorProfile, vendor_id)

    if vendor is None:
        raise HTTPException(status_code=404, detail="Vendor not found")

    if vendor.approval_status == "approved":
        raise HTTPException(
            status_code=409,
            detail="Approved vendors must be suspended instead of rejected",
        )

    vendor.approval_status = "rejected"
    vendor.rejection_reason = (
        data.rejection_reason or "Application rejected"
    )

    db.commit()
    db.refresh(vendor)

    return vendor


@router.post(
    "/{vendor_id}/suspend",
    response_model=VendorReviewResponse,
)
def suspend_vendor(
    vendor_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("admin")),
):
    vendor = db.get(VendorProfile, vendor_id)

    if vendor is None:
        raise HTTPException(status_code=404, detail="Vendor not found")

    vendor.approval_status = "suspended"
    vendor.rejection_reason = None

    db.commit()
    db.refresh(vendor)

    return vendor
