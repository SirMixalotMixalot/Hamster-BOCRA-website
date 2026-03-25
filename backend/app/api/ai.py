from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import json
import logging
import re
from typing import Any

from fastapi import APIRouter, HTTPException, status

from app.db.client import get_supabase_admin
from app.models.ai import AIChatRequest, AIChatResponse
from app.search.services import search_services

router = APIRouter(prefix="/api/ai", tags=["ai"])
logger = logging.getLogger("app.ai")

_MAX_MESSAGE_LENGTH = 1000
_DB_FETCH_LIMIT = 25
_TOP_MATCHES = 3
_ACTION_INTENT_TOKENS = {
    "apply",
    "application",
    "complaint",
    "complain",
    "verify",
    "contact",
    "help",
    "track",
    "status",
    "file",
}

# Best-effort in-process cache for FAQ JSON.
# TODO: Move FAQ content to a Supabase-managed FAQ table for production updates.
_FAQ_CACHE: list[dict[str, Any]] | None = None

# Source: Frontend/src/components/BottomBar.tsx and Frontend/src/components/ContactModal.tsx
BOCRA_CONTACT_PHONE = "+267 395 7755"
BOCRA_CONTACT_EMAIL = "info@bocra.org.bw"
BOCRA_CONTACT_LOCATION = "Plot 50671, Independence Avenue, Gaborone, Botswana"


@dataclass(frozen=True)
class KnowledgeMatch:
    title: str
    snippet: str
    url: str
    score: float
    source_type: str


def _safe_float(value: Any) -> float:
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, str):
        try:
            return float(value)
        except ValueError:
            return 0.0
    return 0.0


def _tokenize_query(query: str) -> list[str]:
    return [token for token in re.split(r"\W+", query.lower()) if token]


def _has_action_intent(query: str) -> bool:
    return any(token in _ACTION_INTENT_TOKENS for token in _tokenize_query(query))


def _near_exact_title_bonus(query: str, title: str) -> float:
    normalized_query = query.lower().strip()
    normalized_title = title.lower().strip()

    if not normalized_query or not normalized_title:
        return 0.0

    if normalized_query == normalized_title:
        return 5.0
    if normalized_title.startswith(normalized_query) or normalized_query.startswith(normalized_title):
        return 2.0
    return 0.0


def _score_text_match(query: str, title: str, snippet: str, keywords: list[str] | tuple[str, ...] | None = None) -> float:
    normalized_query = query.lower().strip()
    if not normalized_query:
        return 0.0

    title_l = title.lower()
    snippet_l = snippet.lower()
    keywords_l = [k.lower() for k in (keywords or [])]
    tokens = _tokenize_query(normalized_query)

    score = 0.0
    if normalized_query in title_l:
        score += 4.0
    if normalized_query in snippet_l:
        score += 2.0
    if any(normalized_query in keyword for keyword in keywords_l):
        score += 3.0

    for token in tokens:
        if token in title_l:
            score += 1.5
        if token in snippet_l:
            score += 0.75
        if any(token in keyword for keyword in keywords_l):
            score += 1.0

    return score


def _read_faq_from_sample_knowledge_base() -> list[dict[str, Any]]:
    """
    Best-effort FAQ load from sample chatbot knowledge base.
    Safe no-op if file is absent in a deployment environment.
    """
    global _FAQ_CACHE

    if _FAQ_CACHE is not None:
        return _FAQ_CACHE

    candidates = [
        Path(__file__).resolve().parents[1] / "ai" / "knowledge_base.json",
        Path(__file__).resolve().parents[2] / "chatbot" / "chatbot" / "knowledge_base.json",
    ]

    for candidate in candidates:
        if not candidate.exists():
            continue
        try:
            raw = json.loads(candidate.read_text(encoding="utf-8"))
            if isinstance(raw, list):
                _FAQ_CACHE = [row for row in raw if isinstance(row, dict)]
                return _FAQ_CACHE
        except Exception as exc:
            logger.warning("Failed reading FAQ knowledge base at %s: %s", candidate, exc)

            _FAQ_CACHE = []
    return []


def _search_faq(query: str) -> list[KnowledgeMatch]:
    faq_rows = _read_faq_from_sample_knowledge_base()
    matches: list[KnowledgeMatch] = []
    for row in faq_rows:
        question = str(row.get("question") or "").strip()
        answer = str(row.get("answer") or "").strip()
        link = str(row.get("link") or "").strip() or "/"
        keywords_raw = row.get("keywords")
        keywords = [str(k) for k in keywords_raw] if isinstance(keywords_raw, list) else []

        if not question or not answer:
            continue

        score = _score_text_match(query, question, answer, keywords)
        score += _near_exact_title_bonus(query, question)
        if score <= 0:
            continue

        matches.append(
            KnowledgeMatch(
                title=question,
                snippet=answer,
                url=link,
                score=score,
                source_type="faq",
            )
        )

    return matches


