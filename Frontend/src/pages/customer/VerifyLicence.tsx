import { useState } from "react";
import { ShieldCheck, Search, Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { verifyLicence, type LicenceVerificationItem, type LicenceVerificationStatus } from "@/lib/applications";

type LicenceType = "ALL" | "Spectrum License" | "Dealer" | "Type Approval" | "System and Services";

const licenceTypes: LicenceType[] = ["ALL", "Spectrum License", "Dealer", "Type Approval", "System and Services"];

const statusColors: Record<string, string> = {
  Active: "bg-green-100 text-green-700",
  Expired: "bg-red-100 text-red-700",
  Suspended: "bg-yellow-100 text-yellow-700",
};

const statusIcons: Record<LicenceVerificationStatus, { icon: typeof CheckCircle2; color: string; bg: string; label: string }> = {
  Active: { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50", label: "Valid & Active" },
  Expired: { icon: XCircle, color: "text-red-600", bg: "bg-red-50", label: "Expired" },
  Suspended: { icon: AlertTriangle, color: "text-yellow-600", bg: "bg-yellow-50", label: "Suspended" },
};

function formatDate(dateString: string | Date): string {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

const VerifyLicence = () => {
  const [customerName, setCustomerName] = useState("");
  const [licenceNumber, setLicenceNumber] = useState("");
  const [licenceType, setLicenceType] = useState<LicenceType>("ALL");
  const [results, setResults] = useState<LicenceVerificationItem[] | null>(null);
  const [selected, setSelected] = useState<LicenceVerificationItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    setLoading(true);
    setSelected(null);
    setError(null);
    try {
      const response = await verifyLicence({
        customer_name: customerName || undefined,
        licence_number: licenceNumber || undefined,
        licence_type: licenceType !== "ALL" ? licenceType : undefined,
      });
      setResults(response.items);
      if (response.items.length === 1) {
        setSelected(response.items[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search licences");
    } finally {
      setLoading(false);
    }
  };

  const statusInfo = selected ? statusIcons[selected.status] : null;
  const StatusIcon = statusInfo?.icon;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-primary/10">
          <ShieldCheck className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-heading font-bold text-foreground">Verify Licence</h2>
          <p className="text-sm text-muted-foreground">Check the validity of a BOCRA licence</p>
        </div>
      </div>

      {/* Search Filters Card */}
      <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-white/60 shadow-lg p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Search Customers</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Client name"
                className="w-full pl-11 pr-4 py-2.5 rounded-full border border-white/80 bg-white/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Licence Number</label>
            <input
              type="text"
              value={licenceNumber}
              onChange={(e) => setLicenceNumber(e.target.value)}
              placeholder="e.g. 4646"
              className="w-full px-5 py-2.5 rounded-full border border-white/80 bg-white/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Licence Type</label>
          <div className="flex flex-wrap gap-2">
            {licenceTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setLicenceType(type)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                  licenceType === type
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-[hsl(var(--input-bg))] text-foreground border border-[hsl(var(--input-border))] hover:bg-primary/5 hover:border-primary/30 hover:text-primary"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSearch}
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60 shadow-md"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          Search
        </button>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
            {error}
          </div>
        )}
      </div>

      {/* Results Card */}
      <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-white/60 shadow-lg">
        {results === null ? (
          <div className="p-8 text-center">
            <ShieldCheck className="h-10 w-10 text-muted-foreground/30 mx-auto" />
            <p className="text-sm text-muted-foreground mt-3">Enter search criteria above to find licences</p>
          </div>
        ) : results.length === 0 ? (
          <div className="p-8 text-center">
            <Search className="h-10 w-10 text-muted-foreground/30 mx-auto" />
            <p className="text-sm text-muted-foreground mt-3">No licences found matching your criteria</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/40">
                    <th className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Licence No.</th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Client Name</th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Licence Type</th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Expiration Date</th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((row, i) => (
                    <tr
                      key={row.licence_number}
                      onClick={() => setSelected(row)}
                      className={`border-b border-white/30 last:border-0 cursor-pointer transition-colors ${
                        selected?.licence_number === row.licence_number
                          ? "bg-primary/10"
                          : i % 2 === 1
                          ? "bg-white/30 hover:bg-white/50"
                          : "hover:bg-white/40"
                      }`}
                    >
                      <td className="px-4 py-3 text-foreground font-medium">{row.licence_number}</td>
                      <td className="px-4 py-3 text-foreground">{row.customer_name}</td>
                      <td className="px-4 py-3 text-foreground">{row.licence_type}</td>
                      <td className="px-4 py-3 text-foreground">{formatDate(row.expiration_date)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[row.status]}`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-white/40 text-sm text-muted-foreground">
              Total Records: {results.length}
            </div>
          </>
        )}
      </div>

      {/* Detail Verification Card */}
      {selected && statusInfo && StatusIcon && (
        <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-white/60 shadow-lg p-6 space-y-5">
          {/* Status Header */}
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${statusInfo.bg}`}>
              <StatusIcon className={`h-8 w-8 ${statusInfo.color}`} />
            </div>
            <div>
              <p className={`text-lg font-bold ${statusInfo.color}`}>{statusInfo.label}</p>
              <p className="text-sm text-muted-foreground">Licence #{selected.licence_number}</p>
            </div>
          </div>

          {/* Licence Holder */}
          <div className="border-t border-white/40 pt-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Licence Holder</p>
            <p className="text-lg font-semibold text-foreground">{selected.customer_name}</p>
          </div>

          {/* Detail Grid */}
          <div className="grid grid-cols-2 gap-4 border-t border-white/40 pt-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Licence Number</p>
              <p className="text-sm font-semibold text-foreground">{selected.licence_number}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Licence Type</p>
              <p className="text-sm font-semibold text-foreground">{selected.licence_type}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Issue Date</p>
              <p className="text-sm font-semibold text-foreground">{formatDate(selected.issue_date)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Expiration Date</p>
              <p className="text-sm font-semibold text-foreground">{formatDate(selected.expiration_date)}</p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="border-t border-white/40 pt-4 flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Status</span>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusColors[selected.status]}`}>
              {selected.status}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifyLicence;
