from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

STATS_ALLOWED_SECTORS = {
    "telecom",
    "broadcasting",
    "postal",
    "internet",
}


class StatsCreateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    metric_name: str = Field(min_length=1, max_length=100)
    value: Decimal = Field(ge=0)
    unit: str = Field(min_length=1, max_length=50)
    period: str = Field(min_length=1, max_length=100)
    sector: Literal["telecom", "broadcasting", "postal", "internet"]
    source: str | None = Field(default=None, max_length=300)

    @field_validator("metric_name", "unit", "period", mode="before")
    @classmethod
    def strip_required_text(cls, value: Any) -> str:
        cleaned = str(value or "").strip()
        if not cleaned:
            raise ValueError("Field cannot be blank")
        return cleaned

    @field_validator("source", mode="before")
    @classmethod
    def strip_optional_text(cls, value: Any) -> str | None:
        if value is None:
            return None
        cleaned = str(value).strip()
        return cleaned or None


class StatsUpdateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    metric_name: str | None = Field(default=None, min_length=1, max_length=100)
    value: Decimal | None = Field(default=None, ge=0)
    unit: str | None = Field(default=None, min_length=1, max_length=50)
    period: str | None = Field(default=None, min_length=1, max_length=100)
    sector: Literal["telecom", "broadcasting", "postal", "internet"] | None = None
    source: str | None = Field(default=None, max_length=300)

    @field_validator("metric_name", "unit", "period", mode="before")
    @classmethod
    def strip_required_text(cls, value: Any) -> str | None:
        if value is None:
            return None
        cleaned = str(value).strip()
        if not cleaned:
            raise ValueError("Field cannot be blank")
        return cleaned

    @field_validator("source", mode="before")
    @classmethod
    def strip_optional_text(cls, value: Any) -> str | None:
        if value is None:
            return None
        cleaned = str(value).strip()
        return cleaned or None

    @model_validator(mode="after")
    def validate_has_update(self) -> "StatsUpdateRequest":
        if all(
            value is None
            for value in (
                self.metric_name,
                self.value,
                self.unit,
                self.period,
                self.sector,
                self.source,
            )
        ):
            raise ValueError("At least one field must be provided")
        return self


class StatsItem(BaseModel):
    id: UUID
    metric_name: str
    value: float
    unit: str
    period: str
    sector: Literal["telecom", "broadcasting", "postal", "internet"]
    source: str | None = None
    created_at: datetime


class StatsListResponse(BaseModel):
    items: list[StatsItem]
    limit: int
    count: int
