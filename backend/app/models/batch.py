from __future__ import annotations

from pydantic import BaseModel

from app.models.applications import ApplicationListItem
from app.models.complaints import ComplaintListItem
from app.models.support import SupportTicketItem


class PortalBatchResponse(BaseModel):
    applications: list[ApplicationListItem]
    complaints: list[ComplaintListItem]
    support_tickets: list[SupportTicketItem]
