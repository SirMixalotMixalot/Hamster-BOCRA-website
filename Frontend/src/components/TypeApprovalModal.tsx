import { useEffect, useState } from "react";
import {
  Shield, Smartphone, Radio, Tv, Wifi, Cpu, Search, Loader2,
  CheckCircle2, XCircle, ClipboardList, CreditCard, FlaskConical,
  Award, ArrowLeft, Satellite,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type Step = "categories" | "workflow" | "lookup";

type Category = {
  id: string;
  label: string;
  icon: typeof Smartphone;
  description: string;
};

const equipmentCategories: Category[] = [
  { id: "phones", label: "Mobile Phones & Tablets", icon: Smartphone, description: "Cellular devices and tablets" },
  { id: "radio", label: "Radio Equipment", icon: Radio, description: "Two-way radios and transceivers" },
  { id: "broadcast", label: "Broadcasting Equipment", icon: Tv, description: "TV and radio broadcast gear" },
  { id: "satellite", label: "Satellite Equipment", icon: Satellite, description: "VSAT and satellite terminals" },
  { id: "networking", label: "Networking Equipment", icon: Wifi, description: "Routers, modems, switches" },
  { id: "iot", label: "IoT Devices", icon: Cpu, description: "Connected sensors and modules" },
  { id: "ptp", label: "Point-to-Point / Multipoint", icon: Radio, description: "Microwave and wireless links" },
];

const workflowSteps = [
  { step: 1, title: "Submit Application", description: "Complete the application form with detailed equipment specifications, test reports from accredited labs, and manufacturer documentation.", icon: ClipboardList },
  { step: 2, title: "Pay Prescribed Fee", description: "Pay the type approval fee as set out in the BOCRA fee schedule. Fees vary by equipment category and complexity.", icon: CreditCard },
  { step: 3, title: "Equipment Testing & Evaluation", description: "BOCRA evaluates the equipment against relevant ITU, ETSI, and national standards. Additional lab testing may be requested.", icon: FlaskConical },
  { step: 4, title: "Approval / Rejection Decision", description: "BOCRA issues a formal decision. Approved equipment is added to the national Type Approval register.", icon: CheckCircle2 },
  { step: 5, title: "Certificate Issuance", description: "A Type Approval Certificate is issued, valid for the specified period. Equipment can then be legally imported, sold, and operated in Botswana.", icon: Award },
];

type ApprovalResult = {
  certNo: string;
  equipment: string;
  manufacturer: string;
  category: string;
  status: "Approved" | "Expired";
  issueDate: string;
  expiryDate: string;
};

const MOCK_APPROVALS: ApprovalResult[] = [
  { certNo: "TA-2024-001", equipment: "Samsung Galaxy S24", manufacturer: "Samsung Electronics", category: "phones", status: "Approved", issueDate: "Feb 15, 2024", expiryDate: "Feb 14, 2027" },
  { certNo: "TA-2023-089", equipment: "Huawei 4G Router B535", manufacturer: "Huawei Technologies", category: "networking", status: "Approved", issueDate: "Oct 01, 2023", expiryDate: "Sep 30, 2026" },
  { certNo: "TA-2022-045", equipment: "Motorola DP4800e", manufacturer: "Motorola Solutions", category: "radio", status: "Expired", issueDate: "Mar 20, 2022", expiryDate: "Mar 19, 2025" },
  { certNo: "TA-2024-112", equipment: "iPhone 15 Pro", manufacturer: "Apple Inc.", category: "phones", status: "Approved", issueDate: "Nov 10, 2024", expiryDate: "Nov 09, 2027" },
  { certNo: "TA-2024-078", equipment: "TP-Link Archer AX73", manufacturer: "TP-Link Technologies", category: "networking", status: "Approved", issueDate: "Jun 05, 2024", expiryDate: "Jun 04, 2027" },
  { certNo: "TA-2023-156", equipment: "Hytera PD785G", manufacturer: "Hytera Communications", category: "radio", status: "Approved", issueDate: "Dec 12, 2023", expiryDate: "Dec 11, 2026" },
];

const statusColors: Record<string, string> = {
  Approved: "bg-green-100 text-green-700",
  Expired: "bg-red-100 text-red-700",
};

const TypeApprovalModal = () => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("categories");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Lookup state
  const [equipmentSearch, setEquipmentSearch] = useState("");
  const [manufacturerSearch, setManufacturerSearch] = useState("");
  const [lookupResults, setLookupResults] = useState<ApprovalResult[] | null>(null);
  const [selectedApproval, setSelectedApproval] = useState<ApprovalResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("toggle-type-approval-modal", handler);
    return () => window.removeEventListener("toggle-type-approval-modal", handler);
  }, []);

  const resetAll = () => {
    setStep("categories");
    setSelectedCategory(null);
    setEquipmentSearch("");
    setManufacturerSearch("");
    setLookupResults(null);
    setSelectedApproval(null);
    setLoading(false);
  };

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (!val) resetAll();
  };

  const handleLookup = () => {
    setLoading(true);
    setSelectedApproval(null);
    setTimeout(() => {
      const filtered = MOCK_APPROVALS.filter((item) => {
        const matchesEquipment = !equipmentSearch || item.equipment.toLowerCase().includes(equipmentSearch.toLowerCase());
        const matchesMfr = !manufacturerSearch || item.manufacturer.toLowerCase().includes(manufacturerSearch.toLowerCase());
        return matchesEquipment && matchesMfr;
      });
      setLookupResults(filtered);
      if (filtered.length === 1) setSelectedApproval(filtered[0]);
      setLoading(false);
    }, 600);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Categories View */}
        {step === "categories" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Equipment Type Approval
              </DialogTitle>
              <DialogDescription>
                Select an equipment category to view the approval process, or look up an existing approval.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
              {equipmentCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat); setStep("workflow"); }}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-muted/30 hover:bg-primary/5 hover:border-primary/30 transition-all group text-center"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                    <cat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{cat.label}</p>
                    <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{cat.description}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <button
                onClick={() => setStep("lookup")}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                <Search className="h-4 w-4" />
                Look Up Existing Approvals
              </button>
            </div>
          </>
        )}

        {/* Workflow View */}
        {step === "workflow" && selectedCategory && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <selectedCategory.icon className="h-5 w-5 text-primary" />
                {selectedCategory.label}
              </DialogTitle>
              <DialogDescription>
                Approval process for {selectedCategory.description.toLowerCase()}.
              </DialogDescription>
            </DialogHeader>

            <button
              onClick={() => setStep("categories")}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to categories
            </button>

            {/* Timeline */}
            <div className="space-y-0 mt-2">
              {workflowSteps.map((ws, i) => (
                <div key={ws.step} className="flex gap-4">
                  {/* Connector line + circle */}
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border-2 border-primary/30">
                      <ws.icon className="h-4 w-4 text-primary" />
                    </div>
                    {i < workflowSteps.length - 1 && (
                      <div className="w-0.5 flex-1 bg-primary/20 my-1" />
                    )}
                  </div>
                  {/* Content */}
                  <div className="pb-6">
                    <p className="text-sm font-semibold text-foreground">
                      Step {ws.step}: {ws.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{ws.description}</p>
                  </div>
                </div>
              ))}
            </div>

          </>
        )}

        {/* Lookup View */}
        {step === "lookup" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                Look Up Type Approvals
              </DialogTitle>
              <DialogDescription>
                Search for equipment that has been type-approved by BOCRA.
              </DialogDescription>
            </DialogHeader>

            <button
              onClick={() => { setStep("categories"); setLookupResults(null); setSelectedApproval(null); }}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to categories
            </button>

            {/* Search Form */}
            <div className="space-y-3 mt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Equipment Name / Model</label>
                  <input
                    type="text"
                    value={equipmentSearch}
                    onChange={(e) => setEquipmentSearch(e.target.value)}
                    placeholder="e.g. Galaxy S24"
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Manufacturer</label>
                  <input
                    type="text"
                    value={manufacturerSearch}
                    onChange={(e) => setManufacturerSearch(e.target.value)}
                    placeholder="e.g. Samsung"
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
              </div>
              <button
                onClick={handleLookup}
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Search
              </button>
            </div>

            {/* Results */}
            <div className="rounded-xl border border-border overflow-hidden">
              {lookupResults === null ? (
                <div className="p-8 text-center">
                  <Shield className="h-10 w-10 text-muted-foreground/30 mx-auto" />
                  <p className="text-sm text-muted-foreground mt-3">Enter search criteria to find type approvals</p>
                </div>
              ) : lookupResults.length === 0 ? (
                <div className="p-8 text-center">
                  <Search className="h-10 w-10 text-muted-foreground/30 mx-auto" />
                  <p className="text-sm text-muted-foreground mt-3">No approvals found matching your criteria</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/50">
                          <th className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Cert No.</th>
                          <th className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Equipment</th>
                          <th className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3 hidden sm:table-cell">Manufacturer</th>
                          <th className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lookupResults.map((row, i) => (
                          <tr
                            key={row.certNo}
                            onClick={() => setSelectedApproval(row)}
                            className={`border-b border-border last:border-0 cursor-pointer transition-colors ${
                              selectedApproval?.certNo === row.certNo
                                ? "bg-primary/10"
                                : i % 2 === 1
                                ? "bg-muted/30 hover:bg-muted/50"
                                : "hover:bg-muted/40"
                            }`}
                          >
                            <td className="px-4 py-3 text-foreground font-medium">{row.certNo}</td>
                            <td className="px-4 py-3 text-foreground">{row.equipment}</td>
                            <td className="px-4 py-3 text-foreground hidden sm:table-cell">{row.manufacturer}</td>
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
                    Total Records: {lookupResults.length}
                  </div>
                </>
              )}
            </div>

            {/* Detail Card */}
            {selectedApproval && (
              <div className="rounded-xl border border-border p-5 space-y-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${selectedApproval.status === "Approved" ? "bg-green-50" : "bg-red-50"}`}>
                    {selectedApproval.status === "Approved" ? (
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                    ) : (
                      <XCircle className="h-8 w-8 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className={`text-lg font-bold ${selectedApproval.status === "Approved" ? "text-green-600" : "text-red-600"}`}>
                      {selectedApproval.status === "Approved" ? "Type Approved" : "Expired"}
                    </p>
                    <p className="text-sm text-muted-foreground">{selectedApproval.certNo}</p>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Equipment</p>
                  <p className="text-lg font-semibold text-foreground">{selectedApproval.equipment}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Manufacturer</p>
                    <p className="text-sm font-semibold text-foreground">{selectedApproval.manufacturer}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Certificate No.</p>
                    <p className="text-sm font-semibold text-foreground">{selectedApproval.certNo}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Issue Date</p>
                    <p className="text-sm font-semibold text-foreground">{selectedApproval.issueDate}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Expiry Date</p>
                    <p className="text-sm font-semibold text-foreground">{selectedApproval.expiryDate}</p>
                  </div>
                </div>

                <div className="border-t border-border pt-4 flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">Status</span>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusColors[selectedApproval.status]}`}>
                    {selectedApproval.status}
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TypeApprovalModal;
