from __future__ import annotations

import logging
import os
import smtplib
from email.message import EmailMessage

logger = logging.getLogger("app.email")


def send_email(*, to_email: str, subject: str, body: str) -> bool:
    """
    Send a plaintext email. Returns True on send success, False otherwise.
    Uses SMTP_* environment variables; logs and no-ops when unconfigured.
    """
    smtp_host = (os.getenv("SMTP_HOST") or "").strip()
    smtp_port = int((os.getenv("SMTP_PORT") or "587").strip() or "587")
    smtp_user = (os.getenv("SMTP_USERNAME") or "").strip()
    smtp_password = (os.getenv("SMTP_PASSWORD") or "").strip()
    smtp_from = (os.getenv("SMTP_FROM") or smtp_user).strip()
    smtp_use_tls = (os.getenv("SMTP_USE_TLS") or "true").strip().lower() not in {"0", "false", "no"}

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
        with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as client:
            if smtp_use_tls:
                client.starttls()
            if smtp_user:
                client.login(smtp_user, smtp_password)
            client.send_message(message)
        return True
    except Exception as exc:
        logger.warning(
            "email_send_failed to=%s subject=%s error=%s",
            to_email,
            subject,
            exc,
        )
        return False
