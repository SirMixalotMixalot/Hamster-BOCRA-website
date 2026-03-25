from __future__ import annotations

from datetime import datetime, timezone
import logging
from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.db.client import get_supabase_admin
from app.dependencies.auth import require_admin
from app.models.news import (
    NEWS_ALLOWED_TAGS,
    NewsAdminItem,
    NewsCreateRequest,
    NewsListResponse,
    NewsPublicItem,
    NewsUpdateRequest,
)

router = APIRouter(prefix="/api/news", tags=["news"])
logger = logging.getLogger("app.news")


def _parse_dt(value: str | None) -> datetime | None:
    if not value:
        return None
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def _to_public_item(row: dict[str, Any]) -> NewsPublicItem:
    return NewsPublicItem(
        id=row["id"],
        title=row["title"],
        description=row.get("description"),
        content=row.get("content"),
        tag=row.get("tag"),
        published_at=_parse_dt(row.get("published_at")),
        created_at=_parse_dt(row.get("created_at")) or datetime.now(timezone.utc),
    )


def _to_admin_item(row: dict[str, Any]) -> NewsAdminItem:
    return NewsAdminItem(
        id=row["id"],
        title=row["title"],
        description=row.get("description"),
        content=row.get("content"),
        tag=row.get("tag"),
        published=bool(row.get("published")),
        published_at=_parse_dt(row.get("published_at")),
        created_at=_parse_dt(row.get("created_at")) or datetime.now(timezone.utc),
        updated_at=_parse_dt(row.get("updated_at")) or datetime.now(timezone.utc),
    )


def _create_news_record(
    supabase,
    *,
    author_id: str,
    payload: NewsCreateRequest,
) -> dict[str, Any]:
    """
    Reusable persistence unit for news creation.
    TODO: Reuse this in a future service-authenticated ingestion route.
    """
    now = datetime.now(timezone.utc)
    published_at = payload.published_at
    if payload.published and published_at is None:
        published_at = now

    insert_payload = {
        "title": payload.title,
        "description": payload.description,
        "content": payload.content,
        "tag": payload.tag,
        "published": payload.published,
        "published_at": published_at.isoformat() if published_at else None,
        "author_id": author_id,
        "updated_at": now.isoformat(),
    }

    result = supabase.table("news").insert(insert_payload).execute()
    rows = result.data or []
    if not rows:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create news item",
        )

    first_row = rows[0]
    if not isinstance(first_row, dict):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Invalid response payload for created news item",
        )

    return first_row


@router.get("", response_model=NewsListResponse)
async def list_public_news(
    tag: str | None = Query(None),
    limit: int = Query(10, ge=1, le=50),
    page: int = Query(1, ge=1),
    offset: int | None = Query(None, ge=0),
) -> NewsListResponse:
    normalized_tag = tag.strip().lower() if tag else None
    if normalized_tag and normalized_tag not in NEWS_ALLOWED_TAGS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid tag. Allowed: {', '.join(sorted(NEWS_ALLOWED_TAGS))}",
        )

    effective_offset = offset if offset is not None else (page - 1) * limit

    supabase = get_supabase_admin()
    query = (
        supabase.table("news")
        .select("id,title,description,content,tag,published_at,created_at")
        .eq("published", True)
    )

    if normalized_tag:
        query = query.eq("tag", normalized_tag)

    result = (
        query.order("published_at", desc=True, nullsfirst=False)
        .order("created_at", desc=True)
        .range(effective_offset, effective_offset + limit - 1)
        .execute()
    )

    raw_rows = result.data or []
    rows = [row for row in raw_rows if isinstance(row, dict)]
    items = [_to_public_item(row) for row in rows]

    return NewsListResponse(
        items=items,
        limit=limit,
        offset=effective_offset,
        count=len(items),
    )


@router.post("", response_model=NewsAdminItem, status_code=status.HTTP_201_CREATED)
async def create_news(
    payload: NewsCreateRequest,
    current_profile: dict[str, Any] = Depends(require_admin),
) -> NewsAdminItem:
    supabase = get_supabase_admin()
    author_id = current_profile["id"]

    try:
        created = _create_news_record(supabase, author_id=author_id, payload=payload)
    except HTTPException:
        raise
    except Exception as e:
        logger.error("create_news_failed admin_id=%s error=%s", author_id, e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create news item",
        )

    # TODO: Write audit_log row for news create once shared audit helper is available.
    logger.info("news_created id=%s admin_id=%s", created.get("id"), author_id)
    return _to_admin_item(created)


@router.patch("/{news_id}", response_model=NewsAdminItem)
async def update_news(
    news_id: UUID,
    payload: NewsUpdateRequest,
    current_profile: dict[str, Any] = Depends(require_admin),
) -> NewsAdminItem:
    supabase = get_supabase_admin()
    current_admin_id = current_profile["id"]

    existing_result = supabase.table("news").select("*").eq("id", str(news_id)).limit(1).execute()
    existing_rows = existing_result.data or []
    if not existing_rows:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="News item not found")

    existing = existing_rows[0]
    if not isinstance(existing, dict):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Invalid response payload for existing news item",
        )
    update_data: dict[str, Any] = {"updated_at": datetime.now(timezone.utc).isoformat()}

    if payload.title is not None:
        update_data["title"] = payload.title
    if payload.description is not None:
        update_data["description"] = payload.description
    if payload.content is not None:
        update_data["content"] = payload.content
    if payload.tag is not None:
        update_data["tag"] = payload.tag
    if payload.published is not None:
        update_data["published"] = payload.published

    existing_published = bool(existing.get("published"))
    if payload.published is True and not existing_published and payload.published_at is None:
        update_data["published_at"] = datetime.now(timezone.utc).isoformat()
    elif payload.published_at is not None:
        update_data["published_at"] = payload.published_at.isoformat()

    # Rule: keep published_at as historical timestamp when unpublishing.

    try:
        update_result = supabase.table("news").update(update_data).eq("id", str(news_id)).execute()
    except Exception as e:
        logger.error("update_news_failed id=%s admin_id=%s error=%s", news_id, current_admin_id, e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update news item",
        )

    raw_rows = update_result.data or []
    rows = [row for row in raw_rows if isinstance(row, dict)]
    if not rows:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="News update failed",
        )

    updated = rows[0]
    # TODO: Write audit_log row for news update once shared audit helper is available.
    logger.info("news_updated id=%s admin_id=%s", news_id, current_admin_id)
    return _to_admin_item(updated)


@router.delete("/{news_id}")
async def delete_news(
    news_id: UUID,
    current_profile: dict[str, Any] = Depends(require_admin),
) -> dict[str, str]:
    supabase = get_supabase_admin()
    current_admin_id = current_profile["id"]

    existing_result = supabase.table("news").select("id").eq("id", str(news_id)).limit(1).execute()
    if not (existing_result.data or []):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="News item not found")

    try:
        supabase.table("news").delete().eq("id", str(news_id)).execute()
    except Exception as e:
        logger.error("delete_news_failed id=%s admin_id=%s error=%s", news_id, current_admin_id, e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete news item",
        )

    # TODO: Write audit_log row for news delete once shared audit helper is available.
    logger.info("news_deleted id=%s admin_id=%s", news_id, current_admin_id)
    return {"message": "News deleted"}
