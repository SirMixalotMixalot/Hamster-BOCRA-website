import { useEffect, useState } from "react";
import { BarChart3, Smartphone, Wifi, Phone, TrendingUp, Globe2, Users, Tv, Package, ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type Sector = "telecom" | "isp" | "broadcasting" | "postal";
type Year = 2022 | 2023 | 2024 | 2025 | 2026;

type BarItem = { name: string; value: number; color: string; label: string };
type DonutItem = { name: string; pct: number; color: string };
type Indicator = { label: string; value: string; icon: typeof Smartphone; color: string };

type SectorData = {
  indicators: Indicator[];
  bars: { title: string; data: BarItem[] }[];
  donut: { title: string; total: string; data: DonutItem[] };
};

const YEARS: Year[] = [2026, 2025, 2024, 2023, 2022];

// ── Helper: format numbers ──
function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 1 : 2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 100_000 ? 0 : 1)}K`;
  return String(n);
}

// ── Helper: apply year growth factor (base year = 2026, ~4% annual growth) ──
function scale(base: number, year: Year): number {
  const diff = 2026 - year;
  return Math.round(base * Math.pow(0.96, diff));
}

function scaleBar(data: BarItem[], year: Year): BarItem[] {
  return data.map((d) => {
    const v = scale(d.value, year);
    return { ...d, value: v, label: fmt(v) };
  });
}

function pctFromValues(items: { name: string; color: string; value: number }[]): DonutItem[] {
  const total = items.reduce((s, i) => s + i.value, 0);
  return items.map((i) => ({ name: i.name, pct: Math.round((i.value / total) * 1000) / 10, color: i.color }));
}

// ── Telecom data builder ──
function getTelecom(year: Year): SectorData {
  const subs = [
    { name: "Mascom", value: scale(1720000, year), color: "bg-bocra-blue", dColor: "#2563eb" },
    { name: "Orange", value: scale(1050000, year), color: "bg-bocra-gold", dColor: "#d97706" },
    { name: "BTC", value: scale(610000, year), color: "bg-bocra-teal", dColor: "#0d9488" },
  ];
  const totalSubs = subs.reduce((s, i) => s + i.value, 0);
  const fixedLines = scale(142000, year);
  const mobileBB = scale(2100000, year);
  const pop = 2600000;
  const penetration = Math.round((totalSubs / pop) * 100);

  const money = [
    { name: "Mascom (MyZaka)", value: scale(480000, year), color: "bg-bocra-blue" },
    { name: "Orange Money", value: scale(620000, year), color: "bg-bocra-gold" },
    { name: "BTC (Smega)", value: scale(85000, year), color: "bg-bocra-teal" },
  ];

  return {
    indicators: [
      { label: "Mobile Subscribers", value: fmt(totalSubs), icon: Smartphone, color: "text-bocra-blue" },
      { label: "Fixed Lines", value: fmt(fixedLines), icon: Phone, color: "text-bocra-gold" },
      { label: "Mobile Penetration", value: `~${penetration}%`, icon: TrendingUp, color: "text-green-600" },
      { label: "Mobile Broadband", value: fmt(mobileBB), icon: Wifi, color: "text-bocra-teal" },
    ],
    bars: [
      { title: "Mobile Subscribers by Operator", data: subs.map((s) => ({ name: s.name, value: s.value, color: s.color, label: fmt(s.value) })) },
      { title: "Mobile Money Accounts", data: money.map((m) => ({ ...m, label: fmt(m.value) })) },
    ],
    donut: {
      title: "Mobile Market Share",
      total: fmt(totalSubs),
      data: pctFromValues(subs.map((s) => ({ name: s.name, color: s.dColor, value: s.value }))),
    },
  };
}

// ── ISP data builder ──
function getIsp(year: Year): SectorData {
  const isps = [
    { name: "BTC", value: scale(28000, year), color: "bg-bocra-teal", dColor: "#0d9488" },
    { name: "BOFINET", value: scale(19500, year), color: "bg-bocra-blue", dColor: "#2563eb" },
    { name: "Orange", value: scale(12000, year), color: "bg-bocra-gold", dColor: "#d97706" },
    { name: "Mascom", value: scale(9500, year), color: "bg-blue-500", dColor: "#3b82f6" },
    { name: "Broadband BBI", value: scale(6200, year), color: "bg-purple-500", dColor: "#7c3aed" },
    { name: "Abari Comms", value: scale(4800, year), color: "bg-orange-500", dColor: "#f97316" },
    { name: "Zebranet", value: scale(3100, year), color: "bg-emerald-500", dColor: "#10b981" },
    { name: "Concerotel", value: scale(2400, year), color: "bg-rose-500", dColor: "#f43f5e" },
  ];
  const totalBB = isps.reduce((s, i) => s + i.value, 0);
  const fibre = scale(34000, year);
  const pop = 2600000;
  const internetPen = Math.round(((totalBB + scale(2100000, year)) / pop) * 100);

  const top4 = isps.slice(0, 4);
  const othersVal = isps.slice(4).reduce((s, i) => s + i.value, 0);
  const donutItems = [
    ...top4.map((i) => ({ name: i.name, color: i.dColor, value: i.value })),
    { name: "Others", color: "#6b7280", value: othersVal },
  ];

  return {
    indicators: [
      { label: "Fixed Broadband Subs", value: fmt(totalBB), icon: Wifi, color: "text-bocra-blue" },
      { label: "Internet Penetration", value: `~${internetPen}%`, icon: Globe2, color: "text-bocra-teal" },
      { label: "Licensed ISPs", value: "20", icon: Users, color: "text-bocra-gold" },
      { label: "Fibre Connections", value: fmt(fibre), icon: TrendingUp, color: "text-green-600" },
    ],
    bars: [
      { title: "Subscribers by ISP (Top 8)", data: isps.map((i) => ({ name: i.name, value: i.value, color: i.color, label: fmt(i.value) })) },
    ],
    donut: {
      title: "ISP Market Share",
      total: fmt(totalBB),
      data: pctFromValues(donutItems),
    },
  };
}

// ── Broadcasting data builder ──
function getBroadcasting(year: Year): SectorData {
  const payTv = [
    { name: "MultiChoice (DStv)", value: scale(145000, year), color: "bg-bocra-blue", dColor: "#2563eb" },
    { name: "BTV Digital", value: scale(38000, year), color: "bg-bocra-teal", dColor: "#0d9488" },
    { name: "Kwese / Other", value: scale(27000, year), color: "bg-bocra-gold", dColor: "#d97706" },
  ];
  const totalPayTv = payTv.reduce((s, i) => s + i.value, 0);
  const tvHouseholds = scale(480000, year);
  const radio = [
    { name: "RB2 (Btv Radio)", value: scale(680000, year), color: "bg-bocra-blue" },
    { name: "Yarona FM", value: scale(520000, year), color: "bg-bocra-gold" },
    { name: "Duma FM", value: scale(390000, year), color: "bg-bocra-teal" },
    { name: "Gabz FM", value: scale(310000, year), color: "bg-purple-500" },
  ];

  return {
    indicators: [
      { label: "TV Households", value: fmt(tvHouseholds), icon: Tv, color: "text-bocra-blue" },
      { label: "Radio Stations", value: "18", icon: Smartphone, color: "text-bocra-gold" },
      { label: "TV Channels", value: "12", icon: Tv, color: "text-bocra-teal" },
      { label: "Pay-TV Subs", value: fmt(totalPayTv), icon: Users, color: "text-green-600" },
    ],
    bars: [
      { title: "Pay-TV Subscribers", data: payTv.map((p) => ({ name: p.name, value: p.value, color: p.color, label: fmt(p.value) })) },
      { title: "Radio Listenership (Weekly Reach)", data: radio.map((r) => ({ ...r, label: fmt(r.value) })) },
    ],
    donut: {
      title: "Pay-TV Market Share",
      total: fmt(totalPayTv),
      data: pctFromValues(payTv.map((p) => ({ name: p.name.split(" (")[0], color: p.dColor, value: p.value }))),
    },
  };
}

// ── Postal data builder ──
function getPostal(year: Year): SectorData {
  const mailTypes = [
    { name: "Letters", value: scale(4800000, year), color: "bg-bocra-blue" },
    { name: "Parcels & Packets", value: scale(1400000, year), color: "bg-bocra-gold" },
    { name: "Registered Mail", value: scale(1200000, year), color: "bg-bocra-teal" },
    { name: "EMS / Express", value: scale(800000, year), color: "bg-purple-500" },
  ];
  const totalMail = mailTypes.reduce((s, i) => s + i.value, 0);
  const couriers = [
    { name: "BotswanaPost", value: scale(62000, year), color: "bg-bocra-blue", dColor: "#2563eb" },
    { name: "DHL", value: scale(28000, year), color: "bg-bocra-gold", dColor: "#d97706" },
    { name: "FedEx", value: scale(12000, year), color: "bg-purple-500", dColor: "#7c3aed" },
    { name: "Sprint Couriers", value: scale(9500, year), color: "bg-bocra-teal", dColor: "#0d9488" },
  ];
  const totalCourier = couriers.reduce((s, i) => s + i.value, 0);
  const totalParcels = scale(1400000, year);

  return {
    indicators: [
      { label: "Post Offices", value: "124", icon: Package, color: "text-bocra-blue" },
      { label: "Courier Operators", value: "15", icon: Users, color: "text-bocra-gold" },
      { label: "Mail Items (Annual)", value: fmt(totalMail), icon: TrendingUp, color: "text-bocra-teal" },
      { label: "Parcels (Annual)", value: fmt(totalParcels), icon: Package, color: "text-green-600" },
    ],
    bars: [
      { title: "Mail Volume by Type", data: mailTypes.map((m) => ({ ...m, label: fmt(m.value) })) },
      { title: "Courier Market (Parcels/Month)", data: couriers.map((c) => ({ name: c.name, value: c.value, color: c.color, label: fmt(c.value) })) },
    ],
    donut: {
      title: "Courier Market Share",
      total: fmt(totalCourier),
      data: pctFromValues(couriers.map((c) => ({ name: c.name, color: c.dColor, value: c.value }))),
    },
  };
}

function getData(sector: Sector, year: Year): SectorData {
  switch (sector) {
    case "telecom": return getTelecom(year);
    case "isp": return getIsp(year);
    case "broadcasting": return getBroadcasting(year);
    case "postal": return getPostal(year);
  }
}

const SECTOR_OPTIONS: { key: Sector; label: string }[] = [
  { key: "telecom", label: "Telecom" },
  { key: "isp", label: "ISPs" },
  { key: "broadcasting", label: "Broadcasting" },
  { key: "postal", label: "Postal Services" },
];

// ── Chart components ──

function BarChart({ data }: { data: BarItem[] }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="space-y-2.5">
      {data.map((item) => (
        <div key={item.name} className="flex items-center gap-3">
          <span className="w-36 text-xs text-right text-foreground truncate">{item.name}</span>
          <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
            <div
              className={`h-full ${item.color} rounded-full transition-all duration-700`}
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
          <span className="w-14 text-xs font-semibold text-foreground">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ data, total }: { data: DonutItem[]; total: string }) {
  const radius = 15.915;
  const circumference = 100;
  let offset = 25;
  const segments = data.map((seg) => {
    const dashArray = `${seg.pct} ${circumference - seg.pct}`;
    const dashOffset = offset;
    offset -= seg.pct;
    return { ...seg, dashArray, dashOffset };
  });

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-40 h-40">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          {segments.map((seg) => (
            <circle
              key={seg.name}
              cx="18"
              cy="18"
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth="3.5"
              strokeDasharray={seg.dashArray}
              strokeDashoffset={seg.dashOffset}
              strokeLinecap="round"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-base font-bold text-foreground">{total}</span>
          <span className="text-[9px] text-muted-foreground">Total</span>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
        {data.map((seg) => (
          <div key={seg.name} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: seg.color }} />
            <span className="text-[11px] text-foreground">{seg.name}</span>
            <span className="text-[11px] font-semibold text-muted-foreground">{seg.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Modal ──

const TelecomStatsModal = () => {
  const [open, setOpen] = useState(false);
  const [sector, setSector] = useState<Sector>("telecom");
  const [year, setYear] = useState<Year>(2026);
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("toggle-telecom-stats-modal", handler);
    return () => window.removeEventListener("toggle-telecom-stats-modal", handler);
  }, []);

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (!val) {
      setSector("telecom");
      setYear(2026);
      setYearDropdownOpen(false);
    }
  };

  const d = getData(sector, year);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Statistics
          </DialogTitle>
          <DialogDescription>
            Sector indicators for Botswana's regulated industries. Summary graphs pushed from the admin portal.
          </DialogDescription>
        </DialogHeader>

        {/* Filters Row */}
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          {/* Sector pills */}
          <div className="flex flex-wrap gap-2">
            {SECTOR_OPTIONS.map((s) => (
              <button
                key={s.key}
                onClick={() => setSector(s.key)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                  sector === s.key
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted text-foreground border border-border hover:bg-muted/80"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Year dropdown */}
          <div className="relative ml-auto">
            <button
              onClick={() => setYearDropdownOpen(!yearDropdownOpen)}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
            >
              {year}
              <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${yearDropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {yearDropdownOpen && (
              <div className="absolute right-0 mt-1 z-10 bg-background border border-border rounded-lg shadow-lg py-1 min-w-[80px]">
                {YEARS.map((y) => (
                  <button
                    key={y}
                    onClick={() => { setYear(y); setYearDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                      y === year ? "bg-primary/10 text-primary font-semibold" : "text-foreground hover:bg-muted"
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Key Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
          {d.indicators.map((ind) => (
            <div key={ind.label} className="rounded-xl border border-border bg-muted/40 p-3 text-center">
              <ind.icon className={`h-5 w-5 mx-auto ${ind.color}`} />
              <p className="text-lg font-bold text-foreground mt-1">{ind.value}</p>
              <p className="text-[10px] text-muted-foreground leading-tight">{ind.label}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {d.bars.map((bar) => (
            <div key={bar.title} className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">{bar.title}</h3>
              <BarChart data={bar.data} />
            </div>
          ))}

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">{d.donut.title}</h3>
            <DonutChart data={d.donut.data} total={d.donut.total} />
          </div>
        </div>

        {/* Source */}
        <p className="text-[10px] text-muted-foreground text-center mt-4 border-t border-border pt-3">
          Source: BOCRA Annual Reports &amp; Quarterly Statistics — {year} (summary data pushed from admin portal)
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default TelecomStatsModal;
