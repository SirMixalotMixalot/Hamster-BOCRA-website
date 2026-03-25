import { MessageSquareWarning, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getComplaint, listComplaints, updateComplaint, type ComplaintDetailResponse, type ComplaintListItem } from "@/lib/complaints";
import { useToast } from "@/hooks/use-toast";

type ComplaintWithCompany = ComplaintListItem & { company: string };

const KNOWN_COMPANIES = ["BTC", "MASCOM", "ORANGE", "BOFINET"] as const;

const MOCK_COMPLAINTS: ComplaintWithCompany[] = [
  {
    id: "mock-cmp-001",
    reference_number: "BOCRA-CMP-2026-0001",
    subject: "Billing dispute with BTC data bundle",
    category: "billing",
    status: "open",
    company: "BTC",
    created_at: "2026-03-18T10:20:00Z",
    updated_at: "2026-03-18T10:20:00Z",
    resolved_at: null,
  },
  {
    id: "mock-cmp-002",
    reference_number: "BOCRA-CMP-2026-0002",
    subject: "Orange service outage in Gaborone",
    category: "service quality",
    status: "investigating",
    company: "ORANGE",
    created_at: "2026-03-19T09:15:00Z",
    updated_at: "2026-03-20T08:00:00Z",
    resolved_at: null,
  },
  {
    id: "mock-cmp-003",
    reference_number: "BOCRA-CMP-2026-0003",
    subject: "Mascom delayed SIM replacement",
    category: "customer care",
    status: "resolved",
    company: "MASCOM",
    created_at: "2026-03-15T12:00:00Z",
    updated_at: "2026-03-17T14:30:00Z",
    resolved_at: "2026-03-17T14:30:00Z",
  },
  {
    id: "mock-cmp-004",
    reference_number: "BOCRA-CMP-2026-0004",
    subject: "General internet speed complaint",
    category: "internet",
    status: "open",
    company: "OTHER",
    created_at: "2026-03-22T11:40:00Z",
    updated_at: "2026-03-22T11:40:00Z",
    resolved_at: null,
  },
];

const getCompanyFromText = (subject: string, category: string | null) => {
  const text = `${subject} ${category ?? ""}`.toUpperCase();
  return KNOWN_COMPANIES.find((company) => text.includes(company)) ?? "OTHER";
};

const getSectorFromText = (subject: string, category: string | null) => {
  const text = `${subject} ${category ?? ""}`.toLowerCase();
  if (text.includes("broadcast") || text.includes("radio") || text.includes("tv")) return "broadcasting";
  if (text.includes("postal") || text.includes("courier") || text.includes("parcel")) return "postal";
  if (text.includes("internet") || text.includes("data") || text.includes("isp") || text.includes("broadband")) return "internet";
  return "telecom";
};

