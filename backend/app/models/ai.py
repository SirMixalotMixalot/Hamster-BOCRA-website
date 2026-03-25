from __future__ import annotations

from pydantic import BaseModel, ConfigDict


class AIChatRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    message: str
    conversation_id: str | None = None


class AIChatResponse(BaseModel):
    reply: str
    sources: list[str] | None = None
