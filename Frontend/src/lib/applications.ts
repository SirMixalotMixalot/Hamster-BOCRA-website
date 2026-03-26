import { getAccessToken } from "@/lib/auth";
import { getApiBaseUrl } from "@/lib/api";
import type { BocraLicenceType } from "@/lib/constants";

export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "requires_action";

export interface ApplicationListItem {
  id: string;
  reference_number: string;
  licence_type: string;
  status: ApplicationStatus;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApplicationDetail extends ApplicationListItem {
  applicant_id: string;
  form_data_a: Record<string, unknown> | null;
  form_data_b: Record<string, unknown> | null;
  form_data_c: Record<string, unknown> | null;
  form_data_d: Record<string, unknown> | null;
  documents: Array<{
    id: string;
    file_name: string;
    file_type: string | null;
    file_size: number | null;
    category: string | null;
    created_at: string;
  }>;
  admin_notes: string | null;
  decision_reason: string | null;
  decided_by: string | null;
  decided_at: string | null;
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
      // ignore parse failures
    }
    throw new Error(message);
  }

  return (await response.json()) as T;
}

export async function listApplications(): Promise<ApplicationListItem[]> {
  return request<ApplicationListItem[]>("/api/applications", { method: "GET" });
}

export async function createApplication(payload: {
  licence_type: BocraLicenceType;
  form_data_a?: Record<string, unknown>;
  form_data_b?: Record<string, unknown>;
  form_data_c?: Record<string, unknown>;
  form_data_d?: Record<string, unknown>;
}): Promise<ApplicationDetail> {
  return request<ApplicationDetail>("/api/applications", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getApplication(applicationId: string): Promise<ApplicationDetail> {
  return request<ApplicationDetail>(`/api/applications/${applicationId}`, { method: "GET" });
}

export async function updateApplication(
  applicationId: string,
  payload: {
    licence_type?: BocraLicenceType;
    form_data_a?: Record<string, unknown>;
    form_data_b?: Record<string, unknown>;
    form_data_c?: Record<string, unknown>;
    form_data_d?: Record<string, unknown>;
  },
): Promise<ApplicationDetail> {
  return request<ApplicationDetail>(`/api/applications/${applicationId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function submitApplication(applicationId: string): Promise<ApplicationDetail> {
  return request<ApplicationDetail>(`/api/applications/${applicationId}/submit`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus,
  adminNotes?: string,
): Promise<ApplicationDetail> {
  return request<ApplicationDetail>(`/api/applications/${applicationId}`, {
    method: "PATCH",
    body: JSON.stringify({
      status,
      admin_notes: adminNotes,
    }),
  });
}
