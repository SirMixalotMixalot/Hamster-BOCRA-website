from __future__ import annotations

from datetime import datetime
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, StrictStr

from app.constants import BOCRA_LICENCE_TYPES


class ApplicationCreateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    licence_type: Literal[
        "Aircraft Radio Licence",
        "Amateur Radio License",
        "Broadcasting Licence",
        "Cellular Licence",
        "Citizen Band Radio Licence",
        "Point-to-Multipoint Licence",
        "Point-to-Point Licence",
        "Private Radio Communication Licence",
        "Radio Dealers Licence",
        "Radio Frequency Licence",
        "Satellite Service Licence",
        "Type Approval Licence",
        "VANS Licence",
    ]
    form_data_a: dict[str, Any] | None = None
    form_data_b: dict[str, Any] | None = None
    form_data_c: dict[str, Any] | None = None
    form_data_d: dict[str, Any] | None = None


class ApplicationPatchRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    licence_type: Literal[
        "Aircraft Radio Licence",
        "Amateur Radio License",
        "Broadcasting Licence",
        "Cellular Licence",
        "Citizen Band Radio Licence",
        "Point-to-Multipoint Licence",
        "Point-to-Point Licence",
        "Private Radio Communication Licence",
        "Radio Dealers Licence",
        "Radio Frequency Licence",
        "Satellite Service Licence",
        "Type Approval Licence",
        "VANS Licence",
    ] | None = None
    form_data_a: dict[str, Any] | None = None
    form_data_b: dict[str, Any] | None = None
    form_data_c: dict[str, Any] | None = None
    form_data_d: dict[str, Any] | None = None
    # Admin-only fields (will be validated in endpoint)
    status: Literal["draft", "submitted", "under_review", "waiting_for_payment", "approved", "rejected", "requires_action"] | None = None
    admin_notes: str | None = None
    decision_reason: str | None = None


class ApplicationRequestInfoRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    note: StrictStr = Field(min_length=1, max_length=2000)


class ApplicationDecideRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    status: Literal["approved", "rejected"]
    decision_reason: StrictStr = Field(min_length=1, max_length=1000)
    admin_notes: str | None = None


class ApplicationSubmitRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    pass  # No body required for submit


class ApplicationListItem(BaseModel):
    id: UUID
    reference_number: str
    licence_type: str
    status: str
    submitted_at: datetime | None = None
    created_at: datetime
    updated_at: datetime


class ApplicationDetail(BaseModel):
    id: UUID
    applicant_id: UUID
    reference_number: str
    licence_type: str
    status: str
    form_data_a: dict[str, Any] | None = None
    form_data_b: dict[str, Any] | None = None
    form_data_c: dict[str, Any] | None = None
    form_data_d: dict[str, Any] | None = None
    admin_notes: str | None = None
    decision_reason: str | None = None
    decided_by: UUID | None = None
    decided_at: datetime | None = None
    submitted_at: datetime | None = None
    documents: list["ApplicationDocumentSummary"] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime


class ApplicationDocumentSummary(BaseModel):
    id: UUID
    file_name: str
    file_type: str | None = None
    file_size: int | None = None
    category: str | None = None
    created_at: datetime


class ApplicationStatusLog(BaseModel):
    id: UUID
    old_status: str | None = None
    new_status: str
    changed_by: UUID | None = None
    reason: str | None = None
    created_at: datetime


class LicenceVerificationItem(BaseModel):
    licence_number: str
    customer_name: str
    licence_type: str
    issue_date: datetime
    expiration_date: datetime
    status: Literal["Active", "Expired", "Suspended"]


class LicenceVerificationResponse(BaseModel):
    items: list[LicenceVerificationItem]
    count: int
