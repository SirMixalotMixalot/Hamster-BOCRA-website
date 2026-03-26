import { getApiBaseUrl } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";

export type SupportStatus = "open" | "replied" | "closed";
export type SupportCategory =
  | "technical"
  | "billing"
  | "complaint"
  | "general_inquiry"
  | "license_renewal"
  | "other";

export interface SupportTicketItem {
  id: string;
  subject: string;
  category: string | null;
  message: string;
  attachment_ids: string[] | null;
  status: SupportStatus;
  admin_reply: string | null;
  replied_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupportTicketsResponse {
  items: SupportTicketItem[];
  count: number;
  limit: number;
  offset: number;
}

const SUPPORT_TICKETS_CACHE_TTL_MS = 2 * 60 * 1000;

let supportTicketsCache:
  | {
      token: string | null;
      fetchedAt: number;
      data: SupportTicketsResponse;
    }
  | null = null;

function invalidatePortalBatchCacheEventually(): void {
  void import("@/lib/batch")
    .then((mod) => {
      mod.invalidatePortalBatchCache();
    })
    .catch(() => {
      // no-op
    });
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAccessToken();
  if (!token) {
    throw new Error("You must be signed in to continue.");
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    let message = "Request failed";
    try {
      const body = (await response.json()) as { detail?: string; message?: string };
      message = body.detail || body.message || message;
    } catch {
      // keep fallback
    }
    throw new Error(message);
  }

  return (await response.json()) as T;
}

export function setSupportTicketsCache(response: SupportTicketsResponse): void {
  supportTicketsCache = {
    token: getAccessToken(),
    fetchedAt: Date.now(),
    data: response,
  };
}

export function invalidateSupportTicketsCache(): void {
  supportTicketsCache = null;
  invalidatePortalBatchCacheEventually();
}

export async function listSupportTickets(options?: { force?: boolean }): Promise<SupportTicketsResponse> {
  const token = getAccessToken();
  const now = Date.now();

  if (
    !options?.force &&
    supportTicketsCache &&
    supportTicketsCache.token === token &&
    now - supportTicketsCache.fetchedAt <= SUPPORT_TICKETS_CACHE_TTL_MS
  ) {
    return supportTicketsCache.data;
  }

  const response = await request<SupportTicketsResponse>("/api/support/tickets", { method: "GET" });
  setSupportTicketsCache(response);
  return response;
}

export async function createSupportTicket(payload: {
  subject: string;
  message: string;
  category?: SupportCategory;
}): Promise<SupportTicketItem> {
  const created = await request<SupportTicketItem>("/api/support/tickets", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  invalidateSupportTicketsCache();
  return created;
}
