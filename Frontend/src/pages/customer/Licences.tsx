import { Award, Download, Calendar, ShieldCheck } from "lucide-react";

type LicenceStatus = "Active" | "Expired";

interface Licence {
  id: string;
  number: string;
  type: string;
  issuedDate: string;
  expiryDate: string;
  status: LicenceStatus;
}

const MOCK_LICENCES: Licence[] = [
  {
    id: "1",
    number: "LIC-TEL-2026-0001",
    type: "Radio Frequency Licence",
    issuedDate: "2026-02-20",
    expiryDate: "2027-02-20",
    status: "Active",
  },
  {
    id: "2",
    number: "LIC-BRD-2025-0042",
    type: "Broadcasting Licence",
    issuedDate: "2025-06-15",
    expiryDate: "2026-06-15",
    status: "Active",
  },
  {
    id: "3",
    number: "LIC-ISP-2024-0018",
    type: "ISP Licence",
    issuedDate: "2024-01-10",
    expiryDate: "2025-01-10",
    status: "Expired",
  },
];

const STATUS_STYLES: Record<LicenceStatus, string> = {
  Active: "bg-green-50 text-green-600",
  Expired: "bg-red-50 text-red-600",
};

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-BW", { day: "numeric", month: "short", year: "numeric" });

const handleDownload = (licence: Licence) => {
  // TODO: replace with real PDF download from backend
  const content = `
BOCRA - LICENCE CERTIFICATE
============================

Licence Number: ${licence.number}
Licence Type:   ${licence.type}
Status:         ${licence.status}
Date Issued:    ${formatDate(licence.issuedDate)}
Expiry Date:    ${formatDate(licence.expiryDate)}

This certificate confirms that the holder is duly licensed
by the Botswana Communications Regulatory Authority (BOCRA).
  `.trim();

  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${licence.number}-certificate.txt`;
  a.click();
  URL.revokeObjectURL(url);
};

const Licences = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-heading font-bold text-foreground">My Licences</h2>
        <p className="text-sm text-muted-foreground mt-1">View and download your approved licences</p>
      </div>

      {MOCK_LICENCES.length > 0 ? (
        <div className="space-y-4">
          {MOCK_LICENCES.map((licence) => (
            <div key={licence.id} className="glass rounded-2xl p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold font-mono text-foreground">{licence.number}</p>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[licence.status]}`}>
                        {licence.status}
                      </span>
                    </div>
                    <p className="text-sm text-foreground mt-0.5">{licence.type}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Issued: {formatDate(licence.issuedDate)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Expires: {formatDate(licence.expiryDate)}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(licence)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-[hsl(var(--input-bg))] text-foreground border border-[hsl(var(--input-border))] hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-all shrink-0"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass rounded-2xl p-8 text-center">
          <Award className="h-10 w-10 text-muted-foreground/30 mx-auto" />
          <p className="text-sm text-muted-foreground mt-3">No licences yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Your approved licences will appear here</p>
        </div>
      )}
    </div>
  );
};

export default Licences;
