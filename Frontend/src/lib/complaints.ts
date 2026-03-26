import { getAccessToken } from "@/lib/auth";
import { getApiBaseUrl } from "@/lib/api";

export type ComplaintStatus = "open" | "investigating" | "resolved" | "closed";

export interface ComplaintListItem {
  id: string;
  reference_number: string | null;
  subject: string;
  category: string | null;
  status: ComplaintStatus;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface ComplaintDetailResponse extends ComplaintListItem {
  description: string;
  admin_response: string | null;
  evidence_file_ids: string[] | null;
  resolved_by: string | null;
  complainant_id?: string | null;
}

export interface ComplaintsListResponse {
  items: ComplaintListItem[];
  count: number;
  limit: number;
  offset: number;
}

export interface ComplaintCreatePayload {
  email: string;
  subject: string;
  category?: string;
  description: string;
  evidence_file_ids?: string[];
}

export interface ComplaintVerificationResponse {
  message: string;
  retry_after_seconds?: number | null;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAccessToken();
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    let message = "Request failed";
    try {
      const body = await response.json();
      message = body.detail || body.message || message;
    } catch {
      // ignore parse failure
    }
    throw new Error(message);
  }

  return (await response.json()) as T;
}

export async function listComplaints(params?: { status?: ComplaintStatus; category?: string; q?: string }): Promise<ComplaintsListResponse> {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.category) query.set("category", params.category);
  if (params?.q) query.set("q", params.q);
  const qs = query.toString();
  return request<ComplaintsListResponse>(`/api/complaints${qs ? `?${qs}` : ""}`, { method: "GET" });
}

export async function getComplaint(complaintId: string): Promise<ComplaintDetailResponse> {
  return request<ComplaintDetailResponse>(`/api/complaints/${complaintId}`, { method: "GET" });
}

export async function trackComplaintByReference(referenceNumber: string): Promise<ComplaintDetailResponse> {
  const normalized = referenceNumber.trim().toUpperCase();
  return request<ComplaintDetailResponse>(`/api/complaints/track/${encodeURIComponent(normalized)}`, { method: "GET" });
}

export async function createComplaint(payload: ComplaintCreatePayload): Promise<ComplaintDetailResponse> {
  return request<ComplaintDetailResponse>("/api/complaints", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function sendComplaintVerificationCode(email: string): Promise<ComplaintVerificationResponse> {
  return request<ComplaintVerificationResponse>("/api/complaints/verification/send", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function verifyComplaintVerificationCode(
  email: string,
  code: string,
): Promise<ComplaintVerificationResponse> {
  return request<ComplaintVerificationResponse>("/api/complaints/verification/verify", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });
}

export async function updateComplaint(
  complaintId: string,
  payload: { status?: ComplaintStatus; admin_response?: string; category?: string },
): Promise<ComplaintDetailResponse> {
  return request<ComplaintDetailResponse>(`/api/complaints/${complaintId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
