from __future__ import annotations

from typing import Any, cast
from uuid import UUID

from fastapi import APIRouter, Depends, Query

from app.db.client import get_supabase_admin
from app.dependencies.auth import get_current_profile
from app.models.applications import ApplicationListItem
from app.models.batch import PortalBatchResponse
from app.models.complaints import ComplaintListItem
from app.models.support import SupportTicketItem

router = APIRouter(prefix="/api/batch", tags=["batch"])


@router.get("/portal", response_model=PortalBatchResponse)
async def get_portal_batch(
    include_applications: bool = Query(True),
    include_complaints: bool = Query(True),
    include_support_tickets: bool = Query(True),
    limit: int = Query(50, ge=1, le=200),
    current_profile: dict[str, Any] = Depends(get_current_profile),
) -> PortalBatchResponse:
    """Fetch portal datasets in one request to reduce client round-trips."""
    supabase = get_supabase_admin()
    current_user_id = UUID(current_profile["id"])
    is_admin = current_profile.get("role") == "admin"

    applications: list[ApplicationListItem] = []
    complaints: list[ComplaintListItem] = []
    support_tickets: list[SupportTicketItem] = []

    if include_applications:
        query = (
            supabase.table("applications")
            .select("id, reference_number, licence_type, status, submitted_at, created_at, updated_at")
            .order("updated_at", desc=True)
            .limit(limit)
        )
        if not is_admin:
            query = query.eq("applicant_id", str(current_user_id))
        result = query.execute()
        for row in result.data or []:
            row_data = cast(dict[str, Any], row)
            applications.append(ApplicationListItem(**row_data))

    if include_complaints:
        query = (
            supabase.table("complaints")
            .select("id, reference_number, subject, category, status, created_at, updated_at, resolved_at")
            .order("updated_at", desc=True)
            .limit(limit)
        )
        if not is_admin:
            query = query.eq("complainant_id", str(current_user_id))
        result = query.execute()
        for row in result.data or []:
            row_data = cast(dict[str, Any], row)
            complaints.append(ComplaintListItem(**row_data))

    if include_support_tickets:
        query = (
            supabase.table("support_tickets")
            .select("id, subject, category, message, attachment_ids, status, admin_reply, replied_by, created_at, updated_at")
            .order("updated_at", desc=True)
            .limit(limit)
        )
        if not is_admin:
            query = query.eq("customer_id", str(current_user_id))
        result = query.execute()
        for row in result.data or []:
            row_data = cast(dict[str, Any], row)
            support_tickets.append(SupportTicketItem(**row_data))

    return PortalBatchResponse(
        applications=applications,
        complaints=complaints,
        support_tickets=support_tickets,
    )
