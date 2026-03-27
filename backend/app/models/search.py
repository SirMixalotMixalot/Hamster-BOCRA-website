from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


SearchResultType = Literal["news", "decision", "document", "service"]


class SearchResultItem(BaseModel):
    type: SearchResultType
    title: str
    snippet: str
    url: str
    section: str | None = None
    action: str | None = None
    score: float = Field(ge=0)


class SearchResponse(BaseModel):
    query: str
    results: list[SearchResultItem]