const statusLabel = (status: string) => {
  if (status === "investigating") return "In Progress";
  if (status === "resolved") return "Resolved";
  if (status === "open") return "Open";
  return status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const Complaints = () => {
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<ComplaintWithCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "investigating" | "resolved">("all");
  const [sectorFilter, setSectorFilter] = useState<"all" | "telecom" | "broadcasting" | "postal" | "internet">("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintDetailResponse | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const response = await listComplaints();
        if (!mounted) return;
        const mapped: ComplaintWithCompany[] = response.items.map((item) => ({
          ...item,
          company: getCompanyFromText(item.subject, item.category),
        }));
        setComplaints(mapped);
        setError(null);
      } catch (loadError) {
        if (!mounted) return;
        setError(loadError instanceof Error ? loadError.message : "Failed to load complaints.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const displayComplaints = complaints.length > 0 ? complaints : MOCK_COMPLAINTS;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return displayComplaints.filter((item) => {
      const matchesSearch = !q || (item.reference_number ?? "").toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const sector = getSectorFromText(item.subject, item.category);
      const matchesSector = sectorFilter === "all" || sector === sectorFilter;
      return matchesSearch && matchesStatus && matchesSector;
    });
  }, [displayComplaints, search, statusFilter, sectorFilter]);

  const openComplaint = async (complaintId: string) => {
    const match = displayComplaints.find((item) => item.id === complaintId);
    if (!match) return;

    if (complaintId.startsWith("mock-")) {
      setSelectedComplaint({
        ...match,
        description: "Mock complaint details for admin review panel.",
        admin_response: null,
        evidence_file_ids: null,
        resolved_by: null,
      });
      return;
    }

    try {
      setOpeningId(complaintId);
      const detail = await getComplaint(complaintId);
      setSelectedComplaint(detail);
    } catch (openError) {
      toast({
        title: "Open failed",
        description: openError instanceof Error ? openError.message : "Could not open complaint details.",
        variant: "destructive",
      });
    } finally {
      setOpeningId(null);
    }
  };

  const setStatus = async (complaintId: string, status: "open" | "investigating" | "resolved") => {
    try {
      setUpdatingId(complaintId);
      const updated = await updateComplaint(complaintId, { status });
      setComplaints((current) =>
        current.map((item) =>
          item.id === complaintId
            ? {
                ...item,
                status: updated.status,
                updated_at: updated.updated_at,
                resolved_at: updated.resolved_at,
              }
            : item,
        ),
      );
      toast({
        title: "Status updated",
        description: `${updated.reference_number ?? "Complaint"} is now ${statusLabel(updated.status)}.`,
      });
      if (selectedComplaint?.id === complaintId) {
        setSelectedComplaint(updated);
      }
    } catch (updateError) {
      toast({
        title: "Update failed",
        description: updateError instanceof Error ? updateError.message : "Could not update complaint.",
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="text-2xl font-heading font-bold text-foreground">Complaints</h2>
        <p className="text-sm text-muted-foreground mt-1">Track and resolve customer complaints</p>
      </div>

      <div className="bg-card rounded-xl border border-border p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by complaint number..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <select
            value={sectorFilter}
            onChange={(event) => setSectorFilter(event.target.value as typeof sectorFilter)}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          >
            <option value="all">All sectors</option>
            <option value="telecom">Telecom</option>
            <option value="broadcasting">Broadcasting</option>
            <option value="postal">Postal</option>
            <option value="internet">Internet</option>
          </select>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          >
            <option value="all">All statuses</option>
            <option value="open">Open</option>
            <option value="investigating">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-red-500">{error}</p>
          <p className="text-xs text-muted-foreground mt-1">Showing mock complaints data.</p>
        </div>
      )}

      {loading ? (
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">Loading complaints...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <MessageSquareWarning className="h-10 w-10 text-muted-foreground/30 mx-auto" />
          <p className="text-sm text-muted-foreground mt-3">No matching complaints</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Try changing filters or search criteria</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-2 py-2 font-semibold text-foreground whitespace-nowrap">Complaint Number</th>
                  <th className="px-2 py-2 font-semibold text-foreground whitespace-nowrap">Company</th>
                  <th className="px-2 py-2 font-semibold text-foreground whitespace-nowrap">Subject</th>
                  <th className="px-2 py-2 font-semibold text-foreground whitespace-nowrap">Status</th>
                  <th className="px-2 py-2 font-semibold text-foreground whitespace-nowrap">Open / Review</th>
                  <th className="px-2 py-2 font-semibold text-foreground whitespace-nowrap">Update Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-b border-border/70">
                    <td className="px-2 py-2 font-semibold text-foreground whitespace-nowrap">{item.reference_number ?? "—"}</td>
                    <td className="px-2 py-2 text-muted-foreground whitespace-nowrap">{item.company}</td>
                    <td className="px-2 py-2 text-muted-foreground whitespace-nowrap">{item.subject}</td>
                    <td className="px-2 py-2 text-foreground whitespace-nowrap">{statusLabel(item.status)}</td>
                    <td className="px-2 py-2">
                      <button
                        type="button"
                        disabled={openingId === item.id}
                        onClick={() => void openComplaint(item.id)}
                        className="px-2 py-1 rounded-md text-[11px] font-medium border border-border bg-background hover:bg-muted transition-colors whitespace-nowrap"
                      >
                        {openingId === item.id ? "Opening..." : "Open"}
                      </button>
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex flex-nowrap gap-1">
                        <button
                          type="button"
                          disabled={updatingId === item.id}
                          onClick={() => void setStatus(item.id, "open")}
                          className="px-2 py-1 rounded-md text-[11px] font-medium border border-border bg-background hover:bg-muted transition-colors whitespace-nowrap"
                        >
                          Open
                        </button>
                        <button
                          type="button"
                          disabled={updatingId === item.id}
                          onClick={() => void setStatus(item.id, "investigating")}
                          className="px-2 py-1 rounded-md text-[11px] font-medium border border-border bg-background hover:bg-muted transition-colors whitespace-nowrap"
                        >
                          In Progress
                        </button>
                        <button
                          type="button"
                          disabled={updatingId === item.id}
                          onClick={() => void setStatus(item.id, "resolved")}
                          className="px-2 py-1 rounded-md text-[11px] font-semibold bg-bocra-teal text-white hover:bg-bocra-teal/90 transition-colors whitespace-nowrap"
                        >
                          Resolved
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedComplaint && (
        <div className="bg-card rounded-xl border border-border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Reviewing {selectedComplaint.reference_number ?? "Complaint"}</h3>
            <button
              type="button"
              onClick={() => setSelectedComplaint(null)}
              className="px-2.5 py-1 rounded-md text-xs font-medium border border-border bg-background hover:bg-muted transition-colors"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">Subject</p>
              <p className="mt-1 font-medium text-foreground">{selectedComplaint.subject}</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">Category</p>
              <p className="mt-1 font-medium text-foreground">{selectedComplaint.category ?? "—"}</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="mt-1 font-medium text-foreground">{statusLabel(selectedComplaint.status)}</p>
            </div>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground mb-1">Description</p>
            <p className="text-sm text-foreground whitespace-pre-wrap">{selectedComplaint.description}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Complaints;
