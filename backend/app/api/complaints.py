from __future__ import annotations

from collections import Counter
from datetime import datetime, timedelta, timezone
import logging
from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status

from app.db.client import get_supabase_admin
from app.core.email import send_email
from app.core.config import get_settings
from app.dependencies.auth import get_current_profile, require_admin
from app.models.complaints import (
    COMPLAINT_STATUSES,
    ComplaintCreateRequest,
    ComplaintDetailResponse,
    ComplaintListItem,
    ComplaintVerificationResponse,
    ComplaintVerificationSendRequest,
    ComplaintVerificationVerifyRequest,
    ComplaintUpdateRequest,
    ComplaintsListResponse,
)
from app.services.email_verification import create_or_refresh_code, verify_code
from app.services.email_verification import is_recently_verified

router = APIRouter(prefix="/api/complaints", tags=["complaints"])
logger = logging.getLogger("app.complaints")

SECTORS = ("telecom", "broadcasting", "postal", "internet")
KNOWN_COMPANIES = ("BTC", "MASCOM", "ORANGE", "BOFINET")


def _parse_dt(value: str | None) -> datetime:
    if not value:
        return datetime.now(timezone.utc)
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def _normalize_filter(value: str | None) -> str | None:
    if value is None:
        return None
    cleaned = value.strip()
    return cleaned or None


def _parse_uuid_list(value: Any) -> list[UUID] | None:
    if not isinstance(value, list):
        return None
    parsed: list[UUID] = []
    for raw in value:
        try:
            parsed.append(UUID(str(raw)))
        except (ValueError, TypeError):
            logger.warning("Ignoring invalid evidence_file_id value=%s", raw)
    return parsed or None


def _to_list_item(row: dict[str, Any]) -> ComplaintListItem:
    return ComplaintListItem(
        id=row["id"],
        reference_number=row.get("reference_number"),
        subject=row["subject"],
        category=row.get("category"),
        status=row.get("status", "open"),
        created_at=_parse_dt(row.get("created_at")),
        updated_at=_parse_dt(row.get("updated_at")),
        resolved_at=_parse_dt(row.get("resolved_at")) if row.get("resolved_at") else None,
    )


def _to_detail_item(row: dict[str, Any], *, include_complainant_id: bool) -> ComplaintDetailResponse:
    return ComplaintDetailResponse(
        id=row["id"],
        reference_number=row.get("reference_number"),
        subject=row["subject"],
        category=row.get("category"),
        description=row["description"],
        status=row.get("status", "open"),
        admin_response=row.get("admin_response"),
        evidence_file_ids=_parse_uuid_list(row.get("evidence_file_ids")),
        resolved_by=row.get("resolved_by"),
        resolved_at=_parse_dt(row.get("resolved_at")) if row.get("resolved_at") else None,
        created_at=_parse_dt(row.get("created_at")),
        updated_at=_parse_dt(row.get("updated_at")),
        complainant_id=row.get("complainant_id") if include_complainant_id else None,
    )


def _generate_reference_number(supabase_admin, current_year: int) -> str:
    """
    Generate a reference number in format BOCRA-CMP-YYYY-NNNN.
    Queries max existing number for the year and increments.
    """
    result = (
        supabase_admin.table("complaints")
        .select("reference_number")
        .filter("reference_number", "ilike", f"BOCRA-CMP-{current_year}-%")
        .execute()
    )

    rows = result.data or []
    max_num = 0
    for row in rows:
        if isinstance(row, dict) and row.get("reference_number"):
            parts = str(row["reference_number"]).split("-")
            try:
                if len(parts) == 5:
                    max_num = max(max_num, int(parts[4]))
            except ValueError:
                continue

    next_num = max_num + 1
    return f"BOCRA-CMP-{current_year}-{next_num:04d}"


