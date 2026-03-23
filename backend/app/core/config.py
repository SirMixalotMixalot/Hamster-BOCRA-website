from pydantic_settings import BaseSettings
from functools import lru_cache
import os


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    
    Supabase credentials are required for database and storage operations.
    - SUPABASE_SECRET_KEY: Backend-only secret key (formerly SUPABASE_SERVICE_ROLE_KEY)
    """

    supabase_url: str
    supabase_secret_key: str = None
    supabase_service_role_key: str = None  # Deprecated; falls back to secret_key

    class Config:
        env_file = ".env"

    def __init__(self, **data):
        super().__init__(**data)
        
        # Validate supabase_url
        if not self.supabase_url:
            raise ValueError("SUPABASE_URL environment variable is required and cannot be empty")
        
        # Handle secret key with fallback support
        secret_key = self.supabase_secret_key or self.supabase_service_role_key
        
        if not secret_key:
            raise ValueError(
                "SUPABASE_SECRET_KEY environment variable is required. "
                "Get it from Supabase Dashboard → Settings → API. "
                "(Legacy: SUPABASE_SERVICE_ROLE_KEY also supported for compatibility)"
            )
        
        self.supabase_secret_key = secret_key


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
