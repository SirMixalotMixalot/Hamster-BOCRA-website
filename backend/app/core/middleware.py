from __future__ import annotations

import logging
from typing import Any

from fastapi import Request
from fastapi.responses import JSONResponse
from supabase_auth.errors import AuthApiError

from app.db.client import get_supabase_admin

EXEMPT_API_PATHS = {
    "/api/auth/signup",
    "/api/auth/login",
    "/api/applications/verify",
    "/api/applications/verify/",
    "/api/complaints",
    "/api/complaints/",
    "/api/complaints/verification/send",
    "/api/complaints/verification/send/",
    "/api/complaints/verification/verify",
    "/api/complaints/verification/verify/",
    "/api/decisions",
    "/api/decisions/",
    "/api/news",
    "/api/news/",
    "/api/documents/public",
    "/api/documents/public/",
    "/api/search",
    "/api/stats",
    "/api/stats/",
}

EXEMPT_API_PREFIXES = (
    "/api/complaints/track/",
)
logger = logging.getLogger("app.auth.middleware")


def _unauthorized(detail: str) -> JSONResponse:
    logger.warning("auth_middleware_unauthorized detail=%s", detail)
    return JSONResponse(status_code=401, content={"detail": detail})


def _forbidden(detail: str) -> JSONResponse:
    logger.warning("auth_middleware_forbidden detail=%s", detail)
    return JSONResponse(status_code=403, content={"detail": detail})


async def auth_context_middleware(request: Request, call_next):
    path = request.url.path

    if request.method == "OPTIONS":
        return await call_next(request)

    if (
        not path.startswith("/api")
        or path in EXEMPT_API_PATHS
        or any(path.startswith(prefix) for prefix in EXEMPT_API_PREFIXES)
    ):
        return await call_next(request)

    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        logger.warning("auth_middleware_missing_bearer path=%s", path)
        return _unauthorized("Missing bearer token")

    token = auth_header.replace("Bearer ", "", 1).strip()
    if not token:
        logger.warning("auth_middleware_empty_bearer path=%s", path)
        return _unauthorized("Missing bearer token")

    supabase = get_supabase_admin()
    try:
        user_response = supabase.auth.get_user(token)
    except AuthApiError as exc:
        logger.warning("auth_middleware_token_validation_failed path=%s detail=%s", path, str(exc))
        return _unauthorized("Invalid or expired access token")
    except Exception:
        logger.exception("auth_middleware_token_validation_error path=%s", path)
        return _unauthorized("Invalid or expired access token")
    user = getattr(user_response, "user", None)

    if user is None:
        logger.warning("auth_middleware_invalid_token path=%s", path)
        return _unauthorized("Invalid or expired access token")

    profile_result = (
        supabase.table("profiles")
        .select(
            "id,role,full_name,gender,date_of_birth,phone,address,profile_photo_url,consent_given,created_at,updated_at"
        )
        .eq("id", str(user.id))
        .limit(1)
        .execute()
    )

    rows = profile_result.data or []
    if not rows:
        logger.warning("auth_middleware_profile_missing path=%s user_id=%s", path, str(user.id))
        supabase.table("profiles").upsert(
            {
                "id": str(user.id),
                "role": "customer",
                "consent_given": False,
            },
            on_conflict="id",
        ).execute()

        profile_result = (
            supabase.table("profiles")
            .select(
                "id,role,full_name,gender,date_of_birth,phone,address,profile_photo_url,consent_given,created_at,updated_at"
            )
            .eq("id", str(user.id))
            .limit(1)
            .execute()
        )

        rows = profile_result.data or []
        if not rows:
            return _forbidden("Profile not found for authenticated user")

    profile_row = rows[0]
    if not isinstance(profile_row, dict):
        return _forbidden("Invalid profile payload")

    profile = profile_row

    request.state.user = {
        "id": str(user.id),
        "email": getattr(user, "email", None),
        "token": token,
    }
    request.state.profile = profile

    if path.startswith("/api/admin") and profile.get("role") != "admin":
        logger.warning("auth_middleware_admin_block path=%s user_id=%s role=%s", path, str(user.id), profile.get("role"))
        return _forbidden("Admin role required")

    return await call_next(request)
