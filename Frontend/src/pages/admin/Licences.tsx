import { ShieldCheck, Search } from "lucide-react";
import { useMemo, useState } from "react";

type LicenceRecord = {
  id: string;
  name: string;
  licenceType: string;
  licenceNumber: string;
};

const MOCK_LICENCES: LicenceRecord[] = [
  {
    id: "lic-001",
    name: "Kagiso Molefe",
    licenceType: "Cellular Licence",
    licenceNumber: "BOCRA-LIC-2026-0001",
  },
  {
    id: "lic-002",
    name: "Naledi Keabetswe",
    licenceType: "Broadcasting Licence",
    licenceNumber: "BOCRA-LIC-2026-0002",
  },
  {
    id: "lic-003",
    name: "Pako Seretse",
    licenceType: "Radio Frequency Licence",
    licenceNumber: "BOCRA-LIC-2026-0003",
  },
  {
    id: "lic-004",
    name: "Goitseone Modise",
    licenceType: "Type Approval Licence",
    licenceNumber: "BOCRA-LIC-2026-0004",
  },
];

const Licences = () => {
  const [search, setSearch] = useState("");
  const filteredLicences = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return MOCK_LICENCES;
    }
    return MOCK_LICENCES.filter((licence) => licence.licenceNumber.toLowerCase().includes(q));
  }, [search]);

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="text-2xl font-heading font-bold text-foreground">Licences</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage issued licences across all sectors</p>
      </div>
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by licence number..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
      </div>

      {filteredLicences.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <ShieldCheck className="h-10 w-10 text-muted-foreground/30 mx-auto" />
          <p className="text-sm text-muted-foreground mt-3">No matching licences</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Try another licence number</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-4 py-3 font-semibold text-foreground">Name</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Licence Type</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Licence Number</th>
                </tr>
              </thead>
              <tbody>
                {filteredLicences.map((licence) => (
                  <tr key={licence.id} className="border-b border-border/70 last:border-0">
                    <td className="px-4 py-3 text-foreground">{licence.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{licence.licenceType}</td>
                    <td className="px-4 py-3 font-semibold text-foreground">{licence.licenceNumber}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Licences;
