import { useState } from "react";
import { ShieldCheck, Search } from "lucide-react";

const VerifyLicence = () => {
  const [licenceNumber, setLicenceNumber] = useState("");

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-heading font-bold text-foreground">Verify Licence</h2>
        <p className="text-sm text-muted-foreground mt-1">Check the validity of a BOCRA licence</p>
      </div>
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={licenceNumber}
            onChange={(e) => setLicenceNumber(e.target.value)}
            placeholder="Enter licence number (e.g. BOCRA-2026-0001)"
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        <button className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <ShieldCheck className="h-4 w-4" />
          Verify
        </button>
      </div>
      <div className="bg-card rounded-xl border border-border p-8 text-center">
        <ShieldCheck className="h-10 w-10 text-muted-foreground/30 mx-auto" />
        <p className="text-sm text-muted-foreground mt-3">Enter a licence number above to check its status</p>
      </div>
    </div>
  );
};

export default VerifyLicence;
