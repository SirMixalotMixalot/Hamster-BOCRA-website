from __future__ import annotations

from datetime import datetime
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

COMPLAINT_STATUSES = {"open", "investigating", "resolved", "closed"}


def _clean_optional_text(value: str | None) -> str | None:
    if value is None:
        return None
    cleaned = value.strip()
    return cleaned or None


class ComplaintCreateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: str = Field(min_length=3, max_length=320)
    subject: str = Field(min_length=1, max_length=300)
    category: str | None = Field(default=None, max_length=120)
    description: str = Field(min_length=1, max_length=5000)
    evidence_file_ids: list[UUID] | None = None
    verification_ticket: str | None = Field(default=None, max_length=2000)

    @field_validator("subject", "description", mode="before")
    @classmethod
    def validate_required_text(cls, value: Any) -> str:
        cleaned = str(value or "").strip()
        if not cleaned:
            raise ValueError("Field cannot be blank")
        return cleaned

    @field_validator("email", mode="before")
    @classmethod
    def validate_email(cls, value: Any) -> str:
        cleaned = str(value or "").strip().lower()
        if not cleaned or "@" not in cleaned:
            raise ValueError("Valid email is required")
        return cleaned

    @field_validator("category", mode="before")
    @classmethod
    def clean_optional_text(cls, value: Any) -> str | None:
        if value is None:
            return None
        return _clean_optional_text(str(value))


class ComplaintUpdateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    status: Literal["open", "investigating", "resolved", "closed"] | None = None
    admin_response: str | None = Field(default=None, max_length=5000)
    category: str | None = Field(default=None, max_length=120)
    resolved_by: UUID | None = None
    resolved_at: datetime | None = None

    @field_validator("admin_response", "category", mode="before")
    @classmethod
    def clean_optional_text(cls, value: Any) -> str | None:
        if value is None:
            return None
        return _clean_optional_text(str(value))

    @model_validator(mode="after")
    def validate_has_update(self) -> "ComplaintUpdateRequest":
        if all(
            value is None
            for value in (
                self.status,
                self.admin_response,
                self.category,
                self.resolved_by,
                self.resolved_at,
            )
        ):
            raise ValueError(
                "At least one field (status, admin_response, category, resolved_by, resolved_at) is required"
            )
        return self


class ComplaintListItem(BaseModel):
    id: UUID | str
    reference_number: str | None = None
    subject: str
    category: str | None = None
    status: str
    created_at: datetime
    updated_at: datetime
    resolved_at: datetime | None = None


class ComplaintDetailResponse(BaseModel):
    id: UUID | str
    reference_number: str | None = None
    subject: str
    category: str | None = None
    description: str
    status: str
    admin_response: str | None = None
    evidence_file_ids: list[UUID] | None = None
    resolved_by: UUID | str | None = None
    resolved_at: datetime | None = None
    created_at: datetime
    updated_at: datetime
    complainant_id: UUID | str | None = None


class ComplaintsListResponse(BaseModel):
    items: list[ComplaintListItem]
    count: int
    limit: int
    offset: int


class ComplaintVerificationSendRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: str = Field(min_length=3, max_length=320)

    @field_validator("email", mode="before")
    @classmethod
    def validate_email(cls, value: Any) -> str:
        cleaned = str(value or "").strip().lower()
        if not cleaned:
            raise ValueError("Email is required")
        if "@" not in cleaned:
            raise ValueError("Invalid email format")
        return cleaned


class ComplaintVerificationVerifyRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: str = Field(min_length=3, max_length=320)
    code: str = Field(min_length=6, max_length=6)
    challenge_token: str | None = Field(default=None, max_length=2000)

    @field_validator("email", mode="before")
    @classmethod
    def validate_email(cls, value: Any) -> str:
        cleaned = str(value or "").strip().lower()
        if not cleaned:
            raise ValueError("Email is required")
        if "@" not in cleaned:
            raise ValueError("Invalid email format")
        return cleaned

    @field_validator("code", mode="before")
    @classmethod
    def validate_code(cls, value: Any) -> str:
        cleaned = "".join(ch for ch in str(value or "") if ch.isdigit())
        if len(cleaned) != 6:
            raise ValueError("Verification code must be 6 digits")
        return cleaned


class ComplaintVerificationResponse(BaseModel):
    message: str
    retry_after_seconds: int | None = None
    challenge_token: str | None = None
    verification_ticket: str | None = None
