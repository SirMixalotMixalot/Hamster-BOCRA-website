from __future__ import annotations

import base64
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
import hashlib
import hmac
import json
import logging
import os
import secrets

logger = logging.getLogger("app.email_verification")

_CODE_LENGTH = 6
_CODE_TTL_SECONDS = 10 * 60
_RESEND_COOLDOWN_SECONDS = 60
_MAX_VERIFY_ATTEMPTS = 5


@dataclass
class VerificationState:
    code_hash: str
    expires_at: datetime
    attempts_left: int
    resend_allowed_at: datetime
    verified_until: datetime | None = None


_STORE: dict[str, VerificationState] = {}


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _build_code() -> str:
    # Keep to numeric digits for easier UX in mobile and form fields.
    return "".join(str(secrets.randbelow(10)) for _ in range(_CODE_LENGTH))


def _hash_code(raw_code: str) -> str:
    return hashlib.sha256(raw_code.encode("utf-8")).hexdigest()


def _b64_url_encode(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).decode("ascii").rstrip("=")


def _b64_url_decode(raw: str) -> bytes:
    padding = "=" * (-len(raw) % 4)
    return base64.urlsafe_b64decode((raw + padding).encode("ascii"))


def _secret_bytes() -> bytes:
    secret = (
        os.getenv("VERIFICATION_TOKEN_SECRET")
        or os.getenv("SUPABASE_SECRET_KEY")
        or os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        or "local-dev-verification-secret"
    )
    return secret.encode("utf-8")


def _sign_payload(payload_json: str) -> str:
    signature = hmac.new(_secret_bytes(), payload_json.encode("utf-8"), hashlib.sha256).digest()
    return _b64_url_encode(signature)


def _create_token(payload: dict[str, str | int]) -> str:
    payload_json = json.dumps(payload, separators=(",", ":"), sort_keys=True)
    payload_encoded = _b64_url_encode(payload_json.encode("utf-8"))
    signature = _sign_payload(payload_json)
    return f"{payload_encoded}.{signature}"


def _verify_token(token: str) -> dict[str, str | int] | None:
    try:
        payload_encoded, signature = token.split(".", 1)
        payload_json = _b64_url_decode(payload_encoded).decode("utf-8")
    except Exception:
        return None

    expected_signature = _sign_payload(payload_json)
    if not hmac.compare_digest(signature, expected_signature):
        return None

    try:
        payload = json.loads(payload_json)
    except Exception:
        return None

    if not isinstance(payload, dict):
        return None
    return payload


def create_or_refresh_code(user_key: str) -> tuple[str, int]:
    now = _utc_now()
    existing = _STORE.get(user_key)
    if existing and now < existing.resend_allowed_at:
        retry_after = int((existing.resend_allowed_at - now).total_seconds())
        return "", max(retry_after, 1)

    raw_code = _build_code()
    _STORE[user_key] = VerificationState(
        code_hash=_hash_code(raw_code),
        expires_at=now + timedelta(seconds=_CODE_TTL_SECONDS),
        attempts_left=_MAX_VERIFY_ATTEMPTS,
        resend_allowed_at=now + timedelta(seconds=_RESEND_COOLDOWN_SECONDS),
        verified_until=None,
    )
    return raw_code, 0


def issue_code_challenge(user_key: str, raw_code: str) -> str:
    now = _utc_now()
    payload = {
        "type": "complaint_challenge",
        "email": user_key,
        "code_hash": _hash_code(raw_code),
        "exp": int((now + timedelta(seconds=_CODE_TTL_SECONDS)).timestamp()),
    }
    return _create_token(payload)


def verify_code_challenge(user_key: str, raw_code: str, challenge_token: str) -> tuple[bool, str]:
    payload = _verify_token(challenge_token)
    if payload is None:
        return False, "Invalid verification challenge"

    if payload.get("type") != "complaint_challenge":
        return False, "Invalid verification challenge"

    token_email = str(payload.get("email") or "")
    if token_email != user_key:
        return False, "Verification challenge email mismatch"

    exp_raw = payload.get("exp")
    try:
        exp = int(exp_raw)
    except Exception:
        return False, "Invalid verification challenge"

    if int(_utc_now().timestamp()) > exp:
        return False, "Verification code has expired"

    token_code_hash = str(payload.get("code_hash") or "")
    if not token_code_hash:
        return False, "Invalid verification challenge"

    if not hmac.compare_digest(token_code_hash, _hash_code(raw_code)):
        return False, "Invalid verification code"

    return True, "Verification successful"


def issue_verification_ticket(user_key: str) -> str:
    now = _utc_now()
    payload = {
        "type": "complaint_verified",
        "email": user_key,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(seconds=_CODE_TTL_SECONDS)).timestamp()),
    }
    return _create_token(payload)


def verify_verification_ticket(user_key: str, verification_ticket: str) -> tuple[bool, str]:
    payload = _verify_token(verification_ticket)
    if payload is None:
        return False, "Invalid verification ticket"

    if payload.get("type") != "complaint_verified":
        return False, "Invalid verification ticket"

    token_email = str(payload.get("email") or "")
    if token_email != user_key:
        return False, "Verification ticket email mismatch"

    exp_raw = payload.get("exp")
    try:
        exp = int(exp_raw)
    except Exception:
        return False, "Invalid verification ticket"

    if int(_utc_now().timestamp()) > exp:
        return False, "Verification ticket has expired"

    return True, "Verification successful"


def mark_recently_verified(user_key: str) -> None:
    now = _utc_now()
    state = _STORE.get(user_key)
    if state is None:
        _STORE[user_key] = VerificationState(
            code_hash="",
            expires_at=now,
            attempts_left=_MAX_VERIFY_ATTEMPTS,
            resend_allowed_at=now,
            verified_until=now + timedelta(seconds=_CODE_TTL_SECONDS),
        )
        return

    state.verified_until = now + timedelta(seconds=_CODE_TTL_SECONDS)


def verify_code(user_key: str, raw_code: str) -> tuple[bool, str]:
    now = _utc_now()
    state = _STORE.get(user_key)
    if state is None:
        return False, "No verification code has been sent"

    if now > state.expires_at:
        _STORE.pop(user_key, None)
        return False, "Verification code has expired"

    if state.attempts_left <= 0:
        _STORE.pop(user_key, None)
        return False, "Too many invalid attempts. Request a new code"

    if not hmac.compare_digest(state.code_hash, _hash_code(raw_code)):
        state.attempts_left -= 1
        if state.attempts_left <= 0:
            _STORE.pop(user_key, None)
            return False, "Too many invalid attempts. Request a new code"
        return False, f"Invalid verification code ({state.attempts_left} attempts left)"

    state.verified_until = now + timedelta(seconds=_CODE_TTL_SECONDS)
    return True, "Verification successful"


def is_recently_verified(user_key: str) -> bool:
    state = _STORE.get(user_key)
    if state is None or state.verified_until is None:
        return False
    return _utc_now() <= state.verified_until
