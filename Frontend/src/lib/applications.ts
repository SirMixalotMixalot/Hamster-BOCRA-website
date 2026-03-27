import { getAccessToken } from "@/lib/auth";
import { getApiBaseUrl } from "@/lib/api";
import type { BocraLicenceType } from "@/lib/constants";

export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "waiting_for_payment"
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

export interface ApplicationStatusLogItem {
  id: string;
  old_status: string | null;
  new_status: string;
  changed_by: string | null;
  reason: string | null;
  created_at: string;
}

const APPLICATIONS_CACHE_TTL_MS = 2 * 60 * 1000;
const APPLICATION_HISTORY_BATCH_CACHE_TTL_MS = 2 * 60 * 1000;

let applicationsListCache:
  | {
      token: string | null;
      fetchedAt: number;
      data: ApplicationListItem[];
    }
  | null = null;

let applicationHistoryBatchCache = new Map<
  string,
  {
    token: string | null;
    fetchedAt: number;
    data: Map<string, ApplicationStatusLogItem[]>;
  }
>();

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

export function setApplicationsListCache(items: ApplicationListItem[]): void {
  applicationsListCache = {
    token: getAccessToken(),
    fetchedAt: Date.now(),
    data: items,
  };
}

export function invalidateApplicationsListCache(): void {
  applicationsListCache = null;
  applicationHistoryBatchCache.clear();
  invalidatePortalBatchCacheEventually();
}

export async function listApplications(options?: { force?: boolean }): Promise<ApplicationListItem[]> {
  const token = getAccessToken();
  const now = Date.now();

  if (
    !options?.force &&
    applicationsListCache &&
    applicationsListCache.token === token &&
    now - applicationsListCache.fetchedAt <= APPLICATIONS_CACHE_TTL_MS
  ) {
    return applicationsListCache.data;
  }

  const data = await request<ApplicationListItem[]>("/api/applications", { method: "GET" });
  setApplicationsListCache(data);
  return data;
}

export async function createApplication(payload: {
  licence_type: BocraLicenceType;
  form_data_a?: Record<string, unknown>;
  form_data_b?: Record<string, unknown>;
  form_data_c?: Record<string, unknown>;
  form_data_d?: Record<string, unknown>;
}): Promise<ApplicationDetail> {
  const result = await request<ApplicationDetail>("/api/applications", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  invalidateApplicationsListCache();
  return result;
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
  const result = await request<ApplicationDetail>(`/api/applications/${applicationId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  invalidateApplicationsListCache();
  return result;
}

export async function submitApplication(applicationId: string): Promise<ApplicationDetail> {
  const result = await request<ApplicationDetail>(`/api/applications/${applicationId}/submit`, {
    method: "POST",
    body: JSON.stringify({}),
  });
  invalidateApplicationsListCache();
  return result;
}

export async function resubmitApplication(applicationId: string): Promise<ApplicationDetail> {
  const result = await request<ApplicationDetail>(`/api/applications/${applicationId}/resubmit`, {
    method: "POST",
    body: JSON.stringify({}),
  });
  invalidateApplicationsListCache();
  return result;
}

export async function requestApplicationInfo(applicationId: string, note: string): Promise<ApplicationDetail> {
  const result = await request<ApplicationDetail>(`/api/applications/${applicationId}/request-info`, {
    method: "POST",
    body: JSON.stringify({ note }),
  });
  invalidateApplicationsListCache();
  return result;
}

export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus,
  adminNotes?: string,
): Promise<ApplicationDetail> {
  const result = await request<ApplicationDetail>(`/api/applications/${applicationId}`, {
    method: "PATCH",
    body: JSON.stringify({
      status,
      admin_notes: adminNotes,
    }),
  });
  invalidateApplicationsListCache();
  return result;
}

export async function getApplicationHistory(applicationId: string): Promise<ApplicationStatusLogItem[]> {
  return request<ApplicationStatusLogItem[]>(`/api/applications/${applicationId}/history`, { method: "GET" });
}


export interface ApplicationHistoryBatchItem {
  id: string;
  history: ApplicationStatusLogItem[];
}

export interface ApplicationHistoryBatchResponse {
  items: ApplicationHistoryBatchItem[];
}

export async function batchGetApplicationHistories(
  applicationIds: string[],
  options?: { force?: boolean },
): Promise<Map<string, ApplicationStatusLogItem[]>> {
  if (applicationIds.length === 0) {
    return new Map();
  }

  const token = getAccessToken();
  const cacheKey = [...new Set(applicationIds)].sort().join(",");
  const now = Date.now();
  const cached = applicationHistoryBatchCache.get(cacheKey);

  if (
    !options?.force &&
    cached &&
    cached.token === token &&
    now - cached.fetchedAt <= APPLICATION_HISTORY_BATCH_CACHE_TTL_MS
  ) {
    return cached.data;
  }

  const response = await request<ApplicationHistoryBatchResponse>("/api/applications/batch/histories", {
    method: "POST",
    body: JSON.stringify({ application_ids: applicationIds }),
  });

  const historyMap = new Map<string, ApplicationStatusLogItem[]>();
  for (const item of response.items) {
    historyMap.set(item.id, item.history);
  }

  applicationHistoryBatchCache.set(cacheKey, {
    token,
    fetchedAt: now,
    data: historyMap,
  });

  return historyMap;
}