def _search_public_content(query: str) -> list[KnowledgeMatch]:
    supabase = get_supabase_admin()

    try:
        rpc_result = supabase.rpc(
            "search_public_content",
            {
                "search_query": query,
                "result_limit": _DB_FETCH_LIMIT,
            },
        ).execute()
    except Exception as exc:
        logger.warning("AI search RPC failed for query='%s': %s", query, exc)
        return []

    rows = rpc_result.data if isinstance(rpc_result.data, list) else []
    matches: list[KnowledgeMatch] = []
    for row in rows:
        if not isinstance(row, dict):
            continue

        title = str(row.get("title") or "Untitled").strip()
        snippet = str(row.get("snippet") or "No preview available.").strip()
        url = str(row.get("url") or "#").strip() or "#"
        score = _safe_float(row.get("score"))
        score += _near_exact_title_bonus(query, title)

        if score <= 0:
            score = _score_text_match(query, title, snippet)
        if score <= 0:
            continue

        matches.append(
            KnowledgeMatch(
                title=title,
                snippet=snippet,
                url=url,
                score=score,
                source_type=str(row.get("type") or "content"),
            )
        )

    return matches


def _search_services(query: str) -> list[KnowledgeMatch]:
    matches: list[KnowledgeMatch] = []
    action_intent = _has_action_intent(query)
    for row in search_services(query):
        title = str(row.get("title") or "").strip()
        snippet = str(row.get("snippet") or "").strip()
        url = str(row.get("url") or "/").strip() or "/"
        score = _safe_float(row.get("score"))
        score += _near_exact_title_bonus(query, title)
        if action_intent:
            score += 2.0
        if not title or score <= 0:
            continue
        matches.append(
            KnowledgeMatch(
                title=title,
                snippet=snippet,
                url=url,
                score=score,
                source_type="service",
            )
        )

    return matches


def _dedupe_and_rank(matches: list[KnowledgeMatch]) -> list[KnowledgeMatch]:
    deduped: dict[str, KnowledgeMatch] = {}
    for item in matches:
        key = f"{item.title.lower()}|{item.url}"
        existing = deduped.get(key)
        if existing is None or item.score > existing.score:
            deduped[key] = item

    ranked = sorted(deduped.values(), key=lambda item: item.score, reverse=True)
    return ranked[:_TOP_MATCHES]


def _is_low_confidence(matches: list[KnowledgeMatch]) -> bool:
    if not matches:
        return True
    top_score = matches[0].score
    if top_score < 2.5:
        return True
    if len(matches) > 1 and (top_score - matches[1].score) < 0.5:
        return True
    return False


def _first_sentence(text: str) -> str:
    cleaned = text.strip()
    if not cleaned:
        return ""
    parts = re.split(r"(?<=[.!?])\s+", cleaned)
    return parts[0].strip()


def _format_reply(query: str, matches: list[KnowledgeMatch]) -> AIChatResponse:
    if not matches:
        return AIChatResponse(
            reply=(
                "I could not find a strong BOCRA match for that request. "
                f"Please contact BOCRA at {BOCRA_CONTACT_PHONE} or {BOCRA_CONTACT_EMAIL}, "
                f"or visit {BOCRA_CONTACT_LOCATION}."
            ),
            sources=["tel:+2673957755", "mailto:info@bocra.org.bw"],
        )

    top = matches[0]
    sources = [item.url for item in matches if item.url]
    deduped_sources = list(dict.fromkeys(sources))

    low_confidence = _is_low_confidence(matches)
    direct_answer = _first_sentence(top.snippet)

    if low_confidence:
        answer_line = (
            "I found related BOCRA information, but it may not exactly answer your request. "
            "Please review the related resources below."
        )
    else:
        answer_line = direct_answer or f"The closest BOCRA resource is: {top.title}."

    if top.source_type == "service":
        next_step = f"Best next step: open {top.title} to continue."
    elif top.source_type == "faq":
        next_step = "This guidance comes from BOCRA FAQ content."
    else:
        next_step = "For full official details, open the linked BOCRA resources."

    related_lines = [f"- {item.title}" for item in matches[1:3]]
    related_block = ""
    if related_lines:
        related_block = "\n\nRelated resources:\n" + "\n".join(related_lines)

    if low_confidence:
        contact_line = (
            f"\n\nIf this does not resolve your question, contact BOCRA at {BOCRA_CONTACT_PHONE} "
            f"or {BOCRA_CONTACT_EMAIL}."
        )
    else:
        contact_line = ""

    # TODO: Add semantic summarization once curated FAQ content is persisted in DB.
    reply = f"{answer_line}\n\n{next_step}{related_block}{contact_line}"
    return AIChatResponse(reply=reply, sources=deduped_sources)


@router.post("/chat", response_model=AIChatResponse)
async def chat(payload: AIChatRequest) -> AIChatResponse:
    # NOTE: conversation_id is accepted for forward compatibility with lightweight
    # conversational context, but persistence is intentionally not implemented yet.
    query = payload.message.strip()
    if not query:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="message cannot be empty",
        )

    if len(query) > _MAX_MESSAGE_LENGTH:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"message exceeds max length of {_MAX_MESSAGE_LENGTH}",
        )

    content_matches = _search_public_content(query)
    service_matches = _search_services(query)
    faq_matches = _search_faq(query)

    top_matches = _dedupe_and_rank(content_matches + service_matches + faq_matches)
    return _format_reply(query, top_matches)
