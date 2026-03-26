import { useEffect, useState, useRef } from "react";
import { Send, ShieldCheck, CheckCircle2, Loader2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { createComplaint, sendComplaintVerificationCode, verifyComplaintVerificationCode } from "@/lib/complaints";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type Step = "form" | "verify" | "submitted";

const SECTOR_COMPANIES: Record<string, string[]> = {
  telecom: ["Mascom", "Orange", "BTC"],
  isp: ["BTC", "BOFINET", "Orange", "Mascom", "Broadband BBI", "Abari Comms", "Zebranet", "Concerotel"],
  broadcasting: ["MultiChoice (DStv)", "BTV Digital", "Kwese/Other"],
  postal: ["BotswanaPost", "DHL", "FedEx", "Sprint Couriers"],
};

const SECTOR_OPTIONS = [
  { key: "telecom", label: "Telecommunications" },
  { key: "isp", label: "Internet Service Providers (ISPs)" },
  { key: "broadcasting", label: "Broadcasting" },
  { key: "postal", label: "Postal Services" },
];

const ComplaintModal = () => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("form");
  const [sending, setSending] = useState(false);

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [sector, setSector] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");

  const [referenceNumber, setReferenceNumber] = useState("");
  const [copied, setCopied] = useState(false);

  // Verification
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("toggle-complaint-modal", handler);
    return () => window.removeEventListener("toggle-complaint-modal", handler);
  }, []);

  const resetForm = () => {
    setStep("form");
    setFirstName("");
    setLastName("");
    setEmail("");
    setSector("");
    setCompany("");
    setDescription("");
    setCode(["", "", "", "", "", ""]);
    setReferenceNumber("");
    setCopied(false);
    setSending(false);
  };

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (!val) resetForm();
  };

  const handleSectorChange = (value: string) => {
    setSector(value);
    setCompany("");
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Email is required", {
        description: "Enter your account email to receive a verification code.",
      });
      return;
    }

    setSending(true);
    try {
      const response = await sendComplaintVerificationCode(email.trim().toLowerCase());
      if (response.retry_after_seconds) {
        toast.info("Please wait before requesting another code", {
          description: `Try again in ${response.retry_after_seconds}s.`,
        });
        return;
      }

      toast.success("Verification code sent", {
        description: `A 6-digit code was sent to ${email.trim()}.`,
      });
      setStep("verify");
    } catch (error) {
      toast.error("Could not send verification code", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setSending(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...code];
    next[index] = value.slice(-1);
    setCode(next);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const joinedCode = code.join("");
    if (joinedCode.length < 6) return;

    setSending(true);
    try {
      await verifyComplaintVerificationCode(email.trim().toLowerCase(), joinedCode);

      const category = `${sector}:${company}`;
      const subject = `${company} complaint`;
      const created = await createComplaint({
        email: email.trim().toLowerCase(),
        subject,
        category,
        description,
      });

      setReferenceNumber(created.reference_number || "");
      setStep("submitted");
    } catch (error) {
      toast.error("Complaint submission failed", {
        description: error instanceof Error ? error.message : "Please sign in and try again.",
      });
    } finally {
      setSending(false);
    }
  };

  const inputClass =
    "w-full px-5 py-2.5 rounded-full border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary focus:shadow-[0_0_0_3px_hsl(210_85%_50%/0.1)] transition-all duration-200";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Step 1: Complaint Form */}
        {step === "form" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl">File a Complaint</DialogTitle>
              <DialogDescription>
                Report an issue with a service provider. A verification code will be sent to your email before submission.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSendCode} className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">First Name</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Kago"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Last Name</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Mosweu"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Sector</label>
                  <select
                    required
                    value={sector}
                    onChange={(e) => handleSectorChange(e.target.value)}
                    className={inputClass}
                  >
                    <option value="" disabled>Select sector</option>
                    {SECTOR_OPTIONS.map((s) => (
                      <option key={s.key} value={s.key}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Company</label>
                  <select
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className={inputClass}
                    disabled={!sector}
                  >
                    <option value="" disabled>{sector ? "Select company" : "Select sector first"}</option>
                    {sector && SECTOR_COMPANIES[sector]?.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Describe What Happened</label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain your complaint in detail — what happened, when it occurred..."
                  className={`${inputClass} resize-none !rounded-xl`}
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {sending ? "Sending Code..." : "Send Verification Code"}
              </button>
            </form>
          </>
        )}

        {/* Step 2: Enter Verification Code */}
        {step === "verify" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl">Enter Verification Code</DialogTitle>
              <DialogDescription>
                Enter the 6-digit verification code to submit your complaint.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleVerify} className="space-y-6 mt-4">
              <div className="flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-bocra-teal/10 flex items-center justify-center">
                  <ShieldCheck className="h-8 w-8 text-bocra-teal" />
                </div>
              </div>

              <div className="flex justify-center gap-2">
                {code.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(i, e.target.value)}
                    onKeyDown={(e) => handleCodeKeyDown(i, e)}
                    className="w-11 h-12 text-center text-lg font-bold rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary"
                  />
                ))}
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Didn't receive a code?{" "}
                <button
                  type="button"
                  onClick={async () => {
                    if (sending) return;
                    try {
                      setSending(true);
                      const response = await sendComplaintVerificationCode(email.trim().toLowerCase());
                      if (response.retry_after_seconds) {
                        toast.info("Please wait before requesting another code", {
                          description: `Try again in ${response.retry_after_seconds}s.`,
                        });
                      } else {
                        toast.success("Code re-sent", {
                          description: `A new verification code was sent to ${email.trim()}.`,
                        });
                      }
                    } catch (error) {
                      toast.error("Could not resend code", {
                        description: error instanceof Error ? error.message : "Please try again.",
                      });
                    } finally {
                      setSending(false);
                    }
                  }}
                  className="text-primary font-medium hover:underline"
                >
                  Resend
                </button>
              </p>

              <button
                type="submit"
                disabled={sending || code.join("").length < 6}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ShieldCheck className="h-4 w-4" />
                )}
                {sending ? "Verifying..." : "Verify & Submit Complaint"}
              </button>

              <button
                type="button"
                onClick={() => setStep("form")}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to form
              </button>
            </form>
          </>
        )}

        {/* Step 3: Submitted */}
        {step === "submitted" && (
          <div className="py-6 text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-bocra-teal/10 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-bocra-teal" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-heading font-bold text-foreground">Complaint Submitted</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
                Thank you, {firstName}. Your complaint has been received and will be reviewed by BOCRA.
              </p>
            </div>

            {/* Tracking number */}
            <div className="rounded-xl border border-border bg-muted/30 p-4 mx-auto max-w-xs space-y-2">
              <p className="text-xs text-muted-foreground">Your tracking number</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm font-bold text-foreground font-mono">{referenceNumber}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(referenceNumber);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="p-1.5 rounded-md hover:bg-muted transition-colors"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-bocra-teal" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Use this number to track your complaint status</p>
            </div>

            <button
              onClick={() => handleOpenChange(false)}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ComplaintModal;
