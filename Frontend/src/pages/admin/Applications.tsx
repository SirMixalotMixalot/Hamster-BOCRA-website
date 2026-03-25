import { FileText, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  getApplication,
  listApplications,
  updateApplicationStatus,
  type ApplicationDetail,
  type ApplicationListItem,
  type ApplicationStatus,
} from "@/lib/applications";
import { useToast } from "@/hooks/use-toast";
import { BOCRA_LICENCE_TYPES } from "@/lib/constants";

const MOCK_RECEIVED_APPLICATIONS: ApplicationListItem[] = [
  {
    id: "mock-app-001",
    reference_number: "BOCRA-2026-0101",
    licence_type: "Cellular Licence",
    status: "submitted",
    submitted_at: "2026-03-20T10:15:00Z",
    created_at: "2026-03-20T09:40:00Z",
    updated_at: "2026-03-20T10:15:00Z",
  },
  {
    id: "mock-app-002",
    reference_number: "BOCRA-2026-0102",
    licence_type: "Broadcasting Licence",
    status: "under_review",
    submitted_at: "2026-03-21T12:30:00Z",
    created_at: "2026-03-21T11:55:00Z",
    updated_at: "2026-03-22T08:10:00Z",
  },
  {
    id: "mock-app-003",
    reference_number: "BOCRA-2026-0103",
    licence_type: "Radio Frequency Licence",
    status: "approved",
    submitted_at: "2026-03-18T14:45:00Z",
    created_at: "2026-03-18T14:00:00Z",
    updated_at: "2026-03-23T09:20:00Z",
  },
  {
    id: "mock-app-004",
    reference_number: "BOCRA-2026-0104",
    licence_type: "Type Approval Licence",
    status: "rejected",
    submitted_at: "2026-03-17T16:20:00Z",
    created_at: "2026-03-17T15:35:00Z",
    updated_at: "2026-03-22T13:05:00Z",
  },
];

