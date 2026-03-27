import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, FileText, MapPinned, PieChart as PieChartIcon, ShieldCheck, Activity, Clock3 } from "lucide-react";
import { getApiBaseUrl } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";

type LicenceTypeDistributionItem = {
  licence_type: string;
  count: number;
};

type RegionalCoverageItem = {
  region: string;
  total: number;
  by_sector: Record<string, number>;
  by_licence_type: LicenceTypeDistributionItem[];
};

type ApplicationsAnalyticsResponse = {
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

type ComplaintsTrendPoint = {
  date: string;
  telecom: number;
  broadcasting: number;
  postal: number;
  internet: number;
};

type SectorBreakdownItem = {
  sector: string;
  total: number;
};

type CompanyBreakdownItem = {
  company: string;
  total: number;
};

type SectorAlert = {
  sector: string;
  total: number;
  normal: number;
  threshold: number;
  today: number;
  is_alert: boolean;
};

type ComplaintsAnalyticsResponse = {
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

const quickActions = [
  { label: "Review Applications", description: "Pending submissions", icon: FileText, to: "/admin/applications" },
  { label: "Manage Users", description: "View users and licences", icon: ShieldCheck, to: "/admin/users" },
  { label: "View Complaints", description: "Unresolved cases", icon: FileText, to: "/admin/complaints" },
];

const POLL_MS = 30_000;

const SECTOR_COLORS: Record<string, string> = {
  telecom: "#1d4ed8",
  broadcasting: "#0d9488",
  postal: "#e11d48",
  internet: "#ca8a04",
};

const MOCK_APPLICATIONS_ANALYTICS: ApplicationsAnalyticsResponse = {
  total_eligible_licences: 124,
  status_breakdown: {
    submitted: 28,
    under_review: 22,
    waiting_for_payment: 11,
    requires_action: 9,
    approved: 47,
    rejected: 7,
  },
  licence_type_distribution: [
    { licence_type: "Cellular Licence", count: 28 },
    { licence_type: "Broadcasting Licence", count: 20 },
    { licence_type: "Radio Frequency Licence", count: 19 },
    { licence_type: "Internet Service Licence", count: 17 },
    { licence_type: "Point-to-Point Licence", count: 14 },
    { licence_type: "Type Approval Licence", count: 11 },
    { licence_type: "Postal/Courier Licence", count: 9 },
    { licence_type: "VANS Licence", count: 6 },
  ],
  regional_coverage: [
    {
      region: "Gaborone",
      total: 30,
      by_sector: { telecom: 12, broadcasting: 6, postal: 4, internet: 8 },
      by_licence_type: [
        { licence_type: "Cellular Licence", count: 8 },
        { licence_type: "Internet Service Licence", count: 6 },
      ],
    },
    {
      region: "Francistown",
      total: 22,
      by_sector: { telecom: 9, broadcasting: 4, postal: 3, internet: 6 },
      by_licence_type: [
        { licence_type: "Cellular Licence", count: 5 },
        { licence_type: "Broadcasting Licence", count: 4 },
      ],
    },
    {
      region: "Maun",
      total: 17,
      by_sector: { telecom: 6, broadcasting: 3, postal: 4, internet: 4 },
      by_licence_type: [
        { licence_type: "Radio Frequency Licence", count: 5 },
        { licence_type: "Postal/Courier Licence", count: 4 },
      ],
    },
    {
      region: "Kasane",
      total: 14,
      by_sector: { telecom: 5, broadcasting: 2, postal: 4, internet: 3 },
      by_licence_type: [
        { licence_type: "Postal/Courier Licence", count: 4 },
        { licence_type: "Cellular Licence", count: 3 },
      ],
    },
    {
      region: "Lobatse",
      total: 19,
      by_sector: { telecom: 7, broadcasting: 4, postal: 2, internet: 6 },
      by_licence_type: [
        { licence_type: "Point-to-Point Licence", count: 5 },
        { licence_type: "Broadcasting Licence", count: 4 },
      ],
    },
    {
      region: "Selebi-Phikwe",
      total: 22,
      by_sector: { telecom: 8, broadcasting: 5, postal: 2, internet: 7 },
      by_licence_type: [
        { licence_type: "Radio Frequency Licence", count: 6 },
        { licence_type: "Internet Service Licence", count: 5 },
      ],
    },
  ],
};

const MOCK_COMPLAINTS_ANALYTICS: ComplaintsAnalyticsResponse = {
  total_complaints: 186,
  open_complaints: 41,
  trend_days: 7,
  trend: [
    { date: "2026-03-18", telecom: 8, broadcasting: 3, postal: 2, internet: 5 },
    { date: "2026-03-19", telecom: 9, broadcasting: 4, postal: 3, internet: 6 },
    { date: "2026-03-20", telecom: 7, broadcasting: 3, postal: 2, internet: 5 },
    { date: "2026-03-21", telecom: 10, broadcasting: 4, postal: 3, internet: 7 },
    { date: "2026-03-22", telecom: 8, broadcasting: 4, postal: 2, internet: 6 },
    { date: "2026-03-23", telecom: 9, broadcasting: 4, postal: 3, internet: 5 },
    { date: "2026-03-24", telecom: 13, broadcasting: 4, postal: 3, internet: 8 },
  ],
  sector_breakdown: [
    { sector: "telecom", total: 74 },
    { sector: "broadcasting", total: 32 },
    { sector: "postal", total: 24 },
    { sector: "internet", total: 56 },
  ],
  company_breakdown: [
    { company: "BTC", total: 62 },
    { company: "ORANGE", total: 51 },
    { company: "MASCOM", total: 43 },
    { company: "BOFINET", total: 18 },
    { company: "OTHER", total: 12 },
  ],
  company_breakdown_by_sector: {
    telecom: [
      { company: "BTC", total: 28 },
      { company: "MASCOM", total: 24 },
      { company: "ORANGE", total: 16 },
      { company: "OTHER", total: 6 },
    ],
    broadcasting: [
      { company: "BTC", total: 12 },
      { company: "ORANGE", total: 9 },
      { company: "MASCOM", total: 7 },
      { company: "OTHER", total: 4 },
    ],
    postal: [
      { company: "BTC", total: 9 },
      { company: "OTHER", total: 7 },
      { company: "ORANGE", total: 5 },
      { company: "MASCOM", total: 3 },
    ],
    internet: [
      { company: "BOFINET", total: 18 },
      { company: "ORANGE", total: 21 },
      { company: "BTC", total: 13 },
      { company: "MASCOM", total: 9 },
      { company: "OTHER", total: 5 },
    ],
  },
  sector_alerts: [
    { sector: "telecom", total: 74, normal: 8.5, threshold: 10.62, today: 13, is_alert: true },
    { sector: "broadcasting", total: 32, normal: 3.67, threshold: 4.59, today: 4, is_alert: false },
    { sector: "postal", total: 24, normal: 2.5, threshold: 3.12, today: 3, is_alert: false },
    { sector: "internet", total: 56, normal: 5.67, threshold: 7.09, today: 8, is_alert: true },
  ],
  alert_count: 2,
};

async function fetchJson<T>(path: string): Promise<T> {
  const token = getAccessToken();
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to load dashboard data (${response.status})`);
  }
  return (await response.json()) as T;
}

const formatSector = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
const handleViewStats = () => {
  window.location.href = "/";
};

const mergeLicenceTypeDistribution = (
  mockItems: LicenceTypeDistributionItem[],
  liveItems: LicenceTypeDistributionItem[] = []
) => {
  const counts = new Map<string, number>();
  mockItems.forEach((item) => counts.set(item.licence_type, item.count));
  liveItems.forEach((item) => {
    counts.set(item.licence_type, (counts.get(item.licence_type) ?? 0) + item.count);
  });

  return Array.from(counts.entries()).map(([licence_type, count]) => ({ licence_type, count }));
};

const mergeRegionalCoverage = (mockRows: RegionalCoverageItem[], liveRows: RegionalCoverageItem[] = []) => {
  const regions = new Map<string, RegionalCoverageItem>();

  mockRows.forEach((row) => {
    regions.set(row.region, {
      ...row,
      by_sector: { ...row.by_sector },
      by_licence_type: row.by_licence_type.map((item) => ({ ...item })),
    });
  });

  liveRows.forEach((row) => {
    const existing =
      regions.get(row.region) ??
      ({
        region: row.region,
        total: 0,
        by_sector: {},
        by_licence_type: [],
      } satisfies RegionalCoverageItem);

    const telecom = (existing.by_sector.telecom ?? 0) + (row.by_sector?.telecom ?? 0);
    const broadcasting = (existing.by_sector.broadcasting ?? 0) + (row.by_sector?.broadcasting ?? 0);
    const postal = (existing.by_sector.postal ?? 0) + (row.by_sector?.postal ?? 0);
    const internet = (existing.by_sector.internet ?? 0) + (row.by_sector?.internet ?? 0);

    regions.set(row.region, {
      ...existing,
      total: existing.total + (row.total ?? 0),
      by_sector: { telecom, broadcasting, postal, internet },
      by_licence_type: mergeLicenceTypeDistribution(existing.by_licence_type, row.by_licence_type ?? []),
    });
  });

  return Array.from(regions.values());
};

const mergeApplicationsAnalytics = (
  mockData: ApplicationsAnalyticsResponse,
  liveData: ApplicationsAnalyticsResponse | null
): ApplicationsAnalyticsResponse => {
  if (!liveData) {
    return mockData;
  }

  return {
    total_eligible_licences: mockData.total_eligible_licences + (liveData.total_eligible_licences ?? 0),
    status_breakdown: {
      submitted: mockData.status_breakdown.submitted + (liveData.status_breakdown?.submitted ?? 0),
      under_review: mockData.status_breakdown.under_review + (liveData.status_breakdown?.under_review ?? 0),
      waiting_for_payment:
        mockData.status_breakdown.waiting_for_payment + (liveData.status_breakdown?.waiting_for_payment ?? 0),
      requires_action: mockData.status_breakdown.requires_action + (liveData.status_breakdown?.requires_action ?? 0),
      approved: mockData.status_breakdown.approved + (liveData.status_breakdown?.approved ?? 0),
      rejected: mockData.status_breakdown.rejected + (liveData.status_breakdown?.rejected ?? 0),
    },
    licence_type_distribution: mergeLicenceTypeDistribution(
      mockData.licence_type_distribution,
      liveData.licence_type_distribution ?? []
    ),
    regional_coverage: mergeRegionalCoverage(mockData.regional_coverage, liveData.regional_coverage ?? []),
  };
};

const mergeSectorBreakdown = (mockItems: SectorBreakdownItem[], liveItems: SectorBreakdownItem[] = []) => {
  const totals = new Map<string, number>();
  mockItems.forEach((item) => totals.set(item.sector, item.total));
  liveItems.forEach((item) => totals.set(item.sector, (totals.get(item.sector) ?? 0) + item.total));
  return Array.from(totals.entries()).map(([sector, total]) => ({ sector, total }));
};

const mergeCompanyBreakdown = (mockItems: CompanyBreakdownItem[], liveItems: CompanyBreakdownItem[] = []) => {
  const totals = new Map<string, number>();
  mockItems.forEach((item) => totals.set(item.company, item.total));
  liveItems.forEach((item) => totals.set(item.company, (totals.get(item.company) ?? 0) + item.total));
  return Array.from(totals.entries()).map(([company, total]) => ({ company, total }));
};

const mergeTrend = (mockPoints: ComplaintsTrendPoint[], livePoints: ComplaintsTrendPoint[] = []) => {
  const points = new Map<string, ComplaintsTrendPoint>();

  mockPoints.forEach((point) => points.set(point.date, { ...point }));

  livePoints.forEach((point) => {
    const existing = points.get(point.date);
    if (!existing) {
      points.set(point.date, { ...point });
      return;
    }

    points.set(point.date, {
      date: point.date,
      telecom: existing.telecom + point.telecom,
      broadcasting: existing.broadcasting + point.broadcasting,
      postal: existing.postal + point.postal,
      internet: existing.internet + point.internet,
    });
  });

  return Array.from(points.values());
};

const mergeSectorAlerts = (mockAlerts: SectorAlert[], liveAlerts: SectorAlert[] = []) => {
  const alerts = new Map<string, SectorAlert>();
  mockAlerts.forEach((alert) => alerts.set(alert.sector, { ...alert }));

  liveAlerts.forEach((alert) => {
    const existing = alerts.get(alert.sector);
    if (!existing) {
      const threshold = alert.threshold || alert.normal * 1.25;
      alerts.set(alert.sector, {
        ...alert,
        threshold,
        is_alert: alert.today > threshold || alert.is_alert,
      });
      return;
    }

    const normal = existing.normal + alert.normal;
    const threshold = normal * 1.25;
    const today = existing.today + alert.today;

    alerts.set(alert.sector, {
      sector: alert.sector,
      total: existing.total + alert.total,
      normal,
      threshold,
      today,
      is_alert: today > threshold,
    });
  });

  return Array.from(alerts.values());
};

const mergeComplaintsAnalytics = (
  mockData: ComplaintsAnalyticsResponse,
  liveData: ComplaintsAnalyticsResponse | null
): ComplaintsAnalyticsResponse => {
  if (!liveData) {
    return mockData;
  }

  const trend = mergeTrend(mockData.trend, liveData.trend ?? []);
  const sector_alerts = mergeSectorAlerts(mockData.sector_alerts, liveData.sector_alerts ?? []);
  const company_breakdown_by_sector: Record<string, CompanyBreakdownItem[]> = {
    ...Object.fromEntries(
      Object.entries(mockData.company_breakdown_by_sector).map(([sector, items]) => [
        sector,
        items.map((item) => ({ ...item })),
      ])
    ),
  };

  Object.entries(liveData.company_breakdown_by_sector ?? {}).forEach(([sector, items]) => {
    company_breakdown_by_sector[sector] = mergeCompanyBreakdown(company_breakdown_by_sector[sector] ?? [], items);
  });

  return {
    total_complaints: mockData.total_complaints + (liveData.total_complaints ?? 0),
    open_complaints: mockData.open_complaints + (liveData.open_complaints ?? 0),
    trend_days: Math.max(mockData.trend_days, liveData.trend_days ?? 0, trend.length),
    trend,
    sector_breakdown: mergeSectorBreakdown(mockData.sector_breakdown, liveData.sector_breakdown ?? []),
    company_breakdown: mergeCompanyBreakdown(mockData.company_breakdown, liveData.company_breakdown ?? []),
    company_breakdown_by_sector,
    sector_alerts,
    alert_count: sector_alerts.filter((item) => item.is_alert).length,
  };
};

const PieChart = ({ data }: { data: LicenceTypeDistributionItem[] }) => {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  if (!total) {
    return <p className="text-sm text-muted-foreground">No licence data available.</p>;
  }

  const cx = 90;
  const cy = 90;
  const radius = 70;
  let startAngle = -90;

  const polarToCartesian = (angleDeg: number) => {
    const radians = (angleDeg * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(radians),
      y: cy + radius * Math.sin(radians),
    };
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-center">
      <svg width="180" height="180" viewBox="0 0 180 180" className="shrink-0">
        {data.map((item, index) => {
          const sweep = (item.count / total) * 360;
          const endAngle = startAngle + sweep;
          const start = polarToCartesian(startAngle);
          const end = polarToCartesian(endAngle);
          const largeArcFlag = sweep > 180 ? 1 : 0;
          const path = [
            `M ${cx} ${cy}`,
            `L ${start.x} ${start.y}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
            "Z",
          ].join(" ");
          const color = `hsl(${(index * 73) % 360} 72% 52%)`;
          startAngle = endAngle;

          if (item.count === total) {
            return <circle key={item.licence_type} cx={cx} cy={cy} r={radius} fill={color} />;
          }

          return (
            <path
              key={item.licence_type}
              d={path}
              fill={color}
            />
          );
        })}
      </svg>
      <div className="w-full space-y-2">
        {data.slice(0, 8).map((item, index) => (
          <div key={item.licence_type} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: `hsl(${(index * 73) % 360} 72% 52%)` }}
              />
              <span className="text-foreground/90">{item.licence_type}</span>
            </div>
            <span className="font-semibold text-foreground">{((item.count / total) * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ComplaintsLineChart = ({ points }: { points: ComplaintsTrendPoint[] }) => {
  if (!points.length) {
    return <p className="text-sm text-muted-foreground">No complaint trend data available.</p>;
  }

  const width = 760;
  const height = 260;
  const padding = 30;
  const sectors: Array<keyof Pick<ComplaintsTrendPoint, "telecom" | "broadcasting" | "postal" | "internet">> = [
    "telecom",
    "broadcasting",
    "postal",
    "internet",
  ];
  const maxValue = Math.max(1, ...points.flatMap((point) => sectors.map((sector) => point[sector])));
  const xStep = points.length > 1 ? (width - padding * 2) / (points.length - 1) : 0;
  const yTickCount = 4;
  const yTicks = Array.from({ length: yTickCount + 1 }, (_, index) => {
    const value = Math.round((maxValue * (yTickCount - index)) / yTickCount);
    const y = padding + ((height - padding * 2) * index) / yTickCount;
    return { value, y };
  });

  const getY = (value: number) => height - padding - (value / maxValue) * (height - padding * 2);

  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="hsl(var(--border))" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="hsl(var(--border))" />
        {yTicks.map((tick) => (
          <g key={`tick-${tick.value}-${tick.y}`}>
            <line
              x1={padding}
              y1={tick.y}
              x2={width - padding}
              y2={tick.y}
              stroke="hsl(var(--border))"
              strokeOpacity={0.4}
              strokeDasharray="3 3"
            />
            <text
              x={padding - 8}
              y={tick.y + 3}
              fontSize="10"
              textAnchor="end"
              fill="hsl(var(--muted-foreground))"
            >
              {tick.value}
            </text>
          </g>
        ))}

        {sectors.map((sector) => {
          const path = points
            .map((point, index) => `${index === 0 ? "M" : "L"} ${padding + index * xStep} ${getY(point[sector])}`)
            .join(" ");
          return (
            <path
              key={sector}
              d={path}
              fill="none"
              stroke={SECTOR_COLORS[sector]}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}

        {points.map((point, index) => (
          <text
            key={point.date}
            x={padding + index * xStep}
            y={height - 8}
            fontSize="10"
            textAnchor="middle"
            fill="hsl(var(--muted-foreground))"
          >
            {new Date(point.date).toLocaleDateString(undefined, { weekday: "short" })}
          </text>
        ))}
      </svg>

      <div className="flex flex-wrap gap-3">
        {sectors.map((sector) => (
          <div key={sector} className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: SECTOR_COLORS[sector] }} />
            {formatSector(sector)}
          </div>
        ))}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [applicationsAnalytics, setApplicationsAnalytics] = useState<ApplicationsAnalyticsResponse | null>(null);
  const [complaintsAnalytics, setComplaintsAnalytics] = useState<ComplaintsAnalyticsResponse | null>(null);
  const [selectedCompanySector, setSelectedCompanySector] = useState<string>("telecom");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const [apps, complaints] = await Promise.all([
          fetchJson<ApplicationsAnalyticsResponse>("/api/applications/analytics"),
          fetchJson<ComplaintsAnalyticsResponse>("/api/complaints/analytics"),
        ]);
        if (!mounted) return;
        setApplicationsAnalytics(apps);
        setComplaintsAnalytics(complaints);
        setError(null);
      } catch (loadError) {
        if (!mounted) return;
        setError(loadError instanceof Error ? loadError.message : "Unable to load dashboard analytics.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();
    const intervalId = window.setInterval(() => {
      void load();
    }, POLL_MS);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const displayApplicationsAnalytics = useMemo(
    () => mergeApplicationsAnalytics(MOCK_APPLICATIONS_ANALYTICS, applicationsAnalytics),
    [applicationsAnalytics]
  );

  const displayComplaintsAnalytics = useMemo(
    () => mergeComplaintsAnalytics(MOCK_COMPLAINTS_ANALYTICS, complaintsAnalytics),
    [complaintsAnalytics]
  );

  const sectorCards = useMemo(() => {
    return displayComplaintsAnalytics.sector_alerts.map((item) => ({
      label: formatSector(item.sector),
      total: item.total,
      normal: item.normal,
      alert: item.is_alert,
    }));
  }, [displayComplaintsAnalytics]);

  const companyRowsForSelectedSector = useMemo(() => {
    return (displayComplaintsAnalytics.company_breakdown_by_sector?.[selectedCompanySector] ?? []).slice(0, 8);
  }, [displayComplaintsAnalytics, selectedCompanySector]);

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="text-2xl font-heading font-bold text-foreground">Admin Dashboard</h2>
        <p className="text-sm text-muted-foreground mt-1">System overview and pending actions</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 shrink-0 rounded-lg flex items-center justify-center text-bocra-blue bg-bocra-blue/10">
                <PieChartIcon className="h-5 w-5" />
              </div>
              <p className="text-xs text-muted-foreground">Eligible Licences</p>
            </div>
            <span className="text-2xl font-heading font-bold text-foreground">
              {displayApplicationsAnalytics.total_eligible_licences}
            </span>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 shrink-0 rounded-lg flex items-center justify-center text-indigo-600 bg-indigo-100/70">
                <Clock3 className="h-5 w-5" />
              </div>
              <p className="text-xs text-muted-foreground">Waiting for Payment</p>
            </div>
            <span className="text-2xl font-heading font-bold text-foreground">
              {displayApplicationsAnalytics.status_breakdown.waiting_for_payment}
            </span>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 shrink-0 rounded-lg flex items-center justify-center text-bocra-teal bg-bocra-teal/10">
                <MapPinned className="h-5 w-5" />
              </div>
              <p className="text-xs text-muted-foreground">Districts Covered</p>
            </div>
            <span className="text-2xl font-heading font-bold text-foreground">
              {displayApplicationsAnalytics.regional_coverage.length}
            </span>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 shrink-0 rounded-lg flex items-center justify-center text-bocra-rose bg-bocra-rose/10">
                <Activity className="h-5 w-5" />
              </div>
              <p className="text-xs text-muted-foreground">Total Complaints</p>
            </div>
            <span className="text-2xl font-heading font-bold text-foreground">{displayComplaintsAnalytics.total_complaints}</span>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 shrink-0 rounded-lg flex items-center justify-center text-bocra-gold bg-bocra-gold/15">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <p className="text-xs text-muted-foreground">Spike Alerts (&gt;25%)</p>
            </div>
            <span className="text-2xl font-heading font-bold text-foreground">{displayComplaintsAnalytics.alert_count}</span>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Quick Actions</h3>
          <button
            type="button"
            onClick={handleViewStats}
            className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Publish
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <a
              key={action.label}
              href={action.to}
              className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                <action.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground">{action.label}</div>
                <div className="text-xs text-muted-foreground">{action.description}</div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </a>
          ))}
        </div>
      </div>

      {loading && (
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">Loading dashboard analytics...</p>
        </div>
      )}
      {error && (
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-red-500">{error}</p>
          <p className="text-xs text-muted-foreground mt-1">Showing mock analytics data while live data is unavailable.</p>
        </div>
      )}

      <div className="bg-card rounded-xl border border-border p-5 md:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Licence Distribution by Type
          </h3>
          <button
            type="button"
            onClick={handleViewStats}
            className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Publish
          </button>
        </div>
        <PieChart data={displayApplicationsAnalytics.licence_type_distribution} />
      </div>

      <div className="bg-card rounded-xl border border-border p-5 md:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Coverage by Region (Districts)
          </h3>
          <button
            type="button"
            onClick={handleViewStats}
            className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Publish
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b border-border">
                <th className="py-2 pr-4 font-semibold text-foreground">District</th>
                <th className="py-2 pr-4 font-semibold text-foreground">Telecom</th>
                <th className="py-2 pr-4 font-semibold text-foreground">Broadcasting</th>
                <th className="py-2 pr-4 font-semibold text-foreground">Postal</th>
                <th className="py-2 pr-4 font-semibold text-foreground">Internet</th>
                <th className="py-2 pr-4 font-semibold text-foreground">Total</th>
                <th className="py-2 font-semibold text-foreground">Top Licence Types</th>
              </tr>
            </thead>
            <tbody>
              {displayApplicationsAnalytics.regional_coverage.map((row) => (
                <tr key={row.region} className="border-b border-border/70">
                  <td className="py-2 pr-4 text-foreground">{row.region}</td>
                  <td className="py-2 pr-4 text-muted-foreground">{row.by_sector.telecom ?? 0}</td>
                  <td className="py-2 pr-4 text-muted-foreground">{row.by_sector.broadcasting ?? 0}</td>
                  <td className="py-2 pr-4 text-muted-foreground">{row.by_sector.postal ?? 0}</td>
                  <td className="py-2 pr-4 text-muted-foreground">{row.by_sector.internet ?? 0}</td>
                  <td className="py-2 pr-4 font-semibold text-foreground">{row.total}</td>
                  <td className="py-2 text-muted-foreground">
                    {row.by_licence_type
                      .slice(0, 2)
                      .map((item) => `${item.licence_type} (${item.count})`)
                      .join(", ") || "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-5 md:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Complaints Trend (Past Week, 4 Sectors)
          </h3>
          <button
            type="button"
            onClick={handleViewStats}
            className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Publish
          </button>
        </div>
        <ComplaintsLineChart points={displayComplaintsAnalytics.trend} />
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {sectorCards.map((item) => (
            <div
              key={item.label}
              className={`rounded-lg border p-3 ${item.alert ? "border-red-300 bg-red-50/70" : "border-border bg-background"}`}
            >
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="text-lg font-semibold text-foreground">{item.total}</p>
              <p className={`text-xs ${item.alert ? "text-red-600" : "text-muted-foreground"}`}>
                Normal {item.normal.toFixed(1)} {item.alert ? " - spike detected" : " - within normal range"}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Complaints by Sector (Live Polling)
            </h3>
            <button
              type="button"
              onClick={handleViewStats}
              className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Publish
            </button>
          </div>
          <div className="space-y-2">
            {displayComplaintsAnalytics.sector_breakdown.map((item) => (
              <div key={item.sector} className="flex items-center justify-between text-sm">
                <span className="text-foreground/90">{formatSector(item.sector)}</span>
                <span className="font-semibold text-foreground">{item.total}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Complaints by Company (Side by Side)
            </h3>
            <div className="flex items-center gap-2">
              <select
                value={selectedCompanySector}
                onChange={(event) => setSelectedCompanySector(event.target.value)}
                className="rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="telecom">Telecom</option>
                <option value="broadcasting">Broadcasting</option>
                <option value="postal">Postal</option>
                <option value="internet">Internet</option>
              </select>
              <button
                type="button"
                onClick={handleViewStats}
                className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Publish
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {companyRowsForSelectedSector.map((item) => (
              <div key={item.company} className="flex items-center justify-between text-sm">
                <span className="text-foreground/90">{item.company}</span>
                <span className="font-semibold text-foreground">{item.total}</span>
              </div>
            ))}
            {!companyRowsForSelectedSector.length && (
              <p className="text-sm text-muted-foreground">No company complaint data for this sector.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
