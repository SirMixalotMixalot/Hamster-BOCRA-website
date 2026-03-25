from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

DECISION_TYPES = {
    "licensing",
    "enforcement_action",
    "policy",
    "public_notice",
    "tariff_approval",
    "other",
}


def _clean_optional_text(value: str | None) -> str | None:
    if value is None:
        return None
    cleaned = value.strip()
    return cleaned or None


class DecisionCreateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str = Field(min_length=1, max_length=300)
    summary: str | None = Field(default=None, max_length=2000)
    decision_type: str | None = None
    document_url: str | None = Field(default=None, max_length=2000)
    is_public: bool = True
    decided_at: datetime | None = None

    @field_validator("title", mode="before")
    @classmethod
    def validate_title(cls, value: Any) -> str:
        if value is None:
            raise ValueError("title is required")
        cleaned = str(value).strip()
        if not cleaned:
            raise ValueError("title cannot be empty")
        return cleaned

    @field_validator("summary", "document_url", mode="before")
    @classmethod
    def clean_optional_text(cls, value: Any) -> str | None:
        if value is None:
            return None
        return _clean_optional_text(str(value))

    @field_validator("decision_type", mode="before")
    @classmethod
    def clean_and_validate_type(cls, value: Any) -> str | None:
        if value is None:
            return None
        cleaned = _clean_optional_text(str(value).lower())
        if cleaned is None:
            return None
        if cleaned not in DECISION_TYPES:
            raise ValueError(f"decision_type must be one of: {', '.join(sorted(DECISION_TYPES))}")
        return cleaned


class DecisionItem(BaseModel):
    id: UUID | str
    title: str
    summary: str | None = None
    decision_type: str | None = None
    document_url: str | None = None
    decided_at: datetime | None = None
    created_at: datetime


class DecisionsListResponse(BaseModel):
    items: list[DecisionItem]
    count: int
    limit: int
    offset: int
