from __future__ import annotations

from datetime import datetime
from decimal import Decimal
import logging
from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.db.client import get_supabase_admin
from app.dependencies.auth import require_admin
from app.models.stats import (
    STATS_ALLOWED_SECTORS,
    StatsCreateRequest,
    StatsItem,
    StatsListResponse,
    StatsUpdateRequest,
)

router = APIRouter(prefix="/api/stats", tags=["stats"])
logger = logging.getLogger("app.stats")


def _parse_dt(value: str | None) -> datetime:
    if not value:
        return datetime.utcnow()
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def _coerce_float(value: Any) -> float:
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, str):
        try:
            return float(value)
        except ValueError:
            return 0.0
    return 0.0


def _to_stats_item(row: dict[str, Any]) -> StatsItem:
    return StatsItem(
        id=row["id"],
        metric_name=row["metric_name"],
        value=_coerce_float(row.get("value")),
        unit=row["unit"],
        period=row["period"],
        sector=row["sector"],
        source=row.get("source"),
        created_at=_parse_dt(row.get("created_at")),
    )


def _normalize_filter(value: str | None) -> str | None:
    if value is None:
        return None
    cleaned = value.strip()
    return cleaned or None


def _create_stat_record(
    supabase,
    *,
    payload: StatsCreateRequest,
) -> dict[str, Any]:
    """
    Reusable persistence unit for stats creation.
    TODO: Reuse in future service-authenticated ingestion route.
    """
    result = (
        supabase.table("telecom_stats")
        .insert(
            {
                "metric_name": payload.metric_name,
                "value": float(payload.value),
                "unit": payload.unit,
                "period": payload.period,
                "sector": payload.sector,
                "source": payload.source,
            }
        )
        .execute()
    )

    rows = result.data or []
    first = rows[0] if rows else None
    if not isinstance(first, dict):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create telecom stat",
        )

    return first


@router.get("", response_model=StatsListResponse)
async def list_stats(
    metric_name: str | None = Query(None),
    sector: str | None = Query(None),
    period: str | None = Query(None),
    limit: int = Query(50, ge=1, le=200),
    latest_only: bool = Query(False),
) -> StatsListResponse:
    metric_name_filter = _normalize_filter(metric_name)
    sector_filter = _normalize_filter(sector)
    period_filter = _normalize_filter(period)

    if sector_filter:
        sector_filter = sector_filter.lower()
        if sector_filter not in STATS_ALLOWED_SECTORS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid sector. Allowed: {', '.join(sorted(STATS_ALLOWED_SECTORS))}",
            )

    supabase = get_supabase_admin()
    query = supabase.table("telecom_stats").select(
        "id,metric_name,value,unit,period,sector,source,created_at"
    )

    if metric_name_filter:
        query = query.ilike("metric_name", f"%{metric_name_filter}%")
    if sector_filter:
        query = query.eq("sector", sector_filter)
    if period_filter:
        query = query.eq("period", period_filter)

    fetch_limit = limit
    if latest_only:
        fetch_limit = min(max(limit * 5, limit), 500)

    result = query.order("created_at", desc=True).limit(fetch_limit).execute()
    rows = [row for row in (result.data or []) if isinstance(row, dict)]

    if latest_only:
        deduped_rows: list[dict[str, Any]] = []
        seen_keys: set[tuple[str, str]] = set()
        for row in rows:
            key = (
                str(row.get("metric_name") or "").strip().lower(),
                str(row.get("sector") or "").strip().lower(),
            )
            if key in seen_keys:
                continue
            seen_keys.add(key)
            deduped_rows.append(row)
            if len(deduped_rows) >= limit:
                break
        rows = deduped_rows
    else:
        rows = rows[:limit]

    items = [_to_stats_item(row) for row in rows]
    return StatsListResponse(items=items, limit=limit, count=len(items))


@router.post("", response_model=StatsItem, status_code=status.HTTP_201_CREATED)
async def create_stat(
    payload: StatsCreateRequest,
    current_profile: dict[str, Any] = Depends(require_admin),
) -> StatsItem:
    supabase = get_supabase_admin()

    try:
        created = _create_stat_record(supabase, payload=payload)
    except HTTPException:
        raise
    except Exception as e:
        logger.error("create_stat_failed admin_id=%s error=%s", current_profile.get("id"), e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create telecom stat",
        )

    # TODO: Write audit_log row for telecom_stats create when shared helper exists.
    return _to_stats_item(created)


@router.patch("/{stat_id}", response_model=StatsItem)
async def update_stat(
    stat_id: UUID,
    payload: StatsUpdateRequest,
    current_profile: dict[str, Any] = Depends(require_admin),
) -> StatsItem:
    supabase = get_supabase_admin()

    existing = (
        supabase.table("telecom_stats")
        .select("id")
        .eq("id", str(stat_id))
        .limit(1)
        .execute()
    )
    if not (existing.data or []):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stat not found")

    update_data: dict[str, Any] = {}
    if payload.metric_name is not None:
        update_data["metric_name"] = payload.metric_name
    if payload.value is not None:
        update_data["value"] = float(payload.value)
    if payload.unit is not None:
        update_data["unit"] = payload.unit
    if payload.period is not None:
        update_data["period"] = payload.period
    if payload.sector is not None:
        update_data["sector"] = payload.sector
    if payload.source is not None:
        update_data["source"] = payload.source

    try:
        updated_result = (
            supabase.table("telecom_stats")
            .update(update_data)
            .eq("id", str(stat_id))
            .execute()
        )
    except Exception as e:
        logger.error("update_stat_failed stat_id=%s admin_id=%s error=%s", stat_id, current_profile.get("id"), e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update telecom stat",
        )

    rows = updated_result.data or []
    updated = rows[0] if rows else None
    if not isinstance(updated, dict):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve updated stat",
        )

    # TODO: Write audit_log row for telecom_stats update when shared helper exists.
    return _to_stats_item(updated)
