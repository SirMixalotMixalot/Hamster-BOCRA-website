from __future__ import annotations

from pydantic import BaseModel

from app.models.applications import ApplicationListItem
from app.models.complaints import ComplaintListItem
from app.models.support import SupportTicketItem


class PortalBatchResponse(BaseModel):
    applications: list[ApplicationListItem]
    complaints: list[ComplaintListItem]
    support_tickets: list[SupportTicketItem]


class LicenceTypeDistributionItem(BaseModel):
    licence_type: str
    count: int


class RegionalCoverageItem(BaseModel):
    region: str
    total: int
    by_sector: dict[str, int]
    by_licence_type: list[LicenceTypeDistributionItem]


class ApplicationsAnalyticsResponse(BaseModel):
    total_eligible_licences: int
    status_breakdown: dict[str, int]
    licence_type_distribution: list[LicenceTypeDistributionItem]
    regional_coverage: list[RegionalCoverageItem]


class ComplaintsTrendPoint(BaseModel):
    date: str
    telecom: int
    broadcasting: int
    postal: int
    internet: int


class SectorBreakdownItem(BaseModel):
    sector: str
    total: int


class CompanyBreakdownItem(BaseModel):
    company: str
    total: int


class SectorAlert(BaseModel):
    sector: str
    total: int
    normal: float
    threshold: float
    today: int
    is_alert: bool


class ComplaintsAnalyticsResponse(BaseModel):
    total_complaints: int
    open_complaints: int
    trend_days: int
    trend: list[ComplaintsTrendPoint]
    sector_breakdown: list[SectorBreakdownItem]
    company_breakdown: list[CompanyBreakdownItem]
    company_breakdown_by_sector: dict[str, list[CompanyBreakdownItem]]
    sector_alerts: list[SectorAlert]
    alert_count: int


class AdminDashboardBatchResponse(BaseModel):
    applications: ApplicationsAnalyticsResponse
    complaints: ComplaintsAnalyticsResponse
    applications_list: list[ApplicationListItem]
    complaints_list: list[ComplaintListItem]
    support_tickets: list[SupportTicketItem]