async def _validate_evidence_documents(
    supabase,
    *,
    evidence_file_ids: list[UUID] | None,
    current_profile: dict[str, Any],
) -> list[str] | None:
    if not evidence_file_ids:
        return None

    is_admin = current_profile.get("role") == "admin"
    user_id = str(current_profile.get("id") or "")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User ID not found in profile",
        )

    resolved_ids: list[str] = []
    for evidence_id in evidence_file_ids:
        result = (
            supabase.table("documents")
            .select("id,uploaded_by,category")
            .eq("id", str(evidence_id))
            .limit(1)
            .execute()
        )

        rows = result.data or []
        first_row = rows[0] if rows else None
        if not isinstance(first_row, dict):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"evidence file '{evidence_id}' not found",
            )

        if not is_admin and str(first_row.get("uploaded_by")) != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"evidence file '{evidence_id}' does not belong to current user",
            )

        category = str(first_row.get("category") or "").lower()
        if category not in {"evidence", "application"}:
            # TODO: tighten category policy once document usage matrix is finalized.
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"evidence file '{evidence_id}' has unsupported category '{category}'",
            )

        resolved_ids.append(str(evidence_id))

    return resolved_ids


def _insert_status_log(
    supabase,
    *,
    complaint_id: str,
    old_status: str | None,
    new_status: str,
    changed_by: str,
    note: str | None,
) -> None:
    try:
        (
            supabase.table("complaint_status_log")
            .insert(
                {
                    "complaint_id": complaint_id,
                    "old_status": old_status,
                    "new_status": new_status,
                    "changed_by": changed_by,
                    "note": note,
                    "created_at": datetime.now(timezone.utc).isoformat(),
                }
            )
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Complaint updated but failed to write status log",
        ) from exc


def _derive_sector(category: str | None, subject: str | None, description: str | None) -> str:
    text = " ".join([category or "", subject or "", description or ""]).lower()
    if "broadcast" in text or "radio" in text or "tv" in text:
        return "broadcasting"
    if "postal" in text or "courier" in text or "parcel" in text:
        return "postal"
    if "internet" in text or "isp" in text or "data" in text or "broadband" in text:
        return "internet"
    return "telecom"


def _derive_company(subject: str | None, description: str | None) -> str:
    text = " ".join([subject or "", description or ""]).upper()
    for company in KNOWN_COMPANIES:
        if company in text:
            return company
    return "OTHER"


def _get_profile_full_name(supabase, user_id: str) -> str | None:
    result = (
        supabase.table("profiles")
        .select("full_name")
        .eq("id", user_id)
        .limit(1)
        .execute()
    )
    rows = result.data or []
    first = rows[0] if rows else None
    if isinstance(first, dict):
        full_name = str(first.get("full_name") or "").strip()
        return full_name or None
    return None


def _get_auth_email(supabase, user_id: str) -> str | None:
    try:
        admin_client = getattr(supabase.auth, "admin", None)
        if admin_client is None:
            return None
        response = admin_client.get_user_by_id(user_id)
        user = getattr(response, "user", None)
        email = getattr(user, "email", None)
        return str(email).strip() if email else None
    except Exception as exc:
        logger.warning("complaint_notification_lookup_failed user_id=%s error=%s", user_id, exc)
        return None


def _send_complaint_status_email(
    supabase,
    *,
    complainant_id: str,
    reference_number: str | None,
    subject: str,
    new_status: str,
) -> None:
    email = _get_auth_email(supabase, complainant_id)
    if not email:
        return
    full_name = _get_profile_full_name(supabase, complainant_id) or "Customer"
    complaint_ref = reference_number or "N/A"
    email_subject = f"BOCRA Complaint Status Update - {complaint_ref}"
    body = (
        f"Dear {full_name},\n\n"
        "Your complaint status has been updated.\n"
        f"Complaint Reference: {complaint_ref}\n"
        f"Subject: {subject}\n"
        f"New Status: {new_status}\n\n"
        "Please log in to the BOCRA portal to view details.\n\n"
        "Regards,\nBOCRA"
    )
    send_email(to_email=email, subject=email_subject, body=body)


def _build_verification_key(email: str) -> str:
    return email.lower()


