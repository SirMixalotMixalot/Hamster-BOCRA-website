import { useEffect, useState } from "react";
import { Search, Loader2, AlertCircle, CheckCircle2, Clock, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { trackComplaintByReference } from "@/lib/complaints";

type Status = "received" | "under-review" | "resolved" | "rejected";

type ComplaintResult = {
  reference: string;
  date: string;
  sector: string;
  company: string;
  status: Status;
  description: string;
  adminResponse: string | null;
};

const STATUS_STEPS: { key: Status; label: string }[] = [
  { key: "received", label: "Received" },
  { key: "under-review", label: "Under Review" },
  { key: "resolved", label: "Resolved" },
];

function getStatusIndex(status: Status): number {
  if (status === "rejected") return -1;
  return STATUS_STEPS.findIndex((s) => s.key === status);
}

function mapApiStatus(status: string): Status {
  if (status === "open") return "received";
  if (status === "investigating") return "under-review";
  if (status === "resolved") return "resolved";
  if (status === "closed") return "resolved";
  return "rejected";
}

function deriveSector(category: string | null): string {
  const text = (category || "").toLowerCase();
  if (text.includes("broadcast")) return "Broadcasting";
  if (text.includes("postal") || text.includes("courier")) return "Postal Services";
  if (text.includes("internet") || text.includes("isp") || text.includes("data")) return "Internet Service Providers (ISPs)";
  return "Telecommunications";
}

function deriveCompany(category: string | null, subject: string): string {
  const text = `${category || ""} ${subject}`.toUpperCase();
  if (text.includes("MASCOM")) return "Mascom";
  if (text.includes("ORANGE")) return "Orange";
  if (text.includes("BTC")) return "BTC";
  if (text.includes("BOFINET")) return "BOFINET";
  return "Not specified";
}

const TrackComplaintModal = () => {
  const [open, setOpen] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<ComplaintResult | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("toggle-track-complaint-modal", handler);
    return () => window.removeEventListener("toggle-track-complaint-modal", handler);
  }, []);

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (!val) {
      setTrackingNumber("");
      setResult(null);
      setNotFound(false);
      setSearching(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;
    setSearching(true);
    setNotFound(false);
    setResult(null);
    try {
      const reference = trackingNumber.trim().toUpperCase();
      const detail = await trackComplaintByReference(reference);
      setResult({
        reference: detail.reference_number || reference,
        date: detail.created_at,
        sector: deriveSector(detail.category),
        company: deriveCompany(detail.category, detail.subject),
        status: mapApiStatus(detail.status),
        description: detail.description,
        adminResponse: detail.admin_response,
      });
    } catch {
      setNotFound(true);
    } finally {
      setSearching(false);
    }
  };

  const inputClass =
    "w-full px-5 py-2.5 rounded-full border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary focus:shadow-[0_0_0_3px_hsl(210_85%_50%/0.1)] transition-all duration-200";

  const statusIdx = result ? getStatusIndex(result.status) : -1;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Track Your Complaint</DialogTitle>
          <DialogDescription>
            Enter your complaint reference number to check its current status.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSearch} className="mt-2">
          <div className="flex gap-2">
            <input
              type="text"
              required
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="e.g. BOCRA-CMP-2026-0001"
              className={inputClass}
            />
            <button
              type="submit"
              disabled={searching}
              className="shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {searching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Track
            </button>
          </div>
        </form>

        {/* Not found */}
        {notFound && (
          <div className="mt-6 flex flex-col items-center text-center space-y-2 py-4">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <p className="text-sm font-medium text-foreground">Complaint Not Found</p>
            <p className="text-xs text-muted-foreground max-w-xs">
              No complaint was found with that reference number. Please check the number and try again.
            </p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="mt-6 space-y-5">
            {/* Status progress */}
            <div className="flex items-center justify-between px-2">
              {result.status === "rejected" ? (
                <div className="w-full text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 text-destructive text-sm font-medium">
                    <AlertCircle className="h-4 w-4" />
                    Complaint Rejected
                  </div>
                </div>
              ) : (
                STATUS_STEPS.map((s, i) => (
                  <div key={s.key} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                          i <= statusIdx
                            ? "bg-bocra-teal text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {i <= statusIdx ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <Clock className="h-4 w-4" />
                        )}
                      </div>
                      <span className={`text-xs mt-1.5 font-medium ${i <= statusIdx ? "text-bocra-teal" : "text-muted-foreground"}`}>
                        {s.label}
                      </span>
                    </div>
                    {i < STATUS_STEPS.length - 1 && (
                      <div className={`h-0.5 w-full mx-1 rounded ${i < statusIdx ? "bg-bocra-teal" : "bg-muted"}`} />
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Details card */}
            <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <FileText className="h-4 w-4 text-primary" />
                {result.reference}
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground text-xs">Date Filed</span>
                  <p className="font-medium text-foreground">{new Date(result.date).toLocaleDateString("en-BW", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Sector</span>
                  <p className="font-medium text-foreground">{result.sector}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Company</span>
                  <p className="font-medium text-foreground">{result.company}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Status</span>
                  <p className={`font-medium ${result.status === "resolved" ? "text-bocra-teal" : result.status === "rejected" ? "text-destructive" : "text-bocra-gold"}`}>
                    {result.status === "under-review" ? "Under Review" : result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                  </p>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Description</span>
                <p className="text-sm text-foreground mt-0.5">{result.description}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">BOCRA Response</span>
                <p className="text-sm text-foreground mt-0.5 whitespace-pre-wrap">
                  {result.adminResponse?.trim() || "No response yet. Our team will update this once review is complete."}
                </p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TrackComplaintModal;
