from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

NEWS_ALLOWED_TAGS = {
    "press_release",
    "public_notice",
    "announcement",
    "tender",
}


def _clean_optional_text(value: str | None) -> str | None:
    if value is None:
        return None
    cleaned = value.strip()
    return cleaned or None


class NewsCreateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str = Field(min_length=1, max_length=300)
    description: str | None = Field(default=None, max_length=2000)
    content: str | None = Field(default=None, max_length=20000)
    tag: str | None = None
    published: bool = False
    published_at: datetime | None = None

    @field_validator("title", mode="before")
    @classmethod
    def validate_title(cls, value: Any) -> str:
        if value is None:
            raise ValueError("title is required")
        cleaned = str(value).strip()
        if not cleaned:
            raise ValueError("title cannot be empty")
        return cleaned

    @field_validator("description", "content", mode="before")
    @classmethod
    def clean_optional_text(cls, value: Any) -> str | None:
        if value is None:
            return None
        return _clean_optional_text(str(value))

    @field_validator("tag", mode="before")
    @classmethod
    def clean_and_validate_tag(cls, value: Any) -> str | None:
        if value is None:
            return None
        cleaned = _clean_optional_text(str(value).lower())
        if cleaned is None:
            return None
        if cleaned not in NEWS_ALLOWED_TAGS:
            raise ValueError(f"tag must be one of: {', '.join(sorted(NEWS_ALLOWED_TAGS))}")
        return cleaned


class NewsUpdateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str | None = Field(default=None, min_length=1, max_length=300)
    description: str | None = Field(default=None, max_length=2000)
    content: str | None = Field(default=None, max_length=20000)
    tag: str | None = None
    published: bool | None = None
    published_at: datetime | None = None

    @field_validator("title", mode="before")
    @classmethod
    def validate_title(cls, value: Any) -> str | None:
        if value is None:
            return None
        cleaned = str(value).strip()
        if not cleaned:
            raise ValueError("title cannot be empty")
        return cleaned

    @field_validator("description", "content", mode="before")
    @classmethod
    def clean_optional_text(cls, value: Any) -> str | None:
        if value is None:
            return None
        return _clean_optional_text(str(value))

    @field_validator("tag", mode="before")
    @classmethod
    def clean_and_validate_tag(cls, value: Any) -> str | None:
        if value is None:
            return None
        cleaned = _clean_optional_text(str(value).lower())
        if cleaned is None:
            return None
        if cleaned not in NEWS_ALLOWED_TAGS:
            raise ValueError(f"tag must be one of: {', '.join(sorted(NEWS_ALLOWED_TAGS))}")
        return cleaned

    @model_validator(mode="after")
    def require_at_least_one_field(self) -> "NewsUpdateRequest":
        if all(
            field is None
            for field in (
                self.title,
                self.description,
                self.content,
                self.tag,
                self.published,
                self.published_at,
            )
        ):
            raise ValueError("At least one field must be provided")
        return self


class NewsPublicItem(BaseModel):
    id: UUID
    title: str
    description: str | None = None
    content: str | None = None
    tag: str | None = None
    published_at: datetime | None = None
    created_at: datetime


class NewsAdminItem(BaseModel):
    id: UUID
    title: str
    description: str | None = None
    content: str | None = None
    tag: str | None = None
    published: bool
    published_at: datetime | None = None
    created_at: datetime
    updated_at: datetime


class NewsListResponse(BaseModel):
    items: list[NewsPublicItem]
    limit: int
    offset: int
    count: int
