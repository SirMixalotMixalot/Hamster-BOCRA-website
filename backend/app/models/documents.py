from __future__ import annotations

from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, StrictStr


class DocumentUploadResponse(BaseModel):
    """Response model for successful document upload."""
    id: UUID
    application_id: UUID | None = None
    uploaded_by: UUID
    file_name: str
    file_type: str
    file_size: int
    category: str
    created_at: datetime


class DocumentResponse(BaseModel):
    """Response model for document metadata retrieval."""
    id: UUID
    application_id: UUID | None = None
    uploaded_by: UUID
    file_name: str
    file_type: str
    file_size: int
    category: str
    created_at: datetime
    download_url: str | None = None


class DocumentListItem(BaseModel):
    """Response model for listing documents."""
    id: UUID
    application_id: UUID | None = None
    file_name: str
    category: str
    file_size: int
    created_at: datetime
