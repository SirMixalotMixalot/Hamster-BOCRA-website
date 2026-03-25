import { useState } from "react";
import { FileText, Plus, Clock, CheckCircle, XCircle, AlertCircle, Eye, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

type AppStatus = "all" | "draft" | "submitted" | "under_review" | "approved" | "rejected";

interface MockApplication {
  id: string;
  reference_number: string;
  licence_type: string;
  status: "draft" | "submitted" | "under_review" | "approved" | "rejected" | "requires_action";
  created_at: string;
  submitted_at: string | null;
}

const MOCK_APPLICATIONS: MockApplication[] = [
  {
    id: "1",
    reference_number: "BOCRA-2026-0001",
    licence_type: "Radio Frequency Licence",
    status: "approved",
    created_at: "2026-02-15",
    submitted_at: "2026-02-16",
  },
  {
    id: "2",
    reference_number: "BOCRA-2026-0002",
    licence_type: "Broadcasting Licence",
    status: "under_review",
    created_at: "2026-03-01",
    submitted_at: "2026-03-02",
  },
  {
    id: "3",
    reference_number: "BOCRA-2026-0003",
    licence_type: "Point-to-Point Licence",
    status: "submitted",
    created_at: "2026-03-10",
    submitted_at: "2026-03-10",
  },
  {
    id: "4",
    reference_number: "BOCRA-2026-0004",
    licence_type: "Cellular Licence",
    status: "draft",
    created_at: "2026-03-20",
    submitted_at: null,
  },
  {
    id: "5",
    reference_number: "BOCRA-2026-0005",
    licence_type: "Type Approval Licence",
    status: "rejected",
    created_at: "2026-01-05",
    submitted_at: "2026-01-06",
  },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  draft: { label: "Draft", color: "text-gray-600", bg: "bg-gray-100", icon: FileText },
  submitted: { label: "Submitted", color: "text-blue-600", bg: "bg-blue-50", icon: Clock },
  under_review: { label: "Under Review", color: "text-amber-600", bg: "bg-amber-50", icon: Eye },
  approved: { label: "Approved", color: "text-green-600", bg: "bg-green-50", icon: CheckCircle },
  rejected: { label: "Rejected", color: "text-red-600", bg: "bg-red-50", icon: XCircle },
  requires_action: { label: "Action Required", color: "text-orange-600", bg: "bg-orange-50", icon: AlertCircle },
};

const FILTER_TABS: { value: AppStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "draft", label: "Drafts" },
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under Review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const Applications = () => {
  const [filter, setFilter] = useState<AppStatus>("all");
  const navigate = useNavigate();

  const filtered = filter === "all"
    ? MOCK_APPLICATIONS
    : MOCK_APPLICATIONS.filter((a) => a.status === filter);

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading font-bold text-foreground">My Applications</h2>
          <p className="text-sm text-muted-foreground mt-1">Track your licence applications</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/customer/licences")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-[hsl(var(--input-bg))] text-foreground border border-[hsl(var(--input-border))] hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-all"
          >
            <Award className="h-4 w-4" />
            View Licences
          </button>
          <button
            onClick={() => navigate("/customer/applications/new")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-[hsl(210_85%_35%)] text-primary-foreground rounded-full text-sm font-medium shadow-glow-primary hover:opacity-90 transition-all"
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

      {/* Applications Table */}
      {filtered.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center">
          <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto" />
          <p className="text-sm text-muted-foreground mt-3">No applications found</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            {filter === "all" ? "Start a new licence application to get started" : `No ${filter.replace("_", " ")} applications`}
          </p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
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
                  return (
                    <tr
                      key={app.id}
                      className="border-b border-white/30 last:border-0 hover:bg-primary/5 transition-colors cursor-pointer"
                      onClick={() => {
                        if (app.status === "draft") navigate("/customer/applications/new");
                      }}
                    >
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-semibold text-foreground">{app.reference_number}</span>
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
                        <span className="text-sm text-muted-foreground">{app.created_at}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-muted-foreground">{app.submitted_at || "—"}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Applications;
