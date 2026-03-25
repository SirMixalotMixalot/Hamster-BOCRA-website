from __future__ import annotations

import logging
from typing import Any

from fastapi import APIRouter, HTTPException, Query, status

from app.db.client import get_supabase_admin
from app.models.search import SearchResponse, SearchResultItem

router = APIRouter(prefix="/api/search", tags=["search"])
logger = logging.getLogger("app.search")

_MAX_QUERY_LENGTH = 200
_DEFAULT_LIMIT = 10

# TODO: Replace with DB-backed services once a services table/source exists.
_SERVICE_RESULTS: list[dict[str, Any]] = []


def _normalize_result(row: dict[str, Any]) -> SearchResultItem:
    return SearchResultItem(
        type=row["type"],
        title=row.get("title") or "Untitled",
        snippet=row.get("snippet") or "No preview available.",
        url=row.get("url") or "#",
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
                "result_limit": _DEFAULT_LIMIT,
            },
        ).execute()
    except Exception as e:
        logger.error("search_public_content rpc_failed query='%s' error=%s", query, e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Search query failed",
        )

    rows = rpc_result.data or []
    results = [_normalize_result(row) for row in rows]

    # Keep the source shape extensible for future hybrid/semantic search fusion.
    if _SERVICE_RESULTS:
        service_results = [_normalize_result(row) for row in _SERVICE_RESULTS]
        results.extend(service_results)
        results = sorted(results, key=lambda item: item.score, reverse=True)[:_DEFAULT_LIMIT]

    return SearchResponse(query=query, results=results)
