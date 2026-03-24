import { useEffect, useState } from "react";
import { ShieldCheck, Search, Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type LicenceType = "ALL" | "Spectrum License" | "Dealer" | "Type Approval" | "System and Services";

type LicenceResult = {
  licenceNo: string;
  clientName: string;
  licenceType: string;
  issueDate: string;
  expirationDate: string;
  status: "Active" | "Expired" | "Suspended";
};

const MOCK_DATA: LicenceResult[] = [
  { licenceNo: "4646", clientName: "11 WARD SECURITY SERVICES", licenceType: "Spectrum License", issueDate: "Jul 01, 2019", expirationDate: "Jun 30, 2022", status: "Expired" },
  { licenceNo: "5012", clientName: "MASCOM WIRELESS (PTY) LTD", licenceType: "Spectrum License", issueDate: "Jan 01, 2024", expirationDate: "Dec 31, 2026", status: "Active" },
  { licenceNo: "3891", clientName: "ORANGE BOTSWANA (PTY) LTD", licenceType: "Spectrum License", issueDate: "Mar 16, 2022", expirationDate: "Mar 15, 2027", status: "Active" },
  { licenceNo: "4100", clientName: "BOTSWANA TELECOMMUNICATIONS", licenceType: "System and Services", issueDate: "Oct 01, 2020", expirationDate: "Sep 30, 2025", status: "Suspended" },
  { licenceNo: "6230", clientName: "KWENA COMMUNICATIONS", licenceType: "Dealer", issueDate: "Aug 13, 2023", expirationDate: "Aug 12, 2026", status: "Active" },
  { licenceNo: "5500", clientName: "SAMSUNG ELECTRONICS SA", licenceType: "Type Approval", issueDate: "Jan 21, 2022", expirationDate: "Jan 20, 2025", status: "Expired" },
];

const licenceTypes: LicenceType[] = ["ALL", "Spectrum License", "Dealer", "Type Approval", "System and Services"];

const statusColors: Record<string, string> = {
  Active: "bg-green-100 text-green-700",
  Expired: "bg-red-100 text-red-700",
  Suspended: "bg-yellow-100 text-yellow-700",
};

const statusIcons: Record<string, { icon: typeof CheckCircle2; color: string; bg: string; label: string }> = {
  Active: { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50", label: "Valid & Active" },
  Expired: { icon: XCircle, color: "text-red-600", bg: "bg-red-50", label: "Expired" },
  Suspended: { icon: AlertTriangle, color: "text-yellow-600", bg: "bg-yellow-50", label: "Suspended" },
};

const VerifyLicenceModal = () => {
  const [open, setOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [licenceNumber, setLicenceNumber] = useState("");
  const [licenceType, setLicenceType] = useState<LicenceType>("ALL");
  const [results, setResults] = useState<LicenceResult[] | null>(null);
  const [selected, setSelected] = useState<LicenceResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("toggle-verify-licence-modal", handler);
    return () => window.removeEventListener("toggle-verify-licence-modal", handler);
  }, []);

  const resetForm = () => {
    setCustomerName("");
    setLicenceNumber("");
    setLicenceType("ALL");
    setResults(null);
    setSelected(null);
    setLoading(false);
  };

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (!val) resetForm();
  };

  const handleSearch = () => {
    setLoading(true);
    setSelected(null);
    setTimeout(() => {
      const filtered = MOCK_DATA.filter((item) => {
        const matchesName = !customerName || item.clientName.toLowerCase().includes(customerName.toLowerCase());
        const matchesNumber = !licenceNumber || item.licenceNo.includes(licenceNumber);
        const matchesType = licenceType === "ALL" || item.licenceType === licenceType;
        return matchesName && matchesNumber && matchesType;
      });
      setResults(filtered);
      if (filtered.length === 1) setSelected(filtered[0]);
      setLoading(false);
    }, 600);
  };

  const statusInfo = selected ? statusIcons[selected.status] : null;
  const StatusIcon = statusInfo?.icon;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Verify Licence
          </DialogTitle>
          <DialogDescription>
            Check the validity of a BOCRA licence by searching below.
          </DialogDescription>
        </DialogHeader>

        {/* Search Filters */}
        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Search Customers</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Client name"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Licence Number</label>
              <input
                type="text"
                value={licenceNumber}
                onChange={(e) => setLicenceNumber(e.target.value)}
                placeholder="e.g. 4646"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Licence Type</label>
            <div className="flex flex-wrap gap-2">
              {licenceTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setLicenceType(type)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                    licenceType === type
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted text-foreground border border-border hover:bg-muted/80"
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
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Search
          </button>
        </div>

        {/* Results */}
        <div className="rounded-xl border border-border overflow-hidden">
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
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Licence No.</th>
                      <th className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Client Name</th>
                      <th className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3 hidden sm:table-cell">Licence Type</th>
                      <th className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3 hidden sm:table-cell">Expiration</th>
                      <th className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((row, i) => (
                      <tr
                        key={row.licenceNo}
                        onClick={() => setSelected(row)}
                        className={`border-b border-border last:border-0 cursor-pointer transition-colors ${
                          selected?.licenceNo === row.licenceNo
                            ? "bg-primary/10"
                            : i % 2 === 1
                            ? "bg-muted/30 hover:bg-muted/50"
                            : "hover:bg-muted/40"
                        }`}
                      >
                        <td className="px-4 py-3 text-foreground font-medium">{row.licenceNo}</td>
                        <td className="px-4 py-3 text-foreground">{row.clientName}</td>
                        <td className="px-4 py-3 text-foreground hidden sm:table-cell">{row.licenceType}</td>
                        <td className="px-4 py-3 text-foreground hidden sm:table-cell">{row.expirationDate}</td>
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
              <div className="px-4 py-2.5 border-t border-border text-xs text-muted-foreground">
                Total Records: {results.length}
              </div>
            </>
          )}
        </div>

        {/* Detail Verification Card */}
        {selected && statusInfo && StatusIcon && (
          <div className="rounded-xl border border-border p-5 space-y-4">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${statusInfo.bg}`}>
                <StatusIcon className={`h-8 w-8 ${statusInfo.color}`} />
              </div>
              <div>
                <p className={`text-lg font-bold ${statusInfo.color}`}>{statusInfo.label}</p>
                <p className="text-sm text-muted-foreground">Licence #{selected.licenceNo}</p>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Licence Holder</p>
              <p className="text-lg font-semibold text-foreground">{selected.clientName}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Licence Number</p>
                <p className="text-sm font-semibold text-foreground">{selected.licenceNo}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Licence Type</p>
                <p className="text-sm font-semibold text-foreground">{selected.licenceType}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Issue Date</p>
                <p className="text-sm font-semibold text-foreground">{selected.issueDate}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Expiration Date</p>
                <p className="text-sm font-semibold text-foreground">{selected.expirationDate}</p>
              </div>
            </div>

            <div className="border-t border-border pt-4 flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Status</span>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusColors[selected.status]}`}>
                {selected.status}
              </span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VerifyLicenceModal;
