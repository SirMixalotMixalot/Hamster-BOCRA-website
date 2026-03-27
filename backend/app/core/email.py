from __future__ import annotations

from dataclasses import dataclass
import logging
import os
import smtplib
from email.message import EmailMessage

from app.core.config import get_settings

logger = logging.getLogger("app.email")


@dataclass
class EmailSendResult:
    ok: bool
    code: str | None = None
    message: str | None = None


def _pick_env(*names: str) -> str:
    for name in names:
        value = os.getenv(name)
        if value is not None and str(value).strip():
            return str(value).strip()
    return ""


def send_email_detailed(*, to_email: str, subject: str, body: str) -> EmailSendResult:
    """
    Send a plaintext email. Returns True on send success, False otherwise.
    Uses SMTP_* environment variables; logs and no-ops when unconfigured.
    """
    settings = get_settings()
    smtp_host = str(
        settings.smtp_host or _pick_env("SMTP_HOST", "MAIL_HOST", "EMAIL_HOST")
    ).strip()
    smtp_port = int(str(settings.smtp_port or os.getenv("SMTP_PORT") or "587").strip() or "587")
    smtp_user = str(
        settings.smtp_username or _pick_env("SMTP_USERNAME", "SMTP_USER", "MAIL_USERNAME")
    ).strip()
    smtp_password = str(
        settings.smtp_password or _pick_env("SMTP_PASSWORD", "SMTP_PASS", "MAIL_PASSWORD")
    ).strip()
    smtp_from = str(
        settings.smtp_from or _pick_env("SMTP_FROM", "MAIL_FROM", "EMAIL_FROM")
    ).strip()
    smtp_use_tls = bool(settings.smtp_use_tls)

    if settings.debug:
        preview = body.strip().replace("\n", " ")[:220]
        logger.info(
            "email_debug_mode_no_send to=%s subject=%s body_preview=%s",
            to_email,
            subject,
            preview,
        )
        return EmailSendResult(ok=True)

    if not smtp_host or not smtp_from:
        missing_vars = []
        if not smtp_host:
            missing_vars.append("SMTP_HOST")
        if not smtp_from:
            missing_vars.append("SMTP_FROM")
        logger.error(
            "email_not_sent_missing_smtp_config to=%s subject=%s missing_variables=%s smtp_host_configured=%s smtp_from_configured=%s smtp_username_configured=%s smtp_password_configured=%s",
            to_email,
            subject,
            ",".join(missing_vars),
            bool(smtp_host),
            bool(smtp_from),
            bool(smtp_user),
            bool(smtp_password),
        )
        return EmailSendResult(
            ok=False,
            code="missing_config",
            message=(
                "Missing required email config: " + ", ".join(missing_vars)
                if missing_vars
                else "Missing required email config"
            ),
        )

    if smtp_user and not smtp_password:
        logger.error(
            "email_not_sent_missing_password to=%s subject=%s smtp_user_set=true smtp_password_set=false",
            to_email,
            subject,
        )
        return EmailSendResult(
            ok=False,
            code="missing_config",
            message="Missing required email config: SMTP_PASSWORD",
        )

    message = EmailMessage()
    message["From"] = smtp_from
    message["To"] = to_email
    message["Subject"] = subject
    message.set_content(body)

    try:
        logger.debug(
            "email_sending_attempt to=%s subject=%s smtp_host=%s smtp_port=%s",
            to_email,
            subject,
            smtp_host,
            smtp_port,
        )
        with smtplib.SMTP(smtp_host, smtp_port, timeout=120) as client:
            if smtp_use_tls:
                logger.debug("email_starting_tls smtp_host=%s", smtp_host)
                client.starttls()
            if smtp_user:
                logger.debug("email_logging_in smtp_user=%s", smtp_user)
                client.login(smtp_user, smtp_password)
            logger.debug("email_sending_message to=%s", to_email)
            client.send_message(message)
        logger.info(
            "email_sent_successfully to=%s subject=%s",
            to_email,
            subject,
        )
        return EmailSendResult(ok=True)
    except smtplib.SMTPAuthenticationError as exc:
        logger.error(
            "email_send_failed_authentication to=%s subject=%s smtp_host=%s smtp_user=%s error=%s",
            to_email,
            subject,
            smtp_host,
            smtp_user if smtp_user else "NOT_SET",
            str(exc),
        )
        return EmailSendResult(
            ok=False,
            code="smtp_auth",
            message="SMTP authentication failed. Check SMTP_USERNAME/SMTP_PASSWORD.",
        )
    except smtplib.SMTPException as exc:
        error_msg = str(exc)
        if "timeout" in error_msg.lower() or "timed out" in error_msg.lower():
            logger.error(
                "email_send_failed_timeout to=%s subject=%s smtp_host=%s smtp_port=%s timeout_seconds=120 error=%s",
                to_email,
                subject,
                smtp_host,
                smtp_port,
                error_msg,
            )
            return EmailSendResult(
                ok=False,
                code="timeout",
                message="SMTP request timed out while sending email.",
            )
        elif "connection" in error_msg.lower() or "refused" in error_msg.lower():
            logger.error(
                "email_send_failed_connection to=%s subject=%s smtp_host=%s smtp_port=%s error=%s",
                to_email,
                subject,
                smtp_host,
                smtp_port,
                error_msg,
            )
            return EmailSendResult(
                ok=False,
                code="connection",
                message="SMTP connection failed. Check SMTP_HOST/SMTP_PORT and provider network rules.",
            )
        else:
            logger.error(
                "email_send_failed_smtp to=%s subject=%s smtp_host=%s error=%s",
                to_email,
                subject,
                smtp_host,
                error_msg,
            )
            return EmailSendResult(
                ok=False,
                code="smtp_error",
                message="SMTP provider returned an error while sending email.",
            )
    except Exception as exc:
        logger.error(
            "email_send_failed to=%s subject=%s smtp_host=%s exc_type=%s error=%s",
            to_email,
            subject,
            smtp_host,
            type(exc).__name__,
            str(exc),
        )
        return EmailSendResult(
            ok=False,
            code="unknown",
            message=f"Unexpected email error: {type(exc).__name__}",
        )


def send_email(*, to_email: str, subject: str, body: str) -> bool:
    return send_email_detailed(to_email=to_email, subject=subject, body=body).ok
