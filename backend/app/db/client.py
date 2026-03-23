from supabase import create_client, Client
from app.config import get_settings


def get_supabase_admin() -> Client:
    settings = get_settings()
    return create_client(settings.supabase_url, settings.supabase_secret_key)


# Backward-compatible alias.
def get_supabase() -> Client:
    return get_supabase_admin()