@router.post("/verification/send", response_model=ComplaintVerificationResponse)
async def send_complaint_verification_code(
    payload: ComplaintVerificationSendRequest,
) -> ComplaintVerificationResponse:
    settings = get_settings()
    verification_key = _build_verification_key(payload.email)
    code, retry_after = create_or_refresh_code(verification_key)
    if retry_after > 0:
        return ComplaintVerificationResponse(
            message="Please wait before requesting another verification code",
            retry_after_seconds=retry_after,
        )

    subject = "BOCRA Complaint Verification Code"
    body = (
        "Use this code to verify your complaint submission:\n\n"
        f"{code}\n\n"
        "The code expires in 10 minutes.\n"
        "If you did not request this code, you can ignore this email."
    )

    if settings.debug:
        logger.info(
            "complaint_verification_debug_code email=%s code=%s",
            payload.email,
            code,
        )

    sent = send_email(to_email=payload.email, subject=subject, body=body)
    if not sent:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Verification email service is not configured",
        )

    return ComplaintVerificationResponse(message="Verification code sent")


@router.post("/verification/verify", response_model=ComplaintVerificationResponse)
async def verify_complaint_verification_code(
    payload: ComplaintVerificationVerifyRequest,
) -> ComplaintVerificationResponse:
    verification_key = _build_verification_key(payload.email)
    is_valid, message = verify_code(verification_key, payload.code)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message,
        )

    return ComplaintVerificationResponse(message=message)


def build_complaints_analytics(supabase) -> dict[str, Any]:
    result = supabase.table("complaints").select(
        "subject,category,description,status,created_at"
    ).execute()

    rows = [row for row in (result.data or []) if isinstance(row, dict)]
    now = datetime.now(timezone.utc)
    today = now.date()
    # Build explicit rolling 7-day window oldest->newest.
    trend_days = [today - timedelta(days=offset) for offset in range(6, -1, -1)]
    trend_map: dict[str, dict[str, int]] = {
        day.isoformat(): {sector: 0 for sector in SECTORS} for day in trend_days
    }

    sector_totals: Counter[str] = Counter()
    company_totals: Counter[str] = Counter()
    company_totals_by_sector: dict[str, Counter[str]] = {sector: Counter() for sector in SECTORS}
    open_count = 0

    for row in rows:
        created_at = _parse_dt(str(row.get("created_at") or ""))
        sector = _derive_sector(
            str(row.get("category") or ""),
            str(row.get("subject") or ""),
            str(row.get("description") or ""),
        )
        company = _derive_company(
            str(row.get("subject") or ""),
            str(row.get("description") or ""),
        )

        sector_totals[sector] += 1
        company_totals[company] += 1
        company_totals_by_sector[sector][company] += 1

        status_value = str(row.get("status") or "").lower()
        if status_value in {"open", "investigating"}:
            open_count += 1

        day_key = created_at.date().isoformat()
        if day_key in trend_map:
            trend_map[day_key][sector] += 1

    trend_items = [
        {"date": day_key, **counts}
        for day_key, counts in sorted(trend_map.items(), key=lambda item: item[0])
    ]

    sector_alerts: list[dict[str, Any]] = []
    for sector in SECTORS:
        historical = [item[sector] for item in trend_items[:-1]]
        normal = (sum(historical) / len(historical)) if historical else 0.0
        if normal <= 0:
            normal = float(trend_items[-1][sector]) if trend_items else 0.0
        threshold = normal * 1.25
        today_count = float(trend_items[-1][sector]) if trend_items else 0.0
        sector_alerts.append(
            {
                "sector": sector,
                "total": int(sector_totals.get(sector, 0)),
                "normal": round(normal, 2),
                "threshold": round(threshold, 2),
                "today": int(today_count),
                "is_alert": today_count > threshold and threshold > 0,
            }
        )

    sector_breakdown = [
        {"sector": sector, "total": int(sector_totals.get(sector, 0))}
        for sector in SECTORS
    ]
    company_breakdown = [
        {"company": company, "total": int(total)}
        for company, total in company_totals.most_common()
    ]
    company_breakdown_by_sector = {
        sector: [
            {"company": company, "total": int(total)}
            for company, total in company_totals_by_sector[sector].most_common()
        ]
        for sector in SECTORS
    }

    return {
        "total_complaints": len(rows),
        "open_complaints": open_count,
        "trend_days": len(trend_items),
        "trend": trend_items,
        "sector_breakdown": sector_breakdown,
        "company_breakdown": company_breakdown,
        "company_breakdown_by_sector": company_breakdown_by_sector,
        "sector_alerts": sector_alerts,
        "alert_count": sum(1 for item in sector_alerts if item["is_alert"]),
    }


