import { useState } from "react";
import { ShieldCheck, Search, Loader2 } from "lucide-react";

type LicenceType = "ALL" | "Spectrum License" | "Dealer" | "Type Approval" | "System and Services";

type LicenceResult = {
  licenceNo: string;
  clientName: string;
  licenceType: string;
  expirationDate: string;
  status: "Active" | "Expired" | "Suspended";
};

const MOCK_DATA: LicenceResult[] = [
  { licenceNo: "4646", clientName: "11 WARD SECURITY SERVICES", licenceType: "Spectrum License", expirationDate: "Jun 30, 2022", status: "Expired" },
  { licenceNo: "5012", clientName: "MASCOM WIRELESS (PTY) LTD", licenceType: "Spectrum License", expirationDate: "Dec 31, 2026", status: "Active" },
  { licenceNo: "3891", clientName: "ORANGE BOTSWANA (PTY) LTD", licenceType: "Spectrum License", expirationDate: "Mar 15, 2027", status: "Active" },
  { licenceNo: "4100", clientName: "BOTSWANA TELECOMMUNICATIONS", licenceType: "System and Services", expirationDate: "Sep 30, 2025", status: "Suspended" },
  { licenceNo: "6230", clientName: "KWENA COMMUNICATIONS", licenceType: "Dealer", expirationDate: "Aug 12, 2026", status: "Active" },
  { licenceNo: "5500", clientName: "SAMSUNG ELECTRONICS SA", licenceType: "Type Approval", expirationDate: "Jan 20, 2025", status: "Expired" },
];

const licenceTypes: LicenceType[] = ["ALL", "Spectrum License", "Dealer", "Type Approval", "System and Services"];

const statusColors: Record<string, string> = {
  Active: "bg-green-100 text-green-700",
  Expired: "bg-red-100 text-red-700",
  Suspended: "bg-yellow-100 text-yellow-700",
};

const VerifyLicence = () => {
  const [customerName, setCustomerName] = useState("");
  const [licenceNumber, setLicenceNumber] = useState("");
  const [licenceType, setLicenceType] = useState<LicenceType>("ALL");
  const [results, setResults] = useState<LicenceResult[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = () => {
    setLoading(true);
    setTimeout(() => {
      const filtered = MOCK_DATA.filter((item) => {
        const matchesName = !customerName || item.clientName.toLowerCase().includes(customerName.toLowerCase());
        const matchesNumber = !licenceNumber || item.licenceNo.includes(licenceNumber);
        const matchesType = licenceType === "ALL" || item.licenceType === licenceType;
        return matchesName && matchesNumber && matchesType;
      });
      setResults(filtered);
      setLoading(false);
    }, 600);
  };

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
                    : "bg-white/50 text-foreground border border-white/80 hover:bg-white/70"
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
                      key={row.licenceNo}
                      className={`border-b border-white/30 last:border-0 ${i % 2 === 1 ? "bg-white/30" : ""}`}
                    >
                      <td className="px-4 py-3 text-foreground font-medium">{row.licenceNo}</td>
                      <td className="px-4 py-3 text-foreground">{row.clientName}</td>
                      <td className="px-4 py-3 text-foreground">{row.licenceType}</td>
                      <td className="px-4 py-3 text-foreground">{row.expirationDate}</td>
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
    </div>
  );
};

export default VerifyLicence;
