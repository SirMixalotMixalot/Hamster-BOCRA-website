from __future__ import annotations

from datetime import datetime, timezone
import logging
from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status

from app.db.client import get_supabase_admin
from app.dependencies.auth import get_current_profile, require_admin
from app.models.complaints import (
    COMPLAINT_STATUSES,
    ComplaintCreateRequest,
    ComplaintDetailResponse,
    ComplaintListItem,
    ComplaintUpdateRequest,
    ComplaintsListResponse,
)

router = APIRouter(prefix="/api/complaints", tags=["complaints"])
logger = logging.getLogger("app.complaints")


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


@router.get("", response_model=ComplaintsListResponse)
async def list_complaints(
    status_filter: str | None = Query(None, alias="status"),
    category: str | None = Query(None),
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
    current_profile: dict[str, Any] = Depends(get_current_profile),
) -> ComplaintDetailResponse:
    """Create complaint for authenticated user profile."""
    current_user_id = str(current_profile.get("id") or "")
    if not current_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User ID not found in profile",
        )

    supabase = get_supabase_admin()
    evidence_ids = await _validate_evidence_documents(
        supabase,
        evidence_file_ids=payload.evidence_file_ids,
        current_profile=current_profile,
    )

    now = datetime.now(timezone.utc)
    current_year = now.year
    max_retries = 3
    created_row: dict[str, Any] | None = None

    for attempt in range(max_retries):
        reference_number = _generate_reference_number(supabase, current_year)
        complaint_data = {
            "complainant_id": current_user_id,
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

    # TODO: hook audit helper once centralized audit module is available.
    return _to_detail_item(updated_row, include_complainant_id=True)
