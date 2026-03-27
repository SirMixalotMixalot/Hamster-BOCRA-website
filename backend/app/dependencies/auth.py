from __future__ import annotations

from typing import Any

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from supabase_auth.errors import AuthApiError

from app.db.client import get_supabase_admin

bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict[str, Any]:
    middleware_user = getattr(request.state, "user", None)
    if isinstance(middleware_user, dict):
        return middleware_user

    if credentials is None or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing bearer token",
        )

    token = credentials.credentials
    supabase = get_supabase_admin()
    try:
        user_response = supabase.auth.get_user(token)
    except AuthApiError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token",
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token",
        )
    user = getattr(user_response, "user", None)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token",
        )

    return {
        "id": str(user.id),
        "email": getattr(user, "email", None),
        "token": token,
    }


async def get_current_profile(
    request: Request,
    current_user: dict[str, Any] = Depends(get_current_user),
) -> dict[str, Any]:
    middleware_profile = getattr(request.state, "profile", None)
    if isinstance(middleware_profile, dict):
        return middleware_profile

    supabase = get_supabase_admin()
    result = (
        supabase.table("profiles")
        .select(
            "id,role,full_name,gender,date_of_birth,phone,address,profile_photo_url,consent_given,created_at,updated_at"
        )
        .eq("id", current_user["id"])
        .limit(1)
        .execute()
    )

    rows = result.data or []
    if not rows:
        supabase.table("profiles").upsert(
            {
                "id": current_user["id"],
                "role": "customer",
                "consent_given": False,
            },
            on_conflict="id",
        ).execute()

        result = (
            supabase.table("profiles")
            .select(
                "id,role,full_name,gender,date_of_birth,phone,address,profile_photo_url,consent_given,created_at,updated_at"
            )
            .eq("id", current_user["id"])
            .limit(1)
            .execute()
        )
        rows = result.data or []
        if not rows:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found for authenticated user",
            )

    profile_row = rows[0]
    if not isinstance(profile_row, dict):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Invalid profile payload",
        )

    return profile_row


async def require_admin(profile: dict[str, Any] = Depends(get_current_profile)) -> dict[str, Any]:
    if profile.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin role required",
        )

    return profile
