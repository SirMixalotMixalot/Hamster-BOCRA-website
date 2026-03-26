import { useEffect, useMemo, useState } from "react";
import { FileText, Plus, Clock, CheckCircle, XCircle, AlertCircle, Eye, Award } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  getApplication,
  getApplicationHistory,
  listApplications,
  resubmitApplication,
  updateApplication,
  type ApplicationDetail,
  type ApplicationListItem,
  type ApplicationStatusLogItem,
} from "@/lib/applications";
import { LoadingDots } from "@/components/ui/loading-dots";
import { uploadDocument } from "@/lib/documents";

type AppStatus = "all" | "draft" | "submitted" | "under_review" | "waiting_for_payment" | "requires_action" | "approved" | "rejected";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  draft: { label: "Draft", color: "text-gray-600", bg: "bg-gray-100", icon: FileText },
  submitted: { label: "Submitted", color: "text-blue-600", bg: "bg-blue-50", icon: Clock },
  under_review: { label: "Under Review", color: "text-amber-600", bg: "bg-amber-50", icon: Eye },
  waiting_for_payment: { label: "Waiting for Payment", color: "text-indigo-600", bg: "bg-indigo-50", icon: Clock },
  approved: { label: "Approved", color: "text-green-600", bg: "bg-green-50", icon: CheckCircle },
  rejected: { label: "Rejected", color: "text-red-600", bg: "bg-red-50", icon: XCircle },
  requires_action: { label: "Action Required", color: "text-orange-600", bg: "bg-orange-50", icon: AlertCircle },
};