@router.get("/analytics")
async def complaints_analytics(
    current_profile: dict[str, Any] = Depends(require_admin),
) -> dict[str, Any]:
    """
    Admin analytics for dashboard:
    - totals by sector and company
    - 7-day trend (4-sector lines)
    - normal baseline and spike alerts (>25% over normal)
    """
    _ = current_profile
    supabase = get_supabase_admin()
    return build_complaints_analytics(supabase)


@router.get("", response_model=ComplaintsListResponse)
async def list_complaints(
    status_filter: str | None = Query(None, alias="status"),
    category: str | None = Query(None),
    q: str | None = Query(None, description="Search by complaint reference number"),
    complainant_id: str | None = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_profile: dict[str, Any] = Depends(get_current_profile),
) -> ComplaintsListResponse:
    """List complaints. Users see own records; admins may view all."""
    is_admin = current_profile.get("role") == "admin"
    current_user_id = str(current_profile.get("id") or "")
    if not current_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User ID not found in profile",
        )

    normalized_status = _normalize_filter(status_filter)
    if normalized_status:
        normalized_status = normalized_status.lower()
        if normalized_status not in COMPLAINT_STATUSES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status. Allowed: {', '.join(sorted(COMPLAINT_STATUSES))}",
            )

    normalized_category = _normalize_filter(category)
    normalized_query = _normalize_filter(q)
    normalized_complainant = _normalize_filter(complainant_id)
    if normalized_complainant and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="complainant_id filter is admin-only",
        )

    supabase = get_supabase_admin()
    query = supabase.table("complaints").select(
        "id,reference_number,subject,category,status,created_at,updated_at,resolved_at,complainant_id"
    )

    if not is_admin:
        query = query.eq("complainant_id", current_user_id)
    elif normalized_complainant:
        query = query.eq("complainant_id", normalized_complainant)

    if normalized_status:
        query = query.eq("status", normalized_status)

    if normalized_category:
        query = query.eq("category", normalized_category)

    if normalized_query:
        query = query.ilike("reference_number", f"%{normalized_query}%")

    count_result = query.execute()
    total_count = len(count_result.data or [])

    result = query.order("created_at", desc=True).limit(limit).offset(offset).execute()

    rows = result.data or []
    if not isinstance(rows, list):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Invalid response payload from database",
        )

    items = [_to_list_item(row) for row in rows if isinstance(row, dict)]

    return ComplaintsListResponse(
        items=items,
        count=total_count,
        limit=limit,
        offset=offset,
    )


@router.post("", response_model=ComplaintDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_complaint(
    payload: ComplaintCreateRequest,
) -> ComplaintDetailResponse:
    """Create complaint after email verification. Supports guest submission."""

    verification_key = _build_verification_key(payload.email)
    if not is_recently_verified(verification_key):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email verification is required before submitting a complaint",
        )

    supabase = get_supabase_admin()
    evidence_ids = None
    if payload.evidence_file_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Evidence uploads require an authenticated account",
        )

    now = datetime.now(timezone.utc)
    current_year = now.year
    max_retries = 3
    created_row: dict[str, Any] | None = None

    for attempt in range(max_retries):
        reference_number = _generate_reference_number(supabase, current_year)
        complaint_data = {
            "complainant_id": None,
            "reference_number": reference_number,
            "subject": payload.subject,
            "category": payload.category,
            "description": payload.description,
            "status": "open",
            "evidence_file_ids": evidence_ids,
            "created_at": now.isoformat(),
            "updated_at": now.isoformat(),
        }

        try:
            result = supabase.table("complaints").insert(complaint_data).execute()
            rows = result.data or []
            first_row = rows[0] if rows else None
            if isinstance(first_row, dict):
                created_row = first_row
                break
        except Exception as exc:
            error_str = str(exc).lower()
            if "unique" in error_str and "reference" in error_str and attempt < max_retries - 1:
                logger.warning(
                    "Complaint reference collision, retrying attempt=%d/%d error=%s",
                    attempt + 1,
                    max_retries,
                    exc,
                )
                continue
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create complaint",
            )

    if not isinstance(created_row, dict):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create complaint",
        )

    # TODO: hook audit helper once centralized audit module is available.
    return _to_detail_item(created_row, include_complainant_id=False)


