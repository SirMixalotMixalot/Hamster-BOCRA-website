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
    # Customer & Portal Services
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
    # About BOCRA
    ServiceCatalogItem(
        id="who-we-are",
        title="Who We Are",
        description="Learn about BOCRA's history, mission, vision and values.",
        keywords=("about", "mission", "vision", "values", "history", "bocra"),
        url="/about/who-we-are",
        type="page",
    ),
    ServiceCatalogItem(
        id="our-mandate",
        title="Our Mandate",
        description="Understand BOCRA's regulatory responsibilities and role in Botswana.",
        keywords=("mandate", "regulatory", "responsibilities", "authority"),
        url="/about/mandate",
        type="page",
    ),
    ServiceCatalogItem(
        id="strategic-plan",
        title="Strategic Plan",
        description="Explore BOCRA's vision for Botswana's digital future.",
        keywords=("strategic", "plan", "future", "digital", "vision"),
        url="/about/strategic-plan",
        type="page",
    ),
    ServiceCatalogItem(
        id="org-structure",
        title="Organisational Structure",
        description="Discover BOCRA's board, executive team and departments.",
        keywords=("structure", "organization", "board", "executive", "team"),
        url="/about/structure",
        type="page",
    ),
    ServiceCatalogItem(
        id="careers",
        title="Careers",
        description="Join BOCRA's team of professionals.",
        keywords=("careers", "jobs", "employment", "join", "recruit"),
        url="/careers",
        type="page",
    ),
    # Licensing Process & Types
    ServiceCatalogItem(
        id="how-licensing-works",
        title="How Licensing Works",
        description="Learn about BOCRA's application, renewal and licensing timelines.",
        keywords=("licensing", "how it works", "application", "renewal", "timeline"),
        url="/licensing/how-it-works",
        type="page",
    ),
    ServiceCatalogItem(
        id="licence-fees",
        title="Licence Fees",
        description="View the complete fee schedule for all BOCRA licence types.",
        keywords=("fees", "pricing", "cost", "charges", "fee schedule"),
        url="/licensing/fees",
        type="page",
    ),
    ServiceCatalogItem(
        id="licence-verification",
        title="Licence Verification",
        description="Verify operator and equipment licences for validity and status.",
        keywords=("verify", "verification", "check", "valid", "status"),
        url="/licensing/verification",
        type="page",
    ),
    ServiceCatalogItem(
        id="telecom-licensing",
        title="Telecommunications Licensing",
        description="Information on fixed and mobile network telecommunications licenses.",
        keywords=("telecommunications", "telecom", "mobile", "network", "fixed line"),
        url="/licensing/telecommunications",
        type="page",
    ),
    ServiceCatalogItem(
        id="broadcasting-licensing",
        title="Broadcasting Licensing",
        description="Details on radio and television broadcasting licenses.",
        keywords=("broadcasting", "radio", "television", "tv", "broadcast"),
        url="/licensing/broadcasting",
        type="page",
    ),
    ServiceCatalogItem(
        id="internet-services",
        title="Internet Services Licensing",
        description="ISP and data services licensing information.",
        keywords=("internet", "isp", "data", "services", "broadband"),
        url="/licensing/internet-services",
        type="page",
    ),
    ServiceCatalogItem(
        id="postal-services",
        title="Postal Services Licensing",
        description="Courier and postal services licensing details.",
        keywords=("postal", "courier", "mail", "delivery", "services"),
        url="/licensing/postal-services",
        type="page",
    ),
    ServiceCatalogItem(
        id="spectrum-management",
        title="Spectrum Management",
        description="Learn about BOCRA's frequency allocation and spectrum management.",
        keywords=("spectrum", "frequency", "allocation", "management", "radio spectrum"),
        url="/licensing/spectrum-management",
        type="page",
    ),
    ServiceCatalogItem(
        id="interconnection",
        title="Network Interconnection",
        description="Guidelines and information on network interconnection.",
        keywords=("interconnection", "network", "interconnect", "guidelines"),
        url="/licensing/interconnection",
        type="page",
    ),
    # Resources & Documents
    ServiceCatalogItem(
        id="legislation-regulations",
        title="Legislation & Regulations",
        description="Browse BOCRA's acts, policies, and regulatory guidelines.",
        keywords=("legislation", "regulations", "laws", "acts", "policy"),
        url="/resources/legislation",
        type="page",
    ),
    ServiceCatalogItem(
        id="policies-frameworks",
        title="Policies & Frameworks",
        description="Explore BOCRA's regulatory frameworks and strategic policies.",
        keywords=("policies", "frameworks", "regulatory", "guidelines", "framework"),
        url="/resources/policies",
        type="page",
    ),
    ServiceCatalogItem(
        id="consumer-education",
        title="Consumer Education",
        description="Know your consumer rights and responsibilities.",
        keywords=("consumer", "education", "rights", "responsibilities", "protection"),
        url="/resources/consumer-education",
        type="page",
    ),
    ServiceCatalogItem(
        id="forms-documents",
        title="Forms & Documents",
        description="Download application forms, templates, and official documents.",
        keywords=("forms", "documents", "templates", "download", "applications"),
        url="/resources/forms-documents",
        type="page",
    ),
    ServiceCatalogItem(
        id="publications",
        title="Publications",
        description="Access BOCRA reports, studies, research papers and publications.",
        keywords=("publications", "reports", "studies", "papers", "research"),
        url="/resources/publications",
        type="page",
    ),
    ServiceCatalogItem(
        id="annual-reports",
        title="Annual Reports",
        description="View BOCRA's yearly performance and sector reports.",
        keywords=("annual", "reports", "performance", "sector", "yearly"),
        url="/about/annual-reports",
        type="page",
    ),
    ServiceCatalogItem(
        id="faqs",
        title="FAQs",
        description="Find answers to frequently asked questions about BOCRA services.",
        keywords=("faq", "frequently", "asked", "questions", "help"),
        url="/faqs",
        type="page",
    ),
    ServiceCatalogItem(
        id="tenders",
        title="Tenders & Procurement",
        description="View current BOCRA procurement opportunities and tenders.",
        keywords=("tender", "procurement", "opportunity", "contract", "bid"),
        url="/resources/tenders",
        type="page",
    ),
    ServiceCatalogItem(
        id="statistics",
        title="Statistics & Market Data",
        description="Access market data and sector indicators for the telecom industry.",
        keywords=("statistics", "data", "market", "indicators", "sector"),
        url="/resources/statistics",
        type="page",
    ),
    # Content Sections
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
