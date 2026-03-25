from __future__ import annotations

from datetime import datetime
import logging
from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status

from app.db.client import get_supabase_admin
from app.dependencies.auth import get_current_profile, require_admin
from app.models.support import (
    SUPPORT_CATEGORIES,
    SUPPORT_STATUSES,
    SupportTicketCreateRequest,
    SupportTicketItem,
    SupportTicketUpdateRequest,
    SupportTicketsListResponse,
)

router = APIRouter(prefix="/api/support/tickets", tags=["support"])
logger = logging.getLogger("app.support")


def _parse_dt(value: str | None) -> datetime:
    if not value:
        return datetime.utcnow()
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def _to_support_item(row: dict[str, Any]) -> SupportTicketItem:
    attachment_ids = row.get("attachment_ids")
    parsed_attachment_ids = None
    if isinstance(attachment_ids, list) and attachment_ids:
        try:
            parsed_attachment_ids = [UUID(str(aid)) for aid in attachment_ids]
        except (ValueError, TypeError):
            parsed_attachment_ids = None

    return SupportTicketItem(
        id=row["id"],
        subject=row["subject"],
        category=row.get("category"),
        message=row["message"],
        attachment_ids=parsed_attachment_ids,
        status=row.get("status", "open"),
        admin_reply=row.get("admin_reply"),
        replied_by=row.get("replied_by"),
        created_at=_parse_dt(row.get("created_at")),
        updated_at=_parse_dt(row.get("updated_at")),
    )


def _normalize_filter(value: str | None) -> str | None:
    if value is None:
        return None
    cleaned = value.strip()
    return cleaned or None


def _create_support_record(
    supabase,
    *,
    customer_id: str,
    payload: SupportTicketCreateRequest,
) -> dict[str, Any]:
    """
    Reusable persistence unit for support ticket creation.
    TODO: Add audit logging when shared audit helper is available.
    """
    result = (
        supabase.table("support_tickets")
        .insert(
            {
                "customer_id": customer_id,
                "subject": payload.subject,
                "category": payload.category,
                "message": payload.message,
                "attachment_ids": payload.attachment_ids,
                "status": "open",
            }
        )
        .execute()
    )

    rows = result.data or []
    first = rows[0] if rows else None
    if not isinstance(first, dict):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create support ticket",
        )

    return first


@router.get("", response_model=SupportTicketsListResponse)
async def list_support_tickets(
    ticket_status: str | None = Query(None),
    category: str | None = Query(None),
    customer_id: str | None = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    profile: dict[str, Any] = Depends(get_current_profile),
) -> SupportTicketsListResponse:
    """Get support tickets. Users see their own; admins see all."""
    # Admin-only filters
    customer_id_filter = _normalize_filter(customer_id)
    if customer_id_filter and profile.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="customer_id filter is admin-only",
        )

    # Validate optional filters
    status_filter = _normalize_filter(ticket_status)
    if status_filter:
        status_filter = status_filter.lower()
        if status_filter not in SUPPORT_STATUSES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status. Allowed: {', '.join(sorted(SUPPORT_STATUSES))}",
            )

    category_filter = _normalize_filter(category)
    if category_filter:
        category_filter = category_filter.lower()
        if category_filter not in SUPPORT_CATEGORIES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid category. Allowed: {', '.join(sorted(SUPPORT_CATEGORIES))}",
            )

    supabase = get_supabase_admin()
    query = supabase.table("support_tickets").select("*")

    # Apply ownership filter for non-admin users
    if profile.get("role") != "admin":
        query = query.eq("customer_id", profile.get("id"))
    elif customer_id_filter:
        query = query.eq("customer_id", customer_id_filter)

    if status_filter:
        query = query.eq("status", status_filter)

    if category_filter:
        query = query.eq("category", category_filter)

    count_result = query.execute()
    total_count = len(count_result.data or [])

    result = (
        query.order("created_at", desc=True)
        .limit(limit)
        .offset(offset)
        .execute()
    )

    rows = result.data or []
    if not isinstance(rows, list):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Invalid response payload from database",
        )

    items = [_to_support_item(row) for row in rows if isinstance(row, dict)]

    return SupportTicketsListResponse(
        items=items,
        count=total_count,
        limit=limit,
        offset=offset,
    )


@router.post("", response_model=SupportTicketItem, status_code=status.HTTP_201_CREATED)
async def create_support_ticket(
    payload: SupportTicketCreateRequest,
    profile: dict[str, Any] = Depends(get_current_profile),
) -> SupportTicketItem:
    """Create a new support ticket. Auth required."""
    customer_id = profile.get("id")
    if not customer_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not determine customer ID from profile",
        )
    supabase = get_supabase_admin()
    created_row = _create_support_record(supabase, customer_id=str(customer_id), payload=payload)
    return _to_support_item(created_row)


@router.patch("/{ticket_id}", response_model=SupportTicketItem)
async def update_support_ticket(
    ticket_id: UUID = Path(...),
    payload: SupportTicketUpdateRequest = None,  # type: ignore
    admin: dict[str, Any] = Depends(require_admin),
) -> SupportTicketItem:
    """Update a support ticket (reply/status change). Admin-only."""
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Request body is required",
        )

    supabase = get_supabase_admin()

    # Fetch the existing ticket
    existing_result = (
        supabase.table("support_tickets")
        .select("*")
        .eq("id", str(ticket_id))
        .limit(1)
        .execute()
    )

    rows = existing_result.data or []
    if not rows:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Support ticket not found",
        )

    existing_row = rows[0]
    if not isinstance(existing_row, dict):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Invalid ticket payload",
        )

    # Prepare update payload
    update_data: dict[str, Any] = {
        "updated_at": datetime.utcnow().isoformat(),
    }

    # Add fields from request if provided
    if payload.admin_reply is not None:
        update_data["admin_reply"] = payload.admin_reply
        admin_id = admin.get("id")
        if admin_id:
            update_data["replied_by"] = str(admin_id)
        # If status is not explicitly set and reply is provided, infer status as 'replied'
        if payload.status is None:
            update_data["status"] = "replied"

    if payload.status is not None:
        update_data["status"] = payload.status

    if payload.category is not None:
        update_data["category"] = payload.category

    # Execute the update
    result = (
        supabase.table("support_tickets")
        .update(update_data)
        .eq("id", str(ticket_id))
        .execute()
    )

    rows = result.data or []
    updated_row = rows[0] if rows and isinstance(rows[0], dict) else None
    if not isinstance(updated_row, dict):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update support ticket",
        )

    if updated_row is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update support ticket",
        )
    return _to_support_item(updated_row)