@router.get("/track/{reference_number}", response_model=ComplaintDetailResponse)
async def track_complaint(reference_number: str = Path(..., min_length=8, max_length=80)) -> ComplaintDetailResponse:
    """Public tracking by complaint reference number."""
    normalized_reference = reference_number.strip().upper()
    supabase = get_supabase_admin()

    result = (
        supabase.table("complaints")
        .select("*")
        .ilike("reference_number", normalized_reference)
        .limit(1)
        .execute()
    )

    rows = result.data or []
    first_row = rows[0] if rows else None
    if not isinstance(first_row, dict):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found",
        )

    return _to_detail_item(first_row, include_complainant_id=False)


@router.get("/{complaint_id}", response_model=ComplaintDetailResponse)
async def get_complaint(
    complaint_id: UUID = Path(...),
    current_profile: dict[str, Any] = Depends(get_current_profile),
) -> ComplaintDetailResponse:
    """Get complaint detail for owner or admin."""
    supabase = get_supabase_admin()
    is_admin = current_profile.get("role") == "admin"
    current_user_id = str(current_profile.get("id") or "")

    result = (
        supabase.table("complaints")
        .select("*")
        .eq("id", str(complaint_id))
        .limit(1)
        .execute()
    )

    rows = result.data or []
    first_row = rows[0] if rows else None
    if not isinstance(first_row, dict):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found",
        )

    owner_id = str(first_row.get("complainant_id") or "")
    if not is_admin and owner_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )

    return _to_detail_item(first_row, include_complainant_id=is_admin)


@router.patch("/{complaint_id}", response_model=ComplaintDetailResponse)
async def update_complaint(
    payload: ComplaintUpdateRequest,
    complaint_id: UUID = Path(...),
    admin: dict[str, Any] = Depends(require_admin),
) -> ComplaintDetailResponse:
    """Admin-only complaint update (status/response/resolution fields)."""
    admin_id = str(admin.get("id") or "")
    if not admin_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin ID not found in profile",
        )

    supabase = get_supabase_admin()
    existing_result = (
        supabase.table("complaints")
        .select("*")
        .eq("id", str(complaint_id))
        .limit(1)
        .execute()
    )

    rows = existing_result.data or []
    existing_row = rows[0] if rows else None
    if not isinstance(existing_row, dict):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found",
        )

    old_status = str(existing_row.get("status") or "open")
    new_status = payload.status if payload.status is not None else old_status

    update_data: dict[str, Any] = {
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }

    if payload.status is not None:
        update_data["status"] = payload.status

    if payload.admin_response is not None:
        update_data["admin_response"] = payload.admin_response
        if payload.resolved_by is None and payload.status in {"resolved", "closed"}:
            update_data["resolved_by"] = admin_id

    if payload.category is not None:
        update_data["category"] = payload.category

    if payload.resolved_by is not None:
        update_data["resolved_by"] = str(payload.resolved_by)

    if payload.resolved_at is not None:
        update_data["resolved_at"] = payload.resolved_at.isoformat()

    if new_status in {"resolved", "closed"} and payload.resolved_at is None:
        update_data["resolved_at"] = datetime.now(timezone.utc).isoformat()
        if "resolved_by" not in update_data:
            update_data["resolved_by"] = admin_id

    result = (
        supabase.table("complaints")
        .update(update_data)
        .eq("id", str(complaint_id))
        .execute()
    )

    updated_rows = result.data or []
    updated_row = updated_rows[0] if updated_rows else None
    if not isinstance(updated_row, dict):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update complaint",
        )

    if new_status != old_status:
        _insert_status_log(
            supabase,
            complaint_id=str(complaint_id),
            old_status=old_status,
            new_status=new_status,
            changed_by=admin_id,
            note=payload.admin_response,
        )
        complainant_id = str(existing_row.get("complainant_id") or "")
        if complainant_id:
            reference_number_raw = existing_row.get("reference_number")
            _send_complaint_status_email(
                supabase,
                complainant_id=complainant_id,
                reference_number=str(reference_number_raw) if reference_number_raw else None,
                subject=str(existing_row.get("subject") or "Complaint"),
                new_status=new_status,
            )

    # TODO: hook audit helper once centralized audit module is available.
    return _to_detail_item(updated_row, include_complainant_id=True)
