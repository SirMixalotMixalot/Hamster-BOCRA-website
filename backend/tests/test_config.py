import pytest

from app.core.config import Settings


def test_settings_accepts_legacy_supabase_key():
    settings = Settings(
        supabase_url="https://example.supabase.co",
        supabase_secret_key="",
        supabase_service_role_key="legacy-key",
    )

    assert settings.supabase_secret_key == "legacy-key"


def test_settings_rejects_missing_secret_key():
    with pytest.raises(ValueError, match="SUPABASE_SECRET_KEY"):
        Settings(
            supabase_url="https://example.supabase.co",
            supabase_secret_key=None,
            supabase_service_role_key=None,
        )


def test_cors_origins_are_normalized_and_deduplicated():
    settings = Settings(
        supabase_url="https://example.supabase.co",
        supabase_secret_key="test-key",
        frontend_origin="https://frontend.example.com/, http://localhost:8080/",
    )

    assert "https://frontend.example.com" in settings.cors_origins
    assert "http://localhost:8080" in settings.cors_origins
    assert "https://frontend.example.com/" not in settings.cors_origins
