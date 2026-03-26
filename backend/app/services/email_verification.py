from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
import hashlib
import hmac
import logging
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
