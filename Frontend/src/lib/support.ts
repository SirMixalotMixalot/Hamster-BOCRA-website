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

export async function listSupportTickets(): Promise<SupportTicketsResponse> {
  return request<SupportTicketsResponse>("/api/support/tickets", { method: "GET" });
}

export async function createSupportTicket(payload: {
  subject: string;
  message: string;
  category?: SupportCategory;
}): Promise<SupportTicketItem> {
  return request<SupportTicketItem>("/api/support/tickets", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
