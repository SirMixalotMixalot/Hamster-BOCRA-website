import { getApiBaseUrl } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import { setApplicationsListCache, type ApplicationListItem } from "@/lib/applications";
import { setComplaintsListCache, type ComplaintListItem } from "@/lib/complaints";
import { setSupportTicketsCache, type SupportTicketItem } from "@/lib/support";

const ADMIN_DASHBOARD_BATCH_CACHE_TTL_MS = 2 * 60 * 1000;

export type LicenceTypeDistributionItem = {
  licence_type: string;
  count: number;
};

export type RegionalCoverageItem = {
  region: string;
  total: number;
  by_sector: Record<string, number>;
  by_licence_type: LicenceTypeDistributionItem[];
};

export type ApplicationsAnalyticsResponse = {
  total_eligible_licences: number;
  status_breakdown: {
    submitted: number;
    under_review: number;
    waiting_for_payment: number;
    requires_action: number;
    approved: number;
    rejected: number;
  };
  licence_type_distribution: LicenceTypeDistributionItem[];
  regional_coverage: RegionalCoverageItem[];
};

export type ComplaintsTrendPoint = {
  date: string;
  telecom: number;
  broadcasting: number;
  postal: number;
  internet: number;
};

export type SectorBreakdownItem = {
  sector: string;
  total: number;
};

export type CompanyBreakdownItem = {
  company: string;
  total: number;
};

export type SectorAlert = {
  sector: string;
  total: number;
  normal: number;
  threshold: number;
  today: number;
  is_alert: boolean;
};

export type ComplaintsAnalyticsResponse = {
  total_complaints: number;
  open_complaints: number;
  trend_days: number;
  trend: ComplaintsTrendPoint[];
  sector_breakdown: SectorBreakdownItem[];
  company_breakdown: CompanyBreakdownItem[];
  company_breakdown_by_sector: Record<string, CompanyBreakdownItem[]>;
  sector_alerts: SectorAlert[];
  alert_count: number;
};

export type AdminDashboardBatchResponse = {
  applications: ApplicationsAnalyticsResponse;
  complaints: ComplaintsAnalyticsResponse;
  applications_list: ApplicationListItem[];
  complaints_list: ComplaintListItem[];
  support_tickets: SupportTicketItem[];
};

let adminDashboardBatchCache:
  | {
      token: string | null;
      fetchedAt: number;
      data: AdminDashboardBatchResponse;
    }
  | null = null;

export function invalidateAdminDashboardBatchCache(): void {
  adminDashboardBatchCache = null;
}

export async function getAdminDashboardBatch(options: { force?: boolean } = {}): Promise<AdminDashboardBatchResponse> {
  const token = getAccessToken();
  const now = Date.now();

  if (
    !options.force &&
    adminDashboardBatchCache &&
    adminDashboardBatchCache.token === token &&
    now - adminDashboardBatchCache.fetchedAt <= ADMIN_DASHBOARD_BATCH_CACHE_TTL_MS
  ) {
    return adminDashboardBatchCache.data;
  }

  const response = await fetch(`${getApiBaseUrl()}/api/batch/admin-dashboard`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    let message = "Failed to fetch admin dashboard batch data";
    try {
      const body = await response.json();
      message = body.detail || body.message || message;
    } catch {
      // ignore parse failure
    }
    throw new Error(message);
  }

  const data = (await response.json()) as AdminDashboardBatchResponse;
  adminDashboardBatchCache = {
    token,
    fetchedAt: Date.now(),
    data,
  };

  // Prime admin pages list caches so navigating from dashboard is instant.
  setApplicationsListCache(data.applications_list || []);
  setComplaintsListCache({
    items: data.complaints_list || [],
    count: (data.complaints_list || []).length,
    limit: (data.complaints_list || []).length || 200,
    offset: 0,
  });
  setSupportTicketsCache({
    items: data.support_tickets || [],
    count: (data.support_tickets || []).length,
    limit: (data.support_tickets || []).length || 200,
    offset: 0,
  });

  return data;
}
