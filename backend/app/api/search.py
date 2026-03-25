from __future__ import annotations

import logging
import re
from typing import Any

from fastapi import APIRouter, HTTPException, Query, status

from app.db.client import get_supabase_admin
from app.models.search import SearchResponse, SearchResultItem
from app.search.services import SERVICE_CATALOG, ServiceCatalogItem

router = APIRouter(prefix="/api/search", tags=["search"])
logger = logging.getLogger("app.search")

_MAX_QUERY_LENGTH = 200
_DEFAULT_LIMIT = 10
_DB_FETCH_LIMIT = 25


def _tokenize_query(query: str) -> list[str]:
    return [token for token in re.split(r"\W+", query.lower()) if token]


def _score_service_match(query: str, item: ServiceCatalogItem) -> float:
    normalized_query = query.lower().strip()
    if not normalized_query:
        return 0.0

    tokens = _tokenize_query(normalized_query)
    title = item.title.lower()
    description = item.description.lower()
    keywords = tuple(keyword.lower() for keyword in item.keywords)

    score = 0.0
    if normalized_query in title:
        score += 4.0
    if normalized_query in description:
        score += 2.0
    if any(normalized_query in keyword for keyword in keywords):
        score += 4.0

    for token in tokens:
        if token in title:
            score += 1.5
        if token in description:
            score += 0.5
        if any(token in keyword for keyword in keywords):
            score += 1.0

    return score


def _search_services(query: str) -> list[dict[str, Any]]:
    matches: list[dict[str, Any]] = []
    for service in SERVICE_CATALOG:
        score = _score_service_match(query, service)
        if score <= 0:
            continue
        matches.append(
            {
                "type": "service",
                "title": service.title,
                "snippet": service.description,
                "url": service.url,
                "action": service.action,
                "score": score,
            }
        )

    # TODO: fold service ranking into a unified semantic/hybrid search ranker.
    return sorted(matches, key=lambda row: float(row.get("score") or 0.0), reverse=True)


def _safe_score(value: Any) -> float:
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, str):
        try:
            return float(value)
        except ValueError:
            return 0.0
    return 0.0


def _normalize_result(row: dict[str, Any]) -> SearchResultItem:
    return SearchResultItem(
        type=row["type"],
        title=row.get("title") or "Untitled",
        snippet=row.get("snippet") or "No preview available.",
        url=row.get("url") or "#",
        action=row.get("action") if isinstance(row.get("action"), str) else None,
        score=float(row.get("score") or 0.0),
    )


@router.get("", response_model=SearchResponse)
async def search_public_content(
    q: str = Query(..., description="Search query"),
) -> SearchResponse:
    query = q.strip()
    if not query:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Query parameter 'q' cannot be empty",
        )

    if len(query) > _MAX_QUERY_LENGTH:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Query parameter 'q' exceeds max length of {_MAX_QUERY_LENGTH}",
        )

    supabase = get_supabase_admin()

    try:
        rpc_result = supabase.rpc(
            "search_public_content",
            {
                "search_query": query,
                "result_limit": _DB_FETCH_LIMIT,
            },
        ).execute()
    except Exception as e:
        logger.error("search_public_content rpc_failed query='%s' error=%s", query, e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Search query failed",
        )

    raw_db_rows = rpc_result.data if isinstance(rpc_result.data, list) else []
    db_rows = [row for row in raw_db_rows if isinstance(row, dict)]
    service_rows = _search_services(query)

    merged_rows = db_rows + service_rows
    merged_rows.sort(key=lambda row: _safe_score(row.get("score")), reverse=True)
    results = [_normalize_result(row) for row in merged_rows[:_DEFAULT_LIMIT]]

    return SearchResponse(query=query, results=results)
