from __future__ import annotations

import logging
import os
import smtplib
from email.message import EmailMessage

from app.core.config import get_settings

logger = logging.getLogger("app.email")


def send_email(*, to_email: str, subject: str, body: str) -> bool:
    """
    Send a plaintext email. Returns True on send success, False otherwise.
    Uses SMTP_* environment variables; logs and no-ops when unconfigured.
    """
    settings = get_settings()
    smtp_host = str(settings.smtp_host or os.getenv("SMTP_HOST") or "").strip()
    smtp_port = int(str(settings.smtp_port or os.getenv("SMTP_PORT") or "587").strip() or "587")
    smtp_user = str(settings.smtp_username or os.getenv("SMTP_USERNAME") or "").strip()
    smtp_password = str(settings.smtp_password or os.getenv("SMTP_PASSWORD") or "").strip()
    smtp_from = str(settings.smtp_from or os.getenv("SMTP_FROM") or "").strip()
    smtp_use_tls = bool(settings.smtp_use_tls)

    if settings.debug:
        preview = body.strip().replace("\n", " ")[:220]
        logger.info(
            "email_debug_mode_no_send to=%s subject=%s body_preview=%s",
            to_email,
            subject,
            preview,
        )
        return True

    if not smtp_host or not smtp_from:
        logger.info(
            "email_not_sent_missing_smtp_config to=%s subject=%s",
            to_email,
            subject,
        )
        return False

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
        return True
    except Exception as exc:
        logger.error(
            "email_send_failed to=%s subject=%s smtp_host=%s error=%s exc_type=%s",
            to_email,
            subject,
            smtp_host,
            exc,
            type(exc).__name__,
        )
        return False
