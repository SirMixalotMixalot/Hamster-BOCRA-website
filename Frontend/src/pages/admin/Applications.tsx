import { AlertTriangle, Eye, FileText, Loader2, Search } from "lucide-react";
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
import { BOCRA_LICENCE_TYPES, type BocraLicenceType } from "@/lib/constants";
import { LoadingDots } from "@/components/ui/loading-dots";
import { getEditableSteps, type StepConfig, type StepProps } from "@/lib/applicationStepConfig";
import ApplicantParticularsStep from "@/components/applications/steps/ApplicantParticularsStep";
import RadioStationDetailsStep from "@/components/applications/steps/RadioStationDetailsStep";
import RadioEquipmentAntennaStep from "@/components/applications/steps/RadioEquipmentAntennaStep";
import NetworkSiteDetailsStep from "@/components/applications/steps/NetworkSiteDetailsStep";
import NetworkEquipmentStep from "@/components/applications/steps/NetworkEquipmentStep";
import BroadcastStationStep from "@/components/applications/steps/BroadcastStationStep";
import BroadcastEquipmentStep from "@/components/applications/steps/BroadcastEquipmentStep";
import SatelliteSiteStep from "@/components/applications/steps/SatelliteSiteStep";
import SatelliteEquipmentStep from "@/components/applications/steps/SatelliteEquipmentStep";
import FrequencyTechnicalStep from "@/components/applications/steps/FrequencyTechnicalStep";
import TypeApprovalApplicantStep from "@/components/applications/steps/TypeApprovalApplicantStep";
import TypeApprovalDetailsStep from "@/components/applications/steps/TypeApprovalDetailsStep";
import TypeApprovalEquipmentStep from "@/components/applications/steps/TypeApprovalEquipmentStep";
import GenericBusinessStep from "@/components/applications/steps/GenericBusinessStep";
import DocumentsSignatureStep from "@/components/applications/steps/DocumentsSignatureStep";

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

const STEP_COMPONENTS: Record<string, React.ComponentType<StepProps>> = {
  ApplicantParticularsStep,
  RadioStationDetailsStep,
  RadioEquipmentAntennaStep,
  NetworkSiteDetailsStep,
  NetworkEquipmentStep,
  BroadcastStationStep,
  BroadcastEquipmentStep,
  SatelliteSiteStep,
  SatelliteEquipmentStep,
  FrequencyTechnicalStep,
  TypeApprovalApplicantStep,
  TypeApprovalDetailsStep,
  TypeApprovalEquipmentStep,
  GenericBusinessStep,
  DocumentsSignatureStep,
};

const getStepData = (application: ApplicationDetail, key: StepConfig["formDataKey"]) => {
  if (key === "a") return (application.form_data_a as Record<string, unknown>) || {};
  if (key === "b") return (application.form_data_b as Record<string, unknown>) || {};
  if (key === "c") return (application.form_data_c as Record<string, unknown>) || {};
  if (key === "d") return (application.form_data_d as Record<string, unknown>) || {};
  return {};
};

const canRenderLicenceType = (licenceType: string): licenceType is BocraLicenceType =>
  BOCRA_LICENCE_TYPES.includes(licenceType as BocraLicenceType);

function ApplicationReviewSections({ application }: { application: ApplicationDetail }) {
  if (!canRenderLicenceType(application.licence_type)) {
    return (
      <div className="rounded-lg border border-border p-3">
        <p className="text-xs text-muted-foreground">This licence type does not have a structured admin review layout yet.</p>
      </div>
    );
  }

  const steps = getEditableSteps(application.licence_type).filter((step) => step.id !== "review");

  return (
    <div className="space-y-4">
      {steps.map((step, index) => {
        const StepComponent = STEP_COMPONENTS[step.componentName];
        if (!StepComponent) {
          return null;
        }

        return (
          <div key={`${step.id}-${index}`} className="rounded-xl border border-border/80 bg-background/40 p-1">
            <StepComponent
              data={getStepData(application, step.formDataKey)}
              onChange={() => {}}
              licenceType={application.licence_type}
              errors={{}}
              readOnly
            />
          </div>
        );
      })}
    </div>
  );
}

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

  const hasSignature = Boolean(
    (selectedApplication?.form_data_d as Record<string, unknown> | null)?.signature,
  );

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
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold text-foreground">
                Reviewing {selectedApplication.reference_number}
              </h3>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
                <Eye className="h-3.5 w-3.5" />
                Read Only
              </div>
            </div>
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

          {!hasSignature && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-700 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-amber-900">Signature missing</p>
                  <p className="text-xs text-amber-800 mt-1">
                    No customer signature was found in the submitted application data.
                  </p>
                </div>
              </div>
            </div>
          )}

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

          <div className="rounded-lg border border-border p-3 space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Application Details</p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Review the application in the same section order used by the customer form.
              </p>
            </div>
            <ApplicationReviewSections application={selectedApplication} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApplications;