const AdminApplications = () => {
  const { toast } = useToast();
  const [applications, setApplications] = useState<ApplicationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "submitted" | "under_review" | "approved" | "rejected">("all");
  const [licenceFilter, setLicenceFilter] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationDetail | null>(null);
  const [openingId, setOpeningId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const items = await listApplications();
        if (!mounted) return;
        setApplications(items);
        setError(null);
      } catch (loadError) {
        if (!mounted) return;
        setError(loadError instanceof Error ? loadError.message : "Failed to load applications.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const displayApplications = applications.length > 0 ? applications : MOCK_RECEIVED_APPLICATIONS;

  const licenceOptions = useMemo(
    () => ["all", ...BOCRA_LICENCE_TYPES],
    [],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return displayApplications.filter((app) => {
      const matchesSearch = !q || app.reference_number.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || app.status === statusFilter;
      const matchesLicence = licenceFilter === "all" || app.licence_type === licenceFilter;
      return matchesSearch && matchesStatus && matchesLicence;
    });
  }, [displayApplications, search, statusFilter, licenceFilter]);

  const updateStatus = async (applicationId: string, status: ApplicationStatus) => {
    try {
      setUpdatingId(applicationId);
      const updated = await updateApplicationStatus(applicationId, status);
      setApplications((current) => current.map((item) => (item.id === applicationId ? { ...item, status: updated.status } : item)));
      toast({
        title: "Status updated",
        description: `${updated.reference_number} is now ${updated.status.replace("_", " ")}.`,
      });
    } catch (updateError) {
      toast({
        title: "Update failed",
        description: updateError instanceof Error ? updateError.message : "Could not update status.",
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const openForReview = async (applicationId: string) => {
    const match = displayApplications.find((item) => item.id === applicationId);
    if (!match) return;

    if (applicationId.startsWith("mock-")) {
      setSelectedApplication({
        ...match,
        applicant_id: "mock-applicant",
        form_data_a: { applicant_name: "Mock Applicant", business_name: "Mock Communications (Pty) Ltd" },
        form_data_b: { requested_spectrum: "800MHz", district: "Gaborone" },
        form_data_c: null,
        form_data_d: null,
        admin_notes: "Mock application for review preview.",
        decision_reason: null,
        decided_by: null,
        decided_at: null,
      });
      return;
    }

    try {
      setOpeningId(applicationId);
      const detail = await getApplication(applicationId);
      setSelectedApplication(detail);
    } catch (openError) {
      toast({
        title: "Open failed",
        description: openError instanceof Error ? openError.message : "Could not open application details.",
        variant: "destructive",
      });
    } finally {
      setOpeningId(null);
    }
  };

  const statusLabel = (status: string) =>
    status === "under_review" ? "In Progress" : status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="text-2xl font-heading font-bold text-foreground">Applications</h2>
        <p className="text-sm text-muted-foreground mt-1">Review, approve, or reject licence applications</p>
      </div>

      <div className="bg-card rounded-xl border border-border p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by application number..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <select
            value={licenceFilter}
            onChange={(event) => setLicenceFilter(event.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          >
            {licenceOptions.map((option) => (
              <option key={option} value={option}>
                {option === "all" ? "All licence types" : option}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          >
            <option value="all">View all</option>
            <option value="submitted">Pending</option>
            <option value="under_review">In Progress</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-red-500">{error}</p>
          <p className="text-xs text-muted-foreground mt-1">Showing 4 received mock applications.</p>
        </div>
      )}

      {loading ? (
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">Loading applications...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto" />
          <p className="text-sm text-muted-foreground mt-3">No matching applications</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Try changing filters or search by another application number</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-2 py-2 font-semibold text-foreground whitespace-nowrap">Application Number</th>
                  <th className="px-2 py-2 font-semibold text-foreground whitespace-nowrap">Licence Type</th>
                  <th className="px-2 py-2 font-semibold text-foreground whitespace-nowrap">Created</th>
                  <th className="px-2 py-2 font-semibold text-foreground whitespace-nowrap">Submitted</th>
                  <th className="px-2 py-2 font-semibold text-foreground whitespace-nowrap">Status</th>
                  <th className="px-2 py-2 font-semibold text-foreground whitespace-nowrap">Open / Review</th>
                  <th className="px-2 py-2 font-semibold text-foreground whitespace-nowrap">Update Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((app) => (
                  <tr key={app.id} className="border-b border-border/70">
                    <td className="px-2 py-2 font-semibold text-foreground whitespace-nowrap">{app.reference_number}</td>
                    <td className="px-2 py-2 text-muted-foreground whitespace-nowrap">{app.licence_type}</td>
                    <td className="px-2 py-2 text-muted-foreground whitespace-nowrap">{new Date(app.created_at).toLocaleDateString()}</td>
                    <td className="px-2 py-2 text-muted-foreground whitespace-nowrap">
                      {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-2 py-2 text-foreground whitespace-nowrap">{statusLabel(app.status)}</td>
                    <td className="px-2 py-2">
                      <button
                        type="button"
                        disabled={openingId === app.id}
                        onClick={() => void openForReview(app.id)}
                        className="px-2 py-1 rounded-md text-[11px] font-medium border border-border bg-background hover:bg-muted transition-colors whitespace-nowrap"
                      >
                        {openingId === app.id ? "Opening..." : "Open"}
                      </button>
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex flex-nowrap gap-1">
                        <button
                          type="button"
                          disabled={updatingId === app.id}
                          onClick={() => void updateStatus(app.id, "under_review")}
                          className="px-2 py-1 rounded-md text-[11px] font-medium border border-border bg-background hover:bg-muted transition-colors whitespace-nowrap"
                        >
                          In Progress
                        </button>
                        <button
                          type="button"
                          disabled={updatingId === app.id}
                          onClick={() => void updateStatus(app.id, "approved")}
                          className="px-2 py-1 rounded-md text-[11px] font-semibold bg-bocra-teal text-white hover:bg-bocra-teal/90 transition-colors whitespace-nowrap"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={updatingId === app.id}
                          onClick={() => void updateStatus(app.id, "rejected")}
                          className="px-2 py-1 rounded-md text-[11px] font-semibold bg-bocra-rose text-white hover:bg-bocra-rose/90 transition-colors whitespace-nowrap"
                        >
                          Reject
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

      {selectedApplication && (
        <div className="bg-card rounded-xl border border-border p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              Reviewing {selectedApplication.reference_number}
            </h3>
            <button
              type="button"
              onClick={() => setSelectedApplication(null)}
              className="px-2.5 py-1 rounded-md text-xs font-medium border border-border bg-background hover:bg-muted transition-colors"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">Licence Type</p>
              <p className="mt-1 font-medium text-foreground">{selectedApplication.licence_type}</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="mt-1 font-medium text-foreground">{statusLabel(selectedApplication.status)}</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">Submitted Date</p>
              <p className="mt-1 font-medium text-foreground">
                {selectedApplication.submitted_at ? new Date(selectedApplication.submitted_at).toLocaleDateString() : "—"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground mb-2">Form Data A</p>
              <pre className="text-xs text-foreground whitespace-pre-wrap break-words">
                {JSON.stringify(selectedApplication.form_data_a ?? {}, null, 2)}
              </pre>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground mb-2">Form Data B</p>
              <pre className="text-xs text-foreground whitespace-pre-wrap break-words">
                {JSON.stringify(selectedApplication.form_data_b ?? {}, null, 2)}
              </pre>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground mb-2">Form Data C</p>
              <pre className="text-xs text-foreground whitespace-pre-wrap break-words">
                {JSON.stringify(selectedApplication.form_data_c ?? {}, null, 2)}
              </pre>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground mb-2">Form Data D</p>
              <pre className="text-xs text-foreground whitespace-pre-wrap break-words">
                {JSON.stringify(selectedApplication.form_data_d ?? {}, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApplications;
