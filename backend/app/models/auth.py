from __future__ import annotations

from datetime import date, datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, StrictStr


class SignUpRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: StrictStr = Field(min_length=3, max_length=320)
    password: StrictStr = Field(min_length=8, max_length=128)
    full_name: StrictStr | None = Field(default=None, max_length=200)


class LoginRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: StrictStr = Field(min_length=3, max_length=320)
    password: StrictStr = Field(min_length=8, max_length=128)


class AuthUserResponse(BaseModel):
    id: UUID
    email: str | None = None


class AuthSessionResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int | None = None


class AuthResponse(BaseModel):
    user: AuthUserResponse
    session: AuthSessionResponse | None = None
    message: str | None = None


class ProfileResponse(BaseModel):
    id: UUID
    role: Literal["customer", "admin"] | str
    full_name: str | None = None
    gender: str | None = None
    date_of_birth: date | None = None
    phone: str | None = None
    address: str | None = None
    profile_photo_url: str | None = None
    consent_given: bool = False
    created_at: datetime | None = None
    updated_at: datetime | None = None


class MeResponse(BaseModel):
    user: AuthUserResponse
    profile: ProfileResponse
