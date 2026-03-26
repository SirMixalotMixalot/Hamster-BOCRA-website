import { FileText, Loader2, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  getApplication,
  listApplications,
  requestApplicationInfo,
  updateApplicationStatus,
  type ApplicationDetail,
  type ApplicationListItem,
  type ApplicationStatus,
} from "@/lib/applications";
import { useToast } from "@/hooks/use-toast";
import { BOCRA_LICENCE_TYPES } from "@/lib/constants";
import { LoadingDots } from "@/components/ui/loading-dots";

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

const STATUS_OPTIONS: Array<{ key: "under_review" | "waiting_for_payment" | "approved" | "rejected" | "requires_action"; label: string }> = [
  { key: "under_review", label: "In Progress" },
  { key: "waiting_for_payment", label: "Waiting for Payment" },
  { key: "approved", label: "Approve" },
  { key: "rejected", label: "Reject" },
  { key: "requires_action", label: "Request Info" },
];

const BASE64_PATTERN = /^[A-Za-z0-9+/]+={0,2}$/;
const DATA_URL_PATTERN = /^data:([^;,]+)?(?:;charset=[^;,]+)?(;base64)?,([\s\S]*)$/i;

const isLikelyBase64 = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length < 12 || trimmed.length % 4 !== 0) return false;
  return BASE64_PATTERN.test(trimmed.replace(/[-_]/g, "A"));
};

const decodeBase64ToText = (value: string) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder("utf-8").decode(bytes);
};

const estimateBase64Bytes = (value: string) => {
  const trimmed = value.trim();
  const padding = trimmed.endsWith("==") ? 2 : trimmed.endsWith("=") ? 1 : 0;
  return Math.max(0, Math.floor((trimmed.length * 3) / 4) - padding);
};

const summarizeDataUrl = (value: string) => {
  const match = value.match(DATA_URL_PATTERN);
  if (!match) return null;

  const mimeType = (match[1] || "application/octet-stream").toLowerCase();
  const isBase64 = Boolean(match[2]);
  const payload = match[3] || "";

  const summary: Record<string, unknown> = {
    kind: "data_url",
    mime_type: mimeType,
    encoding: isBase64 ? "base64" : "url-encoded",
  };

  if (isBase64) {
    summary.byte_length = estimateBase64Bytes(payload);
    if (mimeType.startsWith("image/")) {
      summary.preview = `[binary ${mimeType} omitted]`;
      return summary;
    }

    try {
      const decodedText = decodeBase64ToText(payload);
      if (isMostlyReadableText(decodedText)) {
        const parsedDecoded = tryParseJsonText(decodedText);
        summary.decoded = parsedDecoded !== decodedText ? decodeForDisplay(parsedDecoded, 0) : decodedText;
      } else {
        summary.preview = "[binary payload omitted]";
      }
      return summary;
    } catch {
      summary.preview = "[invalid base64 payload]";
      return summary;
    }
  }

  const decodedUri = decodeURIComponent(payload);
  summary.decoded = tryParseJsonText(decodedUri);
  return summary;
};

const isMostlyReadableText = (value: string) => {
  if (!value) return false;
  let readable = 0;
  for (const char of value) {
    const code = char.charCodeAt(0);
    if ((code >= 32 && code <= 126) || code === 10 || code === 13 || code === 9) {
      readable += 1;
    }
  }
  return readable / value.length > 0.9;
};

const tryParseJsonText = (value: string): unknown => {
  const trimmed = value.trim();
  if (!(trimmed.startsWith("{") || trimmed.startsWith("["))) {
    return value;
  }
  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
};

