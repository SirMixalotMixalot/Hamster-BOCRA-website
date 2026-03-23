from __future__ import annotations

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    
    Supabase credentials are required for database and storage operations.
    - SUPABASE_SECRET_KEY: Backend-only secret key (formerly SUPABASE_SERVICE_ROLE_KEY)
    """

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    supabase_url: str
    supabase_secret_key: str | None = None
    supabase_service_role_key: str | None = None  # Legacy fallback
    frontend_origin: str | None = None

    def __init__(self, **data):
        super().__init__(**data)
        
        if not self.supabase_url:
            raise ValueError("SUPABASE_URL environment variable is required and cannot be empty")

        secret_key = self.supabase_secret_key or self.supabase_service_role_key

        if not secret_key:
            raise ValueError(
                "SUPABASE_SECRET_KEY environment variable is required. "
                "Get it from Supabase Dashboard → Settings → API. "
                "(Legacy: SUPABASE_SERVICE_ROLE_KEY also supported for compatibility)"
            )

        self.supabase_secret_key = secret_key

    @property
    def cors_origins(self) -> list[str]:
        origins = {
            "http://localhost:8080",
            "http://127.0.0.1:8080",
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "https://hamster-bocra-website.vercel.app",
            "https://hamster-bocra-website-bfcixftw5-sirmixalotmixalots-projects.vercel.app",
        }
        if self.frontend_origin:
            for origin in (item.strip() for item in self.frontend_origin.split(",")):
                if origin:
                    origins.add(origin)
        return sorted(origins)


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()
