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

interface ComplaintsListResponse {
  items: ComplaintListItem[];
  count: number;
  limit: number;
  offset: number;
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

export async function listComplaints(params?: { status?: ComplaintStatus; category?: string }): Promise<ComplaintsListResponse> {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.category) query.set("category", params.category);
  const qs = query.toString();
  return request<ComplaintsListResponse>(`/api/complaints${qs ? `?${qs}` : ""}`, { method: "GET" });
}

export async function getComplaint(complaintId: string): Promise<ComplaintDetailResponse> {
  return request<ComplaintDetailResponse>(`/api/complaints/${complaintId}`, { method: "GET" });
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
