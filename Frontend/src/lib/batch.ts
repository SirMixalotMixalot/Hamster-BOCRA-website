import { getAccessToken } from "@/lib/auth";
import { getApiBaseUrl } from "@/lib/api";
import { setApplicationsListCache, type ApplicationListItem } from "@/lib/applications";
import type { ComplaintListItem } from "@/lib/complaints";
import { setSupportTicketsCache, type SupportTicketItem } from "@/lib/support";

const PORTAL_BATCH_CACHE_TTL_MS = 2 * 60 * 1000;

let portalBatchCache:
  | {
      key: string;
      token: string | null;
      fetchedAt: number;
      data: PortalBatchResponse;
    }
  | null = null;

export interface PortalBatchResponse {
  applications: ApplicationListItem[];
  complaints: ComplaintListItem[];
  support_tickets: SupportTicketItem[];
}

export interface PortalBatchOptions {
  includeApplications?: boolean;
  includeComplaints?: boolean;
  includeSupportTickets?: boolean;
  limit?: number;
  force?: boolean;
}

export function invalidatePortalBatchCache(): void {
  portalBatchCache = null;
}

export async function getPortalBatch(options: PortalBatchOptions = {}): Promise<PortalBatchResponse> {
  const token = getAccessToken();
  const includeApplications = options.includeApplications ?? true;
  const includeComplaints = options.includeComplaints ?? true;
  const includeSupportTickets = options.includeSupportTickets ?? true;
  const limit = options.limit ?? 50;
  const cacheKey = `${includeApplications}:${includeComplaints}:${includeSupportTickets}:${limit}`;

  if (
    !options.force &&
    portalBatchCache &&
    portalBatchCache.key === cacheKey &&
    portalBatchCache.token === token &&
    Date.now() - portalBatchCache.fetchedAt <= PORTAL_BATCH_CACHE_TTL_MS
  ) {
    return portalBatchCache.data;
  }

  const params = new URLSearchParams({
    include_applications: String(includeApplications),
    include_complaints: String(includeComplaints),
    include_support_tickets: String(includeSupportTickets),
    limit: String(limit),
  });

  const response = await fetch(`${getApiBaseUrl()}/api/batch/portal?${params.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    let message = "Failed to fetch portal batch data";
    try {
      const body = await response.json();
      message = body.detail || body.message || message;
    } catch {
      // ignore parse failure
    }
    throw new Error(message);
  }

  const batchResponse = (await response.json()) as PortalBatchResponse;
  portalBatchCache = {
    key: cacheKey,
    token,
    fetchedAt: Date.now(),
    data: batchResponse,
  };

  // Prime resource caches so navigating to Applications/Support does not re-fetch.
  if (includeApplications) {
    setApplicationsListCache(batchResponse.applications || []);
  }

  if (includeSupportTickets) {
    setSupportTicketsCache({
      items: batchResponse.support_tickets || [],
      count: (batchResponse.support_tickets || []).length,
      limit,
      offset: 0,
    });
  }

  return batchResponse;
}