const decodeForDisplay = (value: unknown, depth = 0): unknown => {
  if (depth > 8) return value;

  if (typeof value === "string") {
    const dataUrlSummary = summarizeDataUrl(value);
    if (dataUrlSummary) {
      return dataUrlSummary;
    }

    const parsed = tryParseJsonText(value);
    if (parsed !== value) {
      return decodeForDisplay(parsed, depth + 1);
    }

    if (isLikelyBase64(value)) {
      try {
        const decodedText = decodeBase64ToText(value);
        if (isMostlyReadableText(decodedText)) {
          const parsedDecoded = tryParseJsonText(decodedText);
          if (parsedDecoded !== decodedText) {
            return decodeForDisplay(parsedDecoded, depth + 1);
          }
          return decodedText;
        }
      } catch {
        return value;
      }
    }
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => decodeForDisplay(item, depth + 1));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entryValue]) => [key, decodeForDisplay(entryValue, depth + 1)]),
    );
  }

  return value;
};

const formatDataBlock = (value: unknown) => {
  const decoded = decodeForDisplay(value ?? {});
  try {
    return JSON.stringify(decoded, null, 2);
  } catch {
    return String(decoded);
  }
};

const AdminApplications = () => {
  const { toast } = useToast();
  const [applications, setApplications] = useState<ApplicationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "submitted" | "under_review" | "waiting_for_payment" | "approved" | "rejected" | "requires_action">("all");
  const [licenceFilter, setLicenceFilter] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationDetail | null>(null);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [requestInfoDraft, setRequestInfoDraft] = useState("");

  useEffect(() => {
    setRequestInfoDraft(selectedApplication?.admin_notes ?? "");
  }, [selectedApplication]);

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

  const updateStatus = async (applicationId: string, status: ApplicationStatus, adminNotes?: string) => {
    try {
      setUpdatingId(applicationId);
      const updated = await updateApplicationStatus(applicationId, status, adminNotes);
      setApplications((current) => current.map((item) => (item.id === applicationId ? { ...item, status: updated.status } : item)));
      if (selectedApplication?.id === applicationId) {
        setSelectedApplication(updated);
      }
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
        documents: [],
        admin_notes: "Mock application for review preview.",
        decision_reason: null,
        decided_by: null,
        decided_at: null,
      });
      return;
    }

    try {
      setOpeningId(applicationId);
      setSelectedApplication(null);
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

  const requestMoreInfo = async () => {
    if (!selectedApplication) return;
    const note = requestInfoDraft.trim();
    if (!note) {
      toast({
        title: "Request note required",
        description: "Add guidance on what more information the customer should provide.",
        variant: "destructive",
      });
      return;
    }
    try {
      setUpdatingId(selectedApplication.id);
      const updated = await requestApplicationInfo(selectedApplication.id, note);
      setApplications((current) => current.map((item) => (item.id === selectedApplication.id ? { ...item, status: updated.status } : item)));
      setSelectedApplication(updated);
      toast({
        title: "Information requested",
        description: `Customer has been asked to provide additional details for ${updated.reference_number}.`,
      });
    } catch (requestError) {
      toast({
        title: "Request failed",
        description: requestError instanceof Error ? requestError.message : "Could not request additional information.",
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

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
            <option value="waiting_for_payment">Waiting for Payment</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="requires_action">Action Required</option>
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
        <div className="bg-card rounded-xl border border-border p-8">
          <LoadingDots label="Loading applications..." />
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
                </tr>
              </thead>
              <tbody>
                {filtered.map((app) => (
                  <tr key={app.id} className="border-b border-border/70">
                    <td className="px-2 py-2 font-semibold text-foreground whitespace-nowrap">
                      <button
                        type="button"
                        disabled={openingId === app.id}
                        onClick={() => void openForReview(app.id)}
                        className="text-left hover:underline disabled:opacity-70"
                      >
                        {app.reference_number}
                      </button>
                    </td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {openingId && !selectedApplication && (
        <div className="bg-card rounded-xl border border-border p-6 flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading application details...</p>
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

          <div className="rounded-lg border border-border p-3 space-y-2">
            <p className="text-xs text-muted-foreground">Update Status</p>
            <div className="flex flex-wrap gap-1.5 items-center">
              {STATUS_OPTIONS.map((option) => {
                const isActive = selectedApplication.status === option.key;
                const isUpdatingSelected = updatingId === selectedApplication.id;
                return (
                  <button
                    key={option.key}
                    type="button"
                    disabled={isUpdatingSelected || isActive || option.key === "requires_action"}
                    onClick={() => void updateStatus(selectedApplication.id, option.key)}
                    className={`px-2.5 py-1 rounded-md text-[11px] transition-colors whitespace-nowrap ${
                      isActive
                        ? "font-semibold bg-bocra-teal text-white"
                        : "font-medium border border-border bg-background hover:bg-muted"
                    } ${isUpdatingSelected ? "opacity-70" : ""}`}
                  >
                    {option.label}
                  </button>
                );
              })}
              {updatingId === selectedApplication.id && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
            </div>
            <div className="space-y-2 pt-1 border-t border-border/70">
              <p className="text-[11px] text-muted-foreground">Need more information from customer?</p>
              <textarea
                rows={3}
                value={requestInfoDraft}
                onChange={(event) => setRequestInfoDraft(event.target.value)}
                placeholder="Tell the customer exactly what additional information or documents are needed..."
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={updatingId === selectedApplication.id}
                  onClick={() => void requestMoreInfo()}
                  className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                  Mark Action Required
                </button>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">Status updates are only available while reviewing an opened application.</p>
          </div>

          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground mb-2">Uploaded Documents</p>
            {selectedApplication.documents.length === 0 ? (
              <p className="text-xs text-muted-foreground">No uploaded documents linked to this application.</p>
            ) : (
              <div className="space-y-1.5">
                {selectedApplication.documents.map((doc) => (
                  <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs">
                    <span className="font-medium text-foreground break-all">{doc.file_name}</span>
                    <span className="text-muted-foreground">
                      {(doc.file_type || "unknown type")} • {doc.file_size ? `${Math.max(1, Math.round(doc.file_size / 1024))} KB` : "size n/a"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground mb-2">Customer Additional Information Responses</p>
            {Array.isArray((selectedApplication.form_data_d as Record<string, unknown> | null)?.additional_info_responses) &&
            ((selectedApplication.form_data_d as Record<string, unknown>).additional_info_responses as unknown[]).length > 0 ? (
              <div className="space-y-2">
                {((selectedApplication.form_data_d as Record<string, unknown>).additional_info_responses as Array<Record<string, unknown>>).map((response, index) => (
                  <div key={`additional-response-${index}`} className="rounded-md border border-border/70 p-2.5">
                    <p className="text-[11px] text-muted-foreground">
                      Submitted {response.submitted_at ? new Date(String(response.submitted_at)).toLocaleString() : "at unknown time"}
                    </p>
                    {response.note && <p className="text-xs text-foreground mt-1 whitespace-pre-wrap">{String(response.note)}</p>}
                    {Array.isArray(response.uploaded_documents) && response.uploaded_documents.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <p className="text-[11px] font-semibold text-muted-foreground">Uploaded with this response</p>
                        {(response.uploaded_documents as Array<Record<string, unknown>>).map((doc, docIndex) => (
                          <div
                            key={`additional-response-${index}-doc-${docIndex}`}
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-[11px]"
                          >
                            <span className="font-medium text-foreground break-all">{String(doc.file_name || "Document")}</span>
                            <span className="text-muted-foreground">{String(doc.file_type || "unknown type")}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No additional information responses submitted yet.</p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground mb-2">Form Data A</p>
              <pre className="text-xs text-foreground whitespace-pre-wrap break-words">
                {formatDataBlock(selectedApplication.form_data_a)}
              </pre>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground mb-2">Form Data B</p>
              <pre className="text-xs text-foreground whitespace-pre-wrap break-words">
                {formatDataBlock(selectedApplication.form_data_b)}
              </pre>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground mb-2">Form Data C</p>
              <pre className="text-xs text-foreground whitespace-pre-wrap break-words">
                {formatDataBlock(selectedApplication.form_data_c)}
              </pre>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground mb-2">Form Data D</p>
              <pre className="text-xs text-foreground whitespace-pre-wrap break-words">
                {formatDataBlock(selectedApplication.form_data_d)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApplications;
