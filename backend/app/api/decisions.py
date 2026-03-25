from __future__ import annotations

from datetime import datetime
import logging
from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.db.client import get_supabase_admin
from app.dependencies.auth import require_admin
from app.models.decisions import (
    DECISION_TYPES,
    DecisionCreateRequest,
    DecisionItem,
    DecisionsListResponse,
)

router = APIRouter(prefix="/api/decisions", tags=["decisions"])
logger = logging.getLogger("app.decisions")


def _parse_dt(value: str | None) -> datetime | None:
    if not value:
        return None
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def _to_decision_item(row: dict[str, Any]) -> DecisionItem:
    return DecisionItem(
        id=row["id"],
        title=row["title"],
        summary=row.get("summary"),
        decision_type=row.get("decision_type"),
        document_url=row.get("document_url"),
        decided_at=_parse_dt(row.get("decided_at")),
        created_at=_parse_dt(row.get("created_at")) or datetime.utcnow(),
    )


def _normalize_filter(value: str | None) -> str | None:
    if value is None:
        return None
    cleaned = value.strip()
    return cleaned or None


def _create_decision_record(
    supabase,
    *,
    payload: DecisionCreateRequest,
) -> dict[str, Any]:
    """
    Reusable persistence unit for decision creation.
    TODO: Add audit logging when shared audit helper is available.
    """
    result = (
        supabase.table("regulatory_decisions")
        .insert(
            {
                "title": payload.title,
                "summary": payload.summary,
                "decision_type": payload.decision_type,
                "document_url": payload.document_url,
                "is_public": payload.is_public,
                "decided_at": payload.decided_at.isoformat() if payload.decided_at else None,
            }
        )
        .execute()
    )

    rows = result.data or []
    first = rows[0] if rows else None
    if not isinstance(first, dict):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create regulatory decision",
        )

    return first


@router.get("", response_model=DecisionsListResponse)
async def list_decisions(
    decision_type: str | None = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
) -> DecisionsListResponse:
    """Get public regulatory decisions with optional filtering."""
    decision_type_filter = _normalize_filter(decision_type)

    if decision_type_filter:
        decision_type_filter = decision_type_filter.lower()
        if decision_type_filter not in DECISION_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid decision_type. Allowed: {', '.join(sorted(DECISION_TYPES))}",
            )

    supabase = get_supabase_admin()
    query = supabase.table("regulatory_decisions").select("*").eq("is_public", True)

    if decision_type_filter:
        query = query.eq("decision_type", decision_type_filter)

    count_result = query.execute()
    total_count = len(count_result.data or [])

    result = (
        query.order("decided_at", desc=True)
        .order("created_at", desc=True)
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

    items = [_to_decision_item(row) for row in rows if isinstance(row, dict)]

    return DecisionsListResponse(
        items=items,
        count=total_count,
        limit=limit,
        offset=offset,
    )


@router.post("", response_model=DecisionItem, status_code=status.HTTP_201_CREATED)
async def create_decision(
    payload: DecisionCreateRequest,
    admin: dict[str, Any] = Depends(require_admin),
) -> DecisionItem:
    """Create a new regulatory decision. Admin-only."""
    supabase = get_supabase_admin()
    created_row = _create_decision_record(supabase, payload=payload)
    return _to_decision_item(created_row)
