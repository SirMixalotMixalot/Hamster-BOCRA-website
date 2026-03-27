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
_DOCUMENT_SECTION_ALIASES = {
    "tender": "tenders",
    "form": "forms",
    "publication": "publications",
    "legislations": "legislation",
    "annual report": "annual-reports",
    "annual reports": "annual-reports",
    "annual_report": "annual-reports",
    "annual_reports": "annual-reports",
    "statistic": "statistics",
}
_VALID_DOCUMENT_SECTIONS = {
    "news",
    "tenders",
    "forms",
    "publications",
    "legislation",
    "annual-reports",
    "statistics",
    "uncategorized",
}


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


def _clean_document_title(raw_title: Any) -> str:
    if not isinstance(raw_title, str):
        return "Untitled"

    title = raw_title.strip()
    if not title:
        return "Untitled"

    # Public document names are often stored as "section::Display Name".
    if "::" in title:
        _, display_name = title.split("::", 1)
        title = display_name.strip() or title

    # Keep only the last path segment if a path-like string leaks into title.
    title = re.split(r"[\\/]", title)[-1].strip() or title

    # Remove common generated prefixes (UUID/hash/timestamp) if present.
    title = re.sub(
        r"^(?:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|[0-9a-f]{24,}|\d{8,})[-_ ]+",
        "",
        title,
        flags=re.IGNORECASE,
    )

    # Remove file extension for cleaner UI labels.
    title = re.sub(r"\.[A-Za-z0-9]{1,10}$", "", title).strip()

    return title or "Untitled"


def _clean_snippet(raw_snippet: Any) -> str:
    if not isinstance(raw_snippet, str):
        return ""
    return re.sub(r"<[^>]+>", "", raw_snippet).strip()


def _extract_document_section(raw_title: Any) -> str:
    if not isinstance(raw_title, str) or "::" not in raw_title:
        return "uncategorized"

    section, _ = raw_title.split("::", 1)
    normalized_section = section.strip().lower()
    alias_key = normalized_section.replace("_", " ").replace("-", " ")
    normalized_section = _DOCUMENT_SECTION_ALIASES.get(alias_key, normalized_section)

    if normalized_section in _VALID_DOCUMENT_SECTIONS:
        return normalized_section

    return "uncategorized"


def _normalize_result(row: dict[str, Any]) -> SearchResultItem:
    result_type = row["type"]
    raw_title = row.get("title") or "Untitled"
    title = raw_title
    snippet = _clean_snippet(row.get("snippet")) or "No preview available."
    section: str | None = None

    if result_type == "document":
        title = _clean_document_title(title)
        snippet = title
        section = _extract_document_section(raw_title)

    return SearchResultItem(
        type=result_type,
        title=title,
        snippet=snippet,
        url=row.get("url") or "#",
        section=section,
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