const FILTER_TABS: { value: AppStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "draft", label: "Drafts" },
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under Review" },
  { value: "waiting_for_payment", label: "Waiting for Payment" },
  { value: "requires_action", label: "Action Required" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const Applications = () => {
  const [filter, setFilter] = useState<AppStatus>("all");
  const [applications, setApplications] = useState<ApplicationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationDetail | null>(null);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [responseNote, setResponseNote] = useState("");
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const [submittingAdditional, setSubmittingAdditional] = useState(false);
  const [statusTimeline, setStatusTimeline] = useState<ApplicationStatusLogItem[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const focusRef = searchParams.get("ref")?.trim() || "";

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

  const filtered = useMemo(
    () => {
      const base = filter === "all" ? applications : applications.filter((a) => a.status === filter);
      if (!focusRef) return base;

      const normalizedFocus = focusRef.toLowerCase();
      return [...base].sort((a, b) => {
        const aMatch = a.reference_number.toLowerCase() === normalizedFocus ? 0 : 1;
        const bMatch = b.reference_number.toLowerCase() === normalizedFocus ? 0 : 1;
        return aMatch - bMatch;
      });
    },
    [applications, filter, focusRef],
  );

  const openApplication = async (applicationId: string) => {
    try {
      setOpeningId(applicationId);
      setLoadingTimeline(true);
      const [detail, history] = await Promise.all([
        getApplication(applicationId),
        getApplicationHistory(applicationId),
      ]);
      setSelectedApplication(detail);
      setStatusTimeline(history);
      const existingResponse = String((detail.form_data_d as Record<string, unknown> | null)?.customer_response_latest || "");
      setResponseNote(existingResponse);
      setAdditionalFiles([]);
    } catch (openError) {
      toast.error("Could not open application", {
        description: openError instanceof Error ? openError.message : "Please try again.",
      });
    } finally {
      setOpeningId(null);
      setLoadingTimeline(false);
    }
  };

  const submitAdditionalInfo = async () => {
    if (!selectedApplication) return;
    if (selectedApplication.status !== "requires_action") return;

    try {
      setSubmittingAdditional(true);

      const uploadedDocuments = [] as Array<{
        id: string;
        file_name: string;
        file_type: string;
        file_size: number;
        category: string;
        created_at: string;
      }>;

      for (const file of additionalFiles) {
        const uploaded = await uploadDocument({
          file,
          category: "application",
          applicationId: selectedApplication.id,
        });
        uploadedDocuments.push(uploaded);
      }

      const existingFormDataD = (selectedApplication.form_data_d as Record<string, unknown> | null) || {};
      const existingResponses = Array.isArray(existingFormDataD.additional_info_responses)
        ? (existingFormDataD.additional_info_responses as unknown[])
        : [];

      await updateApplication(selectedApplication.id, {
        form_data_d: {
          ...existingFormDataD,
          customer_response_latest: responseNote.trim() || null,
          additional_info_responses: [
            ...existingResponses,
            {
              note: responseNote.trim() || null,
              uploaded_documents: uploadedDocuments,
              submitted_at: new Date().toISOString(),
            },
          ],
        },
      });

      const resubmitted = await resubmitApplication(selectedApplication.id);
      setSelectedApplication(resubmitted);
      setApplications((current) => current.map((item) => (item.id === resubmitted.id ? { ...item, status: resubmitted.status } : item)));
      setAdditionalFiles([]);
      toast.success("Additional info submitted", {
        description: `${resubmitted.reference_number} has been resubmitted for review.`,
      });
    } catch (submitError) {
      toast.error("Could not submit requested info", {
        description: submitError instanceof Error ? submitError.message : "Please try again.",
      });
    } finally {
      setSubmittingAdditional(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-foreground">My Applications</h2>
          <p className="text-sm text-muted-foreground mt-1">Track your licence applications</p>
        </div>
        <div className="flex w-full sm:w-auto items-center gap-3">
          <button
            onClick={() => navigate("/customer/licences")}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-[hsl(var(--input-bg))] text-foreground border border-[hsl(var(--input-border))] hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-all"
          >
            <Award className="h-4 w-4" />
            View Licences
          </button>
          <button
            onClick={() => navigate("/customer/applications/new")}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-[hsl(210_85%_35%)] text-primary-foreground rounded-full text-sm font-medium shadow-glow-primary hover:opacity-90 transition-all"
          >
            <Plus className="h-4 w-4" />
            New Application
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === tab.value
                ? "bg-gradient-to-r from-primary to-[hsl(210_85%_35%)] text-primary-foreground shadow-glow-primary"
                : "bg-[hsl(var(--input-bg))] text-muted-foreground border border-[hsl(var(--input-border))] hover:bg-primary/5 hover:border-primary/30 hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="glass rounded-2xl p-4">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {/* Applications Table */}
      {loading ? (
        <div className="glass rounded-2xl p-8 text-center">
          <LoadingDots label="Loading your applications..." />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center">
          <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto" />
          <p className="text-sm text-muted-foreground mt-3">No applications found</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            {filter === "all" ? "Start a new licence application to get started" : `No ${filter.replace("_", " ")} applications`}
          </p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          {focusRef && (
            <div className="px-5 py-3 border-b border-[hsl(var(--glass-border))] bg-primary/5">
              <p className="text-xs text-muted-foreground">
                Showing activity target: <span className="font-semibold text-foreground">{focusRef}</span>
              </p>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[hsl(var(--glass-border))]">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">Reference</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">Licence Type</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">Date Created</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((app) => {
                  const status = STATUS_CONFIG[app.status];
                  const StatusIcon = status.icon;
                  const isFocused = focusRef && app.reference_number.toLowerCase() === focusRef.toLowerCase();
                  return (
                    <tr
                      key={app.id}
                      className={`border-b border-white/30 last:border-0 hover:bg-primary/5 transition-colors cursor-pointer ${
                        isFocused ? "bg-primary/10" : ""
                      }`}
                    >
                      <td className="px-5 py-3.5">
                        <button
                          type="button"
                          disabled={openingId === app.id}
                          onClick={(event) => {
                            event.stopPropagation();
                            void openApplication(app.id);
                          }}
                          className="text-sm font-semibold text-foreground hover:underline text-left disabled:opacity-70"
                        >
                          {app.reference_number}
                        </button>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-foreground">{app.licence_type}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.color} ${status.bg}`}>
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-muted-foreground">{new Date(app.created_at).toLocaleDateString()}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-muted-foreground">
                          {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : "—"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedApplication && (
        <div className="glass rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Reviewing {selectedApplication.reference_number}</h3>
            <button
              type="button"
              onClick={() => setSelectedApplication(null)}
              className="px-2.5 py-1 rounded-md text-xs font-medium border border-[hsl(var(--input-border))] bg-[hsl(var(--input-bg))] hover:bg-primary/5 hover:border-primary/30 transition-colors"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="rounded-lg border border-[hsl(var(--input-border))] p-3">
              <p className="text-xs text-muted-foreground">Licence Type</p>
              <p className="mt-1 font-medium text-foreground">{selectedApplication.licence_type}</p>
            </div>
            <div className="rounded-lg border border-[hsl(var(--input-border))] p-3">
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="mt-1 font-medium text-foreground">{STATUS_CONFIG[selectedApplication.status]?.label || selectedApplication.status}</p>
            </div>
            <div className="rounded-lg border border-[hsl(var(--input-border))] p-3">
              <p className="text-xs text-muted-foreground">Submitted</p>
              <p className="mt-1 font-medium text-foreground">
                {selectedApplication.submitted_at ? new Date(selectedApplication.submitted_at).toLocaleDateString() : "—"}
              </p>
            </div>
          </div>

          {selectedApplication.admin_notes && (
            <div className="rounded-lg border border-amber-300/50 bg-amber-50/40 p-3">
              <p className="text-xs text-amber-700 font-semibold">BOCRA Request / Notes</p>
              <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">{selectedApplication.admin_notes}</p>
            </div>
          )}

          <div className="rounded-lg border border-[hsl(var(--input-border))] p-3 space-y-2">
            <p className="text-xs text-muted-foreground">Application workflow timeline</p>
            {loadingTimeline ? (
              <LoadingDots label="Loading timeline..." />
            ) : statusTimeline.length === 0 ? (
              <p className="text-xs text-muted-foreground">No timeline events yet.</p>
            ) : (
              <div className="space-y-2">
                {statusTimeline.map((entry) => (
                  <div key={entry.id} className="rounded-md border border-[hsl(var(--input-border))] p-2">
                    <p className="text-xs font-semibold text-foreground">{entry.new_status.replace(/_/g, " ")}</p>
                    <p className="text-[11px] text-muted-foreground">{new Date(entry.created_at).toLocaleString()}</p>
                    {entry.reason && <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">{entry.reason}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-[hsl(var(--input-border))] p-3 space-y-2">
            <p className="text-xs text-muted-foreground">Your additional information history</p>
            {Array.isArray((selectedApplication.form_data_d as Record<string, unknown> | null)?.additional_info_responses) &&
            ((selectedApplication.form_data_d as Record<string, unknown>).additional_info_responses as unknown[]).length > 0 ? (
              <div className="space-y-2">
                {((selectedApplication.form_data_d as Record<string, unknown>).additional_info_responses as Array<Record<string, unknown>>).map((response, index) => (
                  <div key={`response-${index}`} className="rounded-md border border-[hsl(var(--input-border))] p-2">
                    <p className="text-[11px] text-muted-foreground">
                      Submitted {response.submitted_at ? new Date(String(response.submitted_at)).toLocaleString() : "at unknown time"}
                    </p>
                    {response.note && <p className="text-xs text-foreground mt-1 whitespace-pre-wrap">{String(response.note)}</p>}
                    {Array.isArray(response.uploaded_documents) && response.uploaded_documents.length > 0 && (
                      <div className="mt-1 space-y-1">
                        {(response.uploaded_documents as Array<Record<string, unknown>>).map((doc, docIndex) => (
                          <p key={`response-doc-${index}-${docIndex}`} className="text-[11px] text-muted-foreground break-all">
                            {String(doc.file_name || "Document")}
                          </p>
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

          <div className="rounded-lg border border-[hsl(var(--input-border))] p-3 space-y-2">
            <p className="text-xs text-muted-foreground">Documents on this application</p>
            {selectedApplication.documents.length === 0 ? (
              <p className="text-xs text-muted-foreground">No uploaded documents yet.</p>
            ) : (
              <div className="space-y-1">
                {selectedApplication.documents.map((doc) => (
                  <p key={doc.id} className="text-xs text-foreground break-all">
                    {doc.file_name} <span className="text-muted-foreground">({doc.file_type || "unknown"})</span>
                  </p>
                ))}
              </div>
            )}
          </div>

          {selectedApplication.status === "requires_action" && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-3">
              <p className="text-xs font-semibold text-primary">Action Required: Submit additional information</p>
              <textarea
                rows={4}
                value={responseNote}
                onChange={(event) => setResponseNote(event.target.value)}
                placeholder="Add your response for the BOCRA reviewer..."
                className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--input-border))] bg-[hsl(var(--input-bg))] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary resize-y"
              />
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Upload additional documents</label>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(event) => setAdditionalFiles(Array.from(event.target.files || []))}
                  className="block w-full text-xs text-foreground file:mr-3 file:px-3 file:py-1.5 file:rounded-md file:border-0 file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
                {additionalFiles.length > 0 && (
                  <div className="space-y-1">
                    {additionalFiles.map((file) => (
                      <p key={`${file.name}-${file.lastModified}`} className="text-xs text-muted-foreground break-all">{file.name}</p>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={submittingAdditional}
                  onClick={() => void submitAdditionalInfo()}
                  className="px-3 py-1.5 rounded-md text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                  {submittingAdditional ? "Submitting..." : "Submit Requested Info"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Applications;
