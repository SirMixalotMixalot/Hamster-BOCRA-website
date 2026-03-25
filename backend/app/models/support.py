from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

SUPPORT_STATUSES = {"open", "replied", "closed"}
SUPPORT_CATEGORIES = {
    "technical",
    "billing",
    "complaint",
    "general_inquiry",
    "license_renewal",
    "other",
}


def _clean_required_text(value: str | None) -> str:
    if value is None:
        raise ValueError("Field is required")
    cleaned = str(value).strip()
    if not cleaned:
        raise ValueError("Field cannot be empty")
    return cleaned


def _clean_optional_text(value: str | None) -> str | None:
    if value is None:
        return None
    cleaned = value.strip()
    return cleaned or None


class SupportTicketCreateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    subject: str = Field(min_length=1, max_length=300)
    category: str | None = None
    message: str = Field(min_length=1, max_length=5000)
    attachment_ids: list[UUID] | None = Field(default=None)

    @field_validator("subject", "message", mode="before")
    @classmethod
    def validate_required_text(cls, value: Any) -> str:
        return _clean_required_text(value)

    @field_validator("category", mode="before")
    @classmethod
    def clean_and_validate_category(cls, value: Any) -> str | None:
        if value is None:
            return None
        cleaned = _clean_optional_text(str(value).lower())
        if cleaned is None:
            return None
        if cleaned not in SUPPORT_CATEGORIES:
            raise ValueError(f"category must be one of: {', '.join(sorted(SUPPORT_CATEGORIES))}")
        return cleaned

    @field_validator("attachment_ids", mode="before")
    @classmethod
    def validate_attachment_ids(cls, value: Any) -> list[UUID] | None:
        if value is None:
            return None
        if not isinstance(value, list):
            raise ValueError("attachment_ids must be a list of UUIDs")
        return [UUID(str(uuid_val)) if not isinstance(uuid_val, UUID) else uuid_val for uuid_val in value]


class SupportTicketUpdateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    admin_reply: str | None = Field(default=None, max_length=5000)
    status: str | None = None
    category: str | None = None

    @field_validator("admin_reply", "category", mode="before")
    @classmethod
    def clean_optional_text(cls, value: Any) -> str | None:
        if value is None:
            return None
        return _clean_optional_text(str(value))

    @field_validator("status", mode="before")
    @classmethod
    def clean_and_validate_status(cls, value: Any) -> str | None:
        if value is None:
            return None
        cleaned = _clean_optional_text(str(value).lower())
        if cleaned is None:
            raise ValueError("status cannot be empty")
        if cleaned not in SUPPORT_STATUSES:
            raise ValueError(f"status must be one of: {', '.join(sorted(SUPPORT_STATUSES))}")
        return cleaned

    @field_validator("category", mode="before")
    @classmethod
    def clean_and_validate_category(cls, value: Any) -> str | None:
        if value is None:
            return None
        cleaned = _clean_optional_text(str(value).lower())
        if cleaned is None:
            return None
        if cleaned not in SUPPORT_CATEGORIES:
            raise ValueError(f"category must be one of: {', '.join(sorted(SUPPORT_CATEGORIES))}")
        return cleaned

    @model_validator(mode="after")
    def validate_has_update(self) -> "SupportTicketUpdateRequest":
        if all(value is None for value in (self.admin_reply, self.status, self.category)):
            raise ValueError("At least one field (admin_reply, status, or category) is required")
        return self


class SupportTicketItem(BaseModel):
    id: UUID | str
    subject: str
    category: str | None = None
    message: str
    attachment_ids: list[UUID] | None = None
    status: str
    admin_reply: str | None = None
    replied_by: UUID | str | None = None
    created_at: datetime
    updated_at: datetime


class SupportTicketsListResponse(BaseModel):
    items: list[SupportTicketItem]
    count: int
    limit: int
    offset: int
