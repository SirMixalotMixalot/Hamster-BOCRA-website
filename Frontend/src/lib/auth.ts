import { supabase } from "@/lib/supabase";
import { getApiBaseUrl } from "@/lib/api";

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
    id_number?: string | null;
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
const ME_CACHE_KEY = "bocra_me_cache";
const AUTH_LOG_PREFIX = "[auth]";

const JWT_EXPIRY_SKEW_SECONDS = 15;

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
function getAuthHeader() {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length < 2) {
    return null;
  }

  try {
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payload + "=".repeat((4 - (payload.length % 4)) % 4);
    const json = atob(padded);
    const parsed = JSON.parse(json);
    return typeof parsed === "object" && parsed !== null ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function isJwtExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  const exp = payload?.exp;
  if (typeof exp !== "number") {
    // If we cannot parse expiry, treat token as unusable to avoid backend 401 spam.
    return true;
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  return exp <= nowSeconds + JWT_EXPIRY_SKEW_SECONDS;
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
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (!token) {
    return null;
  }

  if (isJwtExpired(token)) {
    logAuthInfo("access_token_expired_client_side", { action: "clear" });
    clearAccessToken();
    return null;
  }

  return token;
}

export function clearAccessToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(PROFILE_ROLE_KEY);
  localStorage.removeItem(ME_CACHE_KEY);

  // Clear in-memory caches tied to previous auth state.
  void import("@/lib/batch")
    .then((mod) => {
      mod.invalidatePortalBatchCache();
    })
    .catch(() => {
      // no-op
    });

  void import("@/lib/applications")
    .then((mod) => {
      mod.invalidateApplicationsListCache();
    })
    .catch(() => {
      // no-op
    });

  void import("@/lib/support")
    .then((mod) => {
      mod.invalidateSupportTicketsCache();
    })
    .catch(() => {
      // no-op
    });

  void import("@/lib/complaints")
    .then((mod) => {
      mod.invalidateComplaintsListCache();
    })
    .catch(() => {
      // no-op
    });

  void import("@/lib/adminBatch")
    .then((mod) => {
      mod.invalidateAdminDashboardBatchCache();
    })
    .catch(() => {
      // no-op
    });
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

function storeCachedMe(me: MeResponse): void {
  localStorage.setItem(ME_CACHE_KEY, JSON.stringify(me));
}

export function getCachedMe(): MeResponse | null {
  const raw = localStorage.getItem(ME_CACHE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as MeResponse;
  } catch {
    localStorage.removeItem(ME_CACHE_KEY);
    return null;
  }
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
  const token = getAccessToken();

  // Fire-and-forget server logout before clearing local token to avoid missing bearer 401 logs.
  if (token) {
    void request<{ message: string }>("/api/auth/logout", {
      method: "POST",
    }).catch((error) => {
      logAuthWarn("logout_api_failed", {
        reason: error instanceof Error ? error.message : "unknown",
      });
    });
  }

  logAuthInfo("logout_clearing_local_session");
  clearAccessToken();

  void supabase.auth.signOut().catch((error) => {
    logAuthWarn("logout_supabase_failed", {
      reason: error instanceof Error ? error.message : "unknown",
    });
  });
}

export async function signInWithGoogle(): Promise<void> {
  const redirectTo = `${window.location.origin}/customer/dashboard`;
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
  storeCachedMe(response);
  return response;
}

export async function updateMeProfile(payload: {
  full_name?: string | null;
  id_number?: string | null;
  gender?: string | null;
  date_of_birth?: string | null;
  phone?: string | null;
  address?: string | null;
  profile_photo_url?: string | null;
  consent_given?: boolean;
}): Promise<MeResponse> {
  const response = await request<MeResponse>("/api/auth/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  storeProfileRole(response.profile.role);
  storeCachedMe(response);
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
