import { supabase } from "@/lib/supabase";

export type AppRole = "admin" | "customer" | string;

export interface MeResponse {
  user: {
    id: string;
    email?: string | null;
  };
  profile: {
    id: string;
    role: AppRole;
    full_name?: string | null;
    gender?: string | null;
    date_of_birth?: string | null;
    phone?: string | null;
    address?: string | null;
    profile_photo_url?: string | null;
    consent_given: boolean;
    created_at?: string | null;
    updated_at?: string | null;
  };
}

interface AuthSession {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in?: number;
}

interface AuthResponse {
  user: {
    id: string;
    email?: string | null;
  };
  session?: AuthSession | null;
  message?: string | null;
}

const ACCESS_TOKEN_KEY = "bocra_access_token";
const PROFILE_ROLE_KEY = "bocra_profile_role";
const AUTH_LOG_PREFIX = "[auth]";

function logAuthInfo(event: string, meta?: Record<string, unknown>): void {
  if (import.meta.env.DEV) {
    console.info(`${AUTH_LOG_PREFIX} ${event}`, meta || {});
  }
}

function logAuthWarn(event: string, meta?: Record<string, unknown>): void {
  console.warn(`${AUTH_LOG_PREFIX} ${event}`, meta || {});
}

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}


function getApiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_BASE_URL?.trim();
  const fallback = "http://localhost:8000";
  return (configured || fallback).replace(/\/$/, "");
}

function getAuthHeader() {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
      ...getAuthHeader(),
    },
  });

  if (!response.ok) {
    let message = "Request failed";
    try {
      const body = await response.json();
      message = body.detail || body.message || message;
    } catch {
      // keep fallback message
    }
    logAuthWarn("api_request_failed", {
      path,
      status: response.status,
      method: init?.method || "GET",
      message,
    });
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return (await response.json()) as T;
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function clearAccessToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(PROFILE_ROLE_KEY);
}

export function getStoredRole(): AppRole | null {
  return localStorage.getItem(PROFILE_ROLE_KEY);
}

function storeProfileRole(role?: AppRole): void {
  if (!role) {
    localStorage.removeItem(PROFILE_ROLE_KEY);
    return;
  }

  localStorage.setItem(PROFILE_ROLE_KEY, role);
}

function maybeStoreToken(response: AuthResponse): void {
  if (response.session?.access_token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, response.session.access_token);
    logAuthInfo("access_token_stored", { source: "auth_response" });
  }
}

function syncTokenFromSupabaseSession(source: string, accessToken?: string | null): void {
  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    logAuthInfo("access_token_stored", { source });
    return;
  }

  clearAccessToken();
  logAuthInfo("access_token_cleared", { source });
}

export function subscribeToSupabaseAuthChanges(onChange?: () => void): () => void {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_OUT") {
      syncTokenFromSupabaseSession(`supabase_${event.toLowerCase()}`, null);
      onChange?.();
      return;
    }

    if (session?.access_token) {
      syncTokenFromSupabaseSession(`supabase_${event.toLowerCase()}`, session.access_token);
      onChange?.();
    }
  });

  return () => {
    subscription.unsubscribe();
  };
}

export async function signup(payload: {
  email: string;
  password: string;
  full_name?: string;
}): Promise<AuthResponse> {
  const response = await request<AuthResponse>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  maybeStoreToken(response);
  return response;
}

export async function login(payload: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const response = await request<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  maybeStoreToken(response);
  return response;
}

export async function logout(): Promise<void> {
  logAuthInfo("logout_clearing_local_session");
  clearAccessToken();

  // Fire-and-forget server logout to avoid blocking UI navigation.
  void request<{ message: string }>("/api/auth/logout", {
    method: "POST",
  }).catch((error) => {
    logAuthWarn("logout_api_failed", {
      reason: error instanceof Error ? error.message : "unknown",
    });
  });

  void supabase.auth.signOut().catch((error) => {
    logAuthWarn("logout_supabase_failed", {
      reason: error instanceof Error ? error.message : "unknown",
    });
  });
}

export async function signInWithGoogle(): Promise<void> {
  const redirectTo = `${window.location.origin}/`;
  logAuthInfo("google_oauth_started", { redirectTo });
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });

  if (error) {
    throw new Error(error.message || "Google sign-in failed");
  }
}

export async function getMe(): Promise<MeResponse> {
  const response = await request<MeResponse>("/api/auth/me", { method: "GET" });
  storeProfileRole(response.profile.role);
  return response;
}

export async function bootstrapAuth(): Promise<MeResponse | null> {
  let token = getAccessToken();

  if (!token) {
    const { data } = await supabase.auth.getSession();
    const supabaseToken = data.session?.access_token;
    if (supabaseToken) {
      syncTokenFromSupabaseSession("supabase_session", supabaseToken);
      token = supabaseToken;
    }
  }

  if (!token) {
    return null;
  }

  try {
    return await getMe();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      logAuthWarn("bootstrap_auth_401", { action: "attempt_refresh" });
      // Token may be stale; ask Supabase for latest session once before signing out.
      const { data } = await supabase.auth.getSession();
      const refreshedToken = data.session?.access_token;

      if (refreshedToken && refreshedToken !== token) {
        syncTokenFromSupabaseSession("supabase_refresh", refreshedToken);
        try {
          return await getMe();
        } catch (retryError) {
          if (retryError instanceof ApiError && retryError.status !== 401) {
            logAuthWarn("bootstrap_auth_retry_non_401", { status: retryError.status });
            return null;
          }
        }
      }

      logAuthWarn("bootstrap_auth_clearing_token", { reason: "unauthorized" });
      clearAccessToken();
      return null;
    }

    // Preserve session on transient backend/network/rate-limit failures.
    logAuthWarn("bootstrap_auth_transient_error", {
      reason: error instanceof Error ? error.message : "unknown",
    });
    return null;
  }
}
