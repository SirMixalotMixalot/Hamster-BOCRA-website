from __future__ import annotations

from dataclasses import dataclass


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
