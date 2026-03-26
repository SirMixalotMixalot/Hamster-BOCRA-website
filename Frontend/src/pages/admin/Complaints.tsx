import { Loader2, MessageSquareWarning, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getComplaint, listComplaints, updateComplaint, type ComplaintDetailResponse, type ComplaintListItem } from "@/lib/complaints";
import { useToast } from "@/hooks/use-toast";

type ComplaintWithCompany = ComplaintListItem & { company: string };

const KNOWN_COMPANIES = ["BTC", "MASCOM", "ORANGE", "BOFINET"] as const;

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

const STATUS_OPTIONS: Array<{ key: "open" | "investigating" | "resolved"; label: string }> = [
  { key: "open", label: "Open" },
  { key: "investigating", label: "In Progress" },
  { key: "resolved", label: "Resolved" },
];

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
  const [savingResponse, setSavingResponse] = useState(false);
  const [adminResponseDraft, setAdminResponseDraft] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintDetailResponse | null>(null);

  useEffect(() => {
    let mounted = true;
    const searchQuery = search.trim();
    const statusQuery = statusFilter === "all" ? undefined : statusFilter;

    const load = async () => {
      if (mounted) {
        setLoading(true);
      }
      try {
        const response = await listComplaints({
          status: statusQuery,
          q: searchQuery || undefined,
        });
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
  }, [search, statusFilter]);

  useEffect(() => {
    setAdminResponseDraft(selectedComplaint?.admin_response ?? "");
  }, [selectedComplaint]);

  const displayComplaints = complaints;

  const filtered = useMemo(() => {
    return displayComplaints.filter((item) => {
      const sector = getSectorFromText(item.subject, item.category);
      const matchesSector = sectorFilter === "all" || sector === sectorFilter;
      return matchesSector;
    });
  }, [displayComplaints, sectorFilter]);

  const openComplaint = async (complaintId: string) => {
    const match = displayComplaints.find((item) => item.id === complaintId);
    if (!match) return;

    try {
      setOpeningId(complaintId);
      setSelectedComplaint(null);
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

  const saveAdminResponse = async () => {
    if (!selectedComplaint) return;
    try {
      setSavingResponse(true);
      const updated = await updateComplaint(selectedComplaint.id, {
        admin_response: adminResponseDraft.trim() || null,
      });
      setSelectedComplaint(updated);
      setComplaints((current) =>
        current.map((item) =>
          item.id === updated.id
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
        title: "Review response saved",
        description: `${updated.reference_number ?? "Complaint"} response has been updated.`,
      });
    } catch (saveError) {
      toast({
        title: "Save failed",
        description: saveError instanceof Error ? saveError.message : "Could not save admin response.",
        variant: "destructive",
      });
    } finally {
      setSavingResponse(false);
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
        </div>
      )}

      {loading ? (
        <div className="bg-card rounded-xl border border-border p-8">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative h-10 w-10">
              <span className="absolute inset-0 rounded-full border-2 border-muted animate-ping" />
              <span className="absolute inset-0 rounded-full border-2 border-primary/50" />
              <span className="absolute inset-2 rounded-full bg-primary/20" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-primary/70 animate-bounce [animation-delay:-0.2s]" />
              <span className="h-2 w-2 rounded-full bg-primary/70 animate-bounce [animation-delay:-0.1s]" />
              <span className="h-2 w-2 rounded-full bg-primary/70 animate-bounce" />
            </div>
            <p className="text-sm text-muted-foreground">Loading complaints...</p>
          </div>
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
                    <td className="px-2 py-2 font-semibold text-foreground whitespace-nowrap">
                      <button
                        type="button"
                        disabled={openingId === item.id}
                        onClick={() => void openComplaint(item.id)}
                        className="text-left hover:underline disabled:opacity-70"
                      >
                        {item.reference_number ?? "—"}
                      </button>
                    </td>
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
                      <div className="flex flex-nowrap gap-1 items-center">
                        {STATUS_OPTIONS.map((option) => {
                          const isActive = item.status === option.key;
                          const isUpdatingRow = updatingId === item.id;
                          return (
                            <button
                              key={option.key}
                              type="button"
                              disabled={isUpdatingRow || isActive}
                              onClick={() => void setStatus(item.id, option.key)}
                              className={`px-2 py-1 rounded-md text-[11px] transition-colors whitespace-nowrap ${
                                isActive
                                  ? "font-semibold bg-bocra-teal text-white"
                                  : "font-medium border border-border bg-background hover:bg-muted"
                              } ${isUpdatingRow ? "opacity-70" : ""}`}
                            >
                              {option.label}
                            </button>
                          );
                        })}
                        {updatingId === item.id && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {openingId && !selectedComplaint && (
        <div className="bg-card rounded-xl border border-border p-6 flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading complaint details...</p>
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
          <div className="rounded-lg border border-border p-3 space-y-2">
            <p className="text-xs text-muted-foreground">Admin Response</p>
            <textarea
              rows={4}
              value={adminResponseDraft}
              onChange={(event) => setAdminResponseDraft(event.target.value)}
              placeholder="Write your investigation outcome or guidance for the complainant..."
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => void saveAdminResponse()}
                disabled={savingResponse}
                className="px-3 py-1.5 rounded-md text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {savingResponse ? "Saving..." : "Save Response"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Complaints;
