import { useEffect, useState, useRef } from "react";
import { Send, ShieldCheck, CheckCircle2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type Step = "form" | "verify" | "submitted";

const ComplaintModal = () => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("form");
  const [sending, setSending] = useState(false);

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [description, setDescription] = useState("");
  const [verifyMethod, setVerifyMethod] = useState<"email" | "phone">("email");

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
    setPhone("");
    setAge("");
    setGender("");
    setDescription("");
    setCode(["", "", "", "", "", ""]);
    setSending(false);
  };

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (!val) resetForm();
  };

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    // TODO: integrate with backend to send actual verification code
    setTimeout(() => {
      setSending(false);
      setStep("verify");
    }, 1200);
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

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.join("").length < 6) return;
    setSending(true);
    // TODO: verify code via backend then submit complaint
    setTimeout(() => {
      setSending(false);
      setStep("submitted");
    }, 1200);
  };

  const inputClass =
    "w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Step 1: Complaint Form */}
        {step === "form" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl">File a Complaint</DialogTitle>
              <DialogDescription>
                Report an issue with a service provider. A verification code will be sent before submission.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSendCode} className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">First Name</label>
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
                  <label className="block text-xs font-medium text-foreground mb-1.5">Last Name</label>
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
                <label className="block text-xs font-medium text-foreground mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+267 7X XXX XXX"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Age</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={120}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 28"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Gender</label>
                  <select
                    required
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className={inputClass}
                  >
                    <option value="" disabled>Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Describe What Happened</label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain your complaint in detail — what happened, which provider, when it occurred..."
                  className={`${inputClass} resize-none`}
                />
              </div>

              {/* Verification method choice */}
              <div>
                <label className="block text-xs font-medium text-foreground mb-2">Send verification code to:</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setVerifyMethod("email")}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                      verifyMethod === "email"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setVerifyMethod("phone")}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                      verifyMethod === "phone"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    Phone (SMS)
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
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
                A 6-digit code has been sent to your {verifyMethod === "email" ? `email (${email})` : `phone (${phone})`}. Enter it below to submit your complaint.
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
                    className="w-11 h-12 text-center text-lg font-bold rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                ))}
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Didn't receive a code?{" "}
                <button
                  type="button"
                  onClick={() => {
                    // TODO: resend code via backend
                  }}
                  className="text-primary font-medium hover:underline"
                >
                  Resend
                </button>
              </p>

              <button
                type="submit"
                disabled={sending || code.join("").length < 6}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
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
                Thank you, {firstName}. Your complaint has been received and will be reviewed by BOCRA. You'll receive updates via {verifyMethod === "email" ? "email" : "SMS"}.
              </p>
            </div>
            <button
              onClick={() => handleOpenChange(false)}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
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
