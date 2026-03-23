from __future__ import annotations

from collections import defaultdict, deque
import logging
from time import time
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.dependencies.auth import get_current_profile, get_current_user
from app.models.auth import (
    AuthResponse,
    AuthSessionResponse,
    AuthUserResponse,
    LoginRequest,
    MeResponse,
    ProfileResponse,
    SignUpRequest,
)
from app.db.client import get_supabase_admin

router = APIRouter(prefix="/api/auth", tags=["auth"])
_bearer = HTTPBearer(auto_error=False)
logger = logging.getLogger("app.auth")

# In-memory rate limiter: 5 requests per minute per IP + endpoint.
_RATE_LIMIT_BUCKETS: dict[str, deque[float]] = defaultdict(deque)
_RATE_LIMIT_WINDOW_SECONDS = 60
_RATE_LIMIT_MAX_REQUESTS = 5


def _check_rate_limit(request: Request) -> None:
    client_ip = request.client.host if request.client else "unknown"
    key = f"{request.url.path}:{client_ip}"
    now = time()
    bucket = _RATE_LIMIT_BUCKETS[key]

    while bucket and (now - bucket[0]) > _RATE_LIMIT_WINDOW_SECONDS:
        bucket.popleft()

    if len(bucket) >= _RATE_LIMIT_MAX_REQUESTS:
        logger.warning(
            "auth_rate_limit_exceeded path=%s ip=%s limit=%s window_seconds=%s",
            request.url.path,
            client_ip,
            _RATE_LIMIT_MAX_REQUESTS,
            _RATE_LIMIT_WINDOW_SECONDS,
        )
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many authentication attempts. Please try again in 1 minute.",
        )

    bucket.append(now)


def _to_auth_response(auth_result: Any, message: str | None = None) -> AuthResponse:
    user = getattr(auth_result, "user", None)
    session = getattr(auth_result, "session", None)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Supabase did not return a user",
        )

    session_payload = None
    if session is not None and getattr(session, "access_token", None):
        session_payload = AuthSessionResponse(
            access_token=session.access_token,
            refresh_token=session.refresh_token,
            token_type=getattr(session, "token_type", "bearer"),
            expires_in=getattr(session, "expires_in", None),
        )

    return AuthResponse(
        user=AuthUserResponse(id=user.id, email=getattr(user, "email", None)),
        session=session_payload,
        message=message,
    )


def _raise_auth_error(error: Exception) -> None:
    detail = str(error) or "Authentication request failed"
    lowered = detail.lower()
    logger.warning("auth_provider_error detail=%s", detail)

    if "invalid" in lowered or "expired" in lowered or "credentials" in lowered:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)

    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


@router.post("/signup", response_model=AuthResponse)
async def signup(payload: SignUpRequest, request: Request) -> AuthResponse:
    _check_rate_limit(request)

    try:
        supabase = get_supabase_admin()
        auth_result = supabase.auth.sign_up(
            {
                "email": payload.email,
                "password": payload.password,
                "options": {
                    "data": {
                        "full_name": payload.full_name,
                        "role": "customer",
                    }
                },
            }
        )
    except Exception as error:
        _raise_auth_error(error)

    response = _to_auth_response(auth_result, message="Signup successful")
    logger.info("auth_signup_success user_id=%s", response.user.id)
    return response


@router.post("/login", response_model=AuthResponse)
async def login(payload: LoginRequest, request: Request) -> AuthResponse:
    _check_rate_limit(request)

    try:
        supabase = get_supabase_admin()
        auth_result = supabase.auth.sign_in_with_password(
            {"email": payload.email, "password": payload.password}
        )
    except Exception as error:
        _raise_auth_error(error)

    response = _to_auth_response(auth_result, message="Login successful")
    logger.info("auth_login_success user_id=%s", response.user.id)
    return response


@router.post("/logout")
async def logout(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> dict[str, str]:
    _check_rate_limit(request)

    if credentials is None or not credentials.credentials:
        logger.warning("auth_logout_missing_bearer")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing bearer token",
        )

    # Validate token before acknowledging logout.
    try:
        supabase = get_supabase_admin()
        user_response = supabase.auth.get_user(credentials.credentials)
    except Exception as error:
        _raise_auth_error(error)

    if getattr(user_response, "user", None) is None:
        logger.warning("auth_logout_invalid_token")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token",
        )

    # Supabase access tokens are stateless JWTs; client-side session/token clearance is required.
    logger.info("auth_logout_success")
    return {"message": "Logout successful"}


@router.get("/me", response_model=MeResponse)
async def me(
    request: Request,
    current_user: dict[str, Any] = Depends(get_current_user),
    current_profile: dict[str, Any] = Depends(get_current_profile),
) -> MeResponse:
    logger.info("auth_me_success user_id=%s role=%s", current_user["id"], current_profile.get("role"))
    return MeResponse(
        user=AuthUserResponse(id=current_user["id"], email=current_user.get("email")),
        profile=ProfileResponse(**current_profile),
    )
