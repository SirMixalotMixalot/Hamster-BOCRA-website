from __future__ import annotations

from dataclasses import dataclass
import re
from typing import Any


@dataclass(frozen=True)
class ServiceCatalogItem:
    id: str
    title: str
    description: str
    keywords: tuple[str, ...]
    url: str
    action: str | None = None
    type: str = "service"


# Hackathon scope: keep this in-code catalog aligned with landing-page navigation
# and chatbot service guidance. TODO: Move to DB/search index when service content is
# managed by CMS or admin workflows.
SERVICE_CATALOG: tuple[ServiceCatalogItem, ...] = (
    ServiceCatalogItem(
        id="apply-license",
        title="Apply for License",
        description="Start a new BOCRA licence application through the customer portal.",
        keywords=("apply", "license", "licence", "application", "new license"),
        url="/",
        action="open_signin_modal",
    ),
    ServiceCatalogItem(
        id="file-complaint",
        title="File a Complaint",
        description="Submit a consumer complaint with evidence and tracking details.",
        keywords=("complaint", "report", "consumer", "issue", "dispute"),
        url="/",
        action="open_services_overlay",
    ),
    ServiceCatalogItem(
        id="track-application",
        title="Track Application Status",
        description="Check the status and progress of your submitted BOCRA application.",
        keywords=("track", "status", "application", "reference", "progress"),
        url="/",
        action="open_signin_modal",
    ),
    ServiceCatalogItem(
        id="verify-licence",
        title="Verify Licence",
        description="Verify whether a licence is valid and currently active.",
        keywords=("verify", "license", "licence", "valid", "status check"),
        url="/",
        action="open_signin_modal",
    ),
    ServiceCatalogItem(
        id="explore-services",
        title="Explore Services",
        description="Browse BOCRA services, licensing categories, and support resources.",
        keywords=("services", "catalog", "licensing", "resources", "explore"),
        url="/",
        action="open_services_overlay",
    ),
    ServiceCatalogItem(
        id="contact-bocra",
        title="Contact BOCRA",
        description="Get help from BOCRA through the contact channels and support options.",
        keywords=("contact", "help", "support", "email", "phone"),
        url="/",
        action="open_contact_modal",
    ),
    ServiceCatalogItem(
        id="ai-assistant",
        title="AI Assistant",
        description="Ask BOCRA's AI assistant for guidance on services, forms, and regulations.",
        keywords=("ai", "assistant", "chatbot", "guide", "help me"),
        url="/",
        action="open_ai_chatbot",
    ),
    ServiceCatalogItem(
        id="view-news",
        title="View News",
        description="Read the latest BOCRA announcements, notices, and press updates.",
        keywords=("news", "announcements", "press", "updates", "notices"),
        url="/news",
        action=None,
    ),
    ServiceCatalogItem(
        id="view-decisions",
        title="View Regulatory Decisions",
        description="Browse public BOCRA regulatory decisions and outcomes.",
        keywords=("decisions", "regulatory", "rulings", "determinations"),
        url="/decisions",
        action=None,
    ),
    ServiceCatalogItem(
        id="view-public-documents",
        title="View Public Documents / Forms",
        description="Open public BOCRA documents, forms, and downloadable resources.",
        keywords=("documents", "forms", "downloads", "public documents", "templates"),
        url="/documents",
        action=None,
    ),
)


def _tokenize_query(query: str) -> list[str]:
    return [token for token in re.split(r"\W+", query.lower()) if token]


def score_service_match(query: str, item: ServiceCatalogItem) -> float:
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


def search_services(query: str) -> list[dict[str, Any]]:
    matches: list[dict[str, Any]] = []
    for service in SERVICE_CATALOG:
        score = score_service_match(query, service)
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

    return sorted(matches, key=lambda row: float(row.get("score") or 0.0), reverse=True)
