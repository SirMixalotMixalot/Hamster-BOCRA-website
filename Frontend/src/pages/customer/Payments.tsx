import { useState, useMemo } from "react";
import { CreditCard, Plus, Download, CheckCircle2, Clock, XCircle, Wallet, Smartphone, X, Loader2 } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

type PaymentStatus = "All" | "Completed" | "Pending" | "Failed";

type MethodType = "card" | "paypal" | "apple-pay" | null;

type SavedMethod = {
  id: string;
  brand: string;
  detail: string;
  expiry: string;
  isDefault: boolean;
  type: "card" | "paypal" | "apple-pay";
};

type PaymentRecord = {
  id: string;
  ref: string;
  date: string;
  description: string;
  amount: string;
  method: string;
  status: "Completed" | "Pending" | "Failed";
};

const MOCK_PAYMENTS: PaymentRecord[] = [
  { id: "1", ref: "PAY-2026-0041", date: "Mar 18, 2026", description: "Spectrum Licence Renewal", amount: "BWP 5,200.00", method: "Visa •••• 4242", status: "Completed" },
  { id: "2", ref: "PAY-2026-0038", date: "Mar 10, 2026", description: "Application Processing Fee", amount: "BWP 350.00", method: "Visa •••• 4242", status: "Completed" },
  { id: "3", ref: "PAY-2026-0035", date: "Feb 28, 2026", description: "Type Approval Certificate", amount: "BWP 1,500.00", method: "Mastercard •••• 8888", status: "Pending" },
  { id: "4", ref: "PAY-2026-0029", date: "Feb 15, 2026", description: "Dealer Licence Fee", amount: "BWP 2,800.00", method: "PayPal", status: "Completed" },
  { id: "5", ref: "PAY-2026-0022", date: "Jan 30, 2026", description: "Late Renewal Penalty", amount: "BWP 750.00", method: "Visa •••• 4242", status: "Failed" },
  { id: "6", ref: "PAY-2025-0198", date: "Dec 12, 2025", description: "System & Services Licence", amount: "BWP 8,400.00", method: "Mastercard •••• 8888", status: "Completed" },
];

const statusFilters: PaymentStatus[] = ["All", "Completed", "Pending", "Failed"];

const statusColors: Record<string, string> = {
  Completed: "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Failed: "bg-red-100 text-red-700",
};

const statusIcons: Record<string, { icon: typeof CheckCircle2; color: string; bg: string }> = {
  Completed: { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
  Pending: { icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
  Failed: { icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
};

const cardClasses = "bg-white/40 backdrop-blur-sm rounded-2xl border border-white/60 shadow-lg";
const inputClasses = "w-full px-5 py-2.5 rounded-full border border-white/80 bg-white/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary";

const methodIcons: Record<string, typeof CreditCard> = {
  card: CreditCard,
  paypal: Wallet,
  "apple-pay": Smartphone,
};

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "14px",
      color: "#1a1a2e",
      "::placeholder": { color: "#9ca3af" },
      fontFamily: "inherit",
    },
    invalid: { color: "#ef4444" },
  },
};

// Stripe Card Form (must be inside <Elements>)
const StripeCardForm = ({
  onSuccess,
  onCancel,
  onBack,
}: {
  onSuccess: (brand: string, last4: string, expMonth: number, expYear: number) => void;
  onCancel: () => void;
  onBack: () => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!stripe || !elements) return;

    setSaving(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
    });

    if (stripeError) {
      setError(stripeError.message || "An error occurred");
      setSaving(false);
      return;
    }

    if (paymentMethod) {
      const { brand, last4, exp_month, exp_year } = paymentMethod.card!;
      onSuccess(
        brand ? brand.charAt(0).toUpperCase() + brand.slice(1) : "Card",
        last4 || "0000",
        exp_month,
        exp_year
      );
    }

    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="text-sm text-primary hover:underline">
            Back
          </button>
          <span className="text-muted-foreground">•</span>
          <p className="text-sm font-medium text-foreground">Card Details</p>
        </div>
        <button
          onClick={onCancel}
          className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/50 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="rounded-2xl border border-white/80 bg-white/50 px-5 py-3.5">
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </div>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      <button
        onClick={handleSubmit}
        disabled={saving || !stripe}
        className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-colors disabled:opacity-60"
      >
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        Add Card
      </button>
    </div>
  );
};

const Payments = () => {
  const [filter, setFilter] = useState<PaymentStatus>("All");
  const [selected, setSelected] = useState<PaymentRecord | null>(null);

  // Payment methods
  const [savedMethods, setSavedMethods] = useState<SavedMethod[]>([]);
  const [addingMethod, setAddingMethod] = useState(false);
  const [methodStep, setMethodStep] = useState<MethodType>(null);
  const [saving, setSaving] = useState(false);

  // PayPal
  const [paypalEmail, setPaypalEmail] = useState("");

  const filtered = filter === "All" ? MOCK_PAYMENTS : MOCK_PAYMENTS.filter((p) => p.status === filter);
  const statusInfo = selected ? statusIcons[selected.status] : null;
  const StatusIcon = statusInfo?.icon;

  // Stable Elements key so Stripe doesn't re-mount unnecessarily
  const stripeKey = useMemo(() => Date.now(), [methodStep === "card"]);

  const resetForm = () => {
    setAddingMethod(false);
    setMethodStep(null);
    setPaypalEmail("");
  };

  const handleCardSuccess = (brand: string, last4: string, expMonth: number, expYear: number) => {
    setSavedMethods((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        brand,
        detail: `•••• ${last4}`,
        expiry: `${String(expMonth).padStart(2, "0")}/${String(expYear).slice(-2)}`,
        isDefault: prev.length === 0,
        type: "card",
      },
    ]);
    resetForm();
  };

  const handleSavePaypal = () => {
    setSaving(true);
    setTimeout(() => {
      setSavedMethods((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          brand: "PayPal",
          detail: paypalEmail,
          expiry: "",
          isDefault: prev.length === 0,
          type: "paypal",
        },
      ]);
      setSaving(false);
      resetForm();
    }, 800);
  };

  const handleSaveApplePay = () => {
    setSaving(true);
    setTimeout(() => {
      setSavedMethods((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          brand: "Apple Pay",
          detail: "Connected",
          expiry: "",
          isDefault: prev.length === 0,
          type: "apple-pay",
        },
      ]);
      setSaving(false);
      resetForm();
    }, 800);
  };

  const handleRemoveMethod = (id: string) => {
    setSavedMethods((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      if (updated.length > 0 && !updated.some((m) => m.isDefault)) {
        updated[0].isDefault = true;
      }
      return updated;
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-primary/10">
          <CreditCard className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-heading font-bold text-foreground">Payments</h2>
          <p className="text-sm text-muted-foreground">View your payment history and receipts</p>
        </div>
      </div>

      {/* Payment Methods Card */}
      <div className={`${cardClasses} p-6`}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Payment Methods</p>
          {!addingMethod && (
            <button
              onClick={() => setAddingMethod(true)}
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium bg-white/50 text-foreground border border-white/80 hover:bg-white/70 transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Method
            </button>
          )}
        </div>

        {/* Saved Methods List */}
        {savedMethods.length > 0 && (
          <div className="space-y-2 mb-4">
            {savedMethods.map((method) => {
              const Icon = methodIcons[method.type];
              return (
                <div
                  key={method.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/30 border border-white/50"
                >
                  <div className="p-2 rounded-lg bg-white/60">
                    <Icon className="h-5 w-5 text-foreground/60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {method.brand} <span className="text-muted-foreground">{method.detail}</span>
                    </p>
                    {method.expiry && (
                      <p className="text-xs text-muted-foreground">Expires {method.expiry}</p>
                    )}
                  </div>
                  {method.isDefault && (
                    <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary">
                      Default
                    </span>
                  )}
                  <button
                    onClick={() => handleRemoveMethod(method.id)}
                    className="p-1 rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {savedMethods.length === 0 && !addingMethod && (
          <div className="text-center py-4">
            <Wallet className="h-8 w-8 text-muted-foreground/30 mx-auto" />
            <p className="text-sm text-muted-foreground mt-2">No payment methods added</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Click "Add Method" to get started</p>
          </div>
        )}

        {/* Add Method Flow */}
        <div
          className="grid transition-all duration-300 ease-in-out"
          style={{ gridTemplateRows: addingMethod ? "1fr" : "0fr" }}
        >
          <div className="overflow-hidden">
            <div className="pt-2 space-y-4">
              {/* Step 1: Choose method type */}
              {addingMethod && !methodStep && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">Choose payment method</p>
                    <button
                      onClick={resetForm}
                      className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/50 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      onClick={() => setMethodStep("card")}
                      className="flex items-center gap-3 p-4 rounded-xl bg-white/30 border border-white/50 hover:bg-white/50 transition-all text-left"
                    >
                      <CreditCard className="h-5 w-5 text-foreground/60 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Credit / Debit Card</p>
                        <p className="text-xs text-muted-foreground">Visa, Mastercard</p>
                      </div>
                    </button>
                    <button
                      onClick={() => setMethodStep("paypal")}
                      className="flex items-center gap-3 p-4 rounded-xl bg-white/30 border border-white/50 hover:bg-white/50 transition-all text-left"
                    >
                      <Wallet className="h-5 w-5 text-foreground/60 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground">PayPal</p>
                        <p className="text-xs text-muted-foreground">Pay with PayPal</p>
                      </div>
                    </button>
                    <button
                      onClick={() => setMethodStep("apple-pay")}
                      className="flex items-center gap-3 p-4 rounded-xl bg-white/30 border border-white/50 hover:bg-white/50 transition-all text-left"
                    >
                      <Smartphone className="h-5 w-5 text-foreground/60 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Apple Pay</p>
                        <p className="text-xs text-muted-foreground">Pay with Apple</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Stripe Card Form */}
              {methodStep === "card" && (
                <Elements stripe={stripePromise} key={stripeKey}>
                  <StripeCardForm
                    onSuccess={handleCardSuccess}
                    onCancel={resetForm}
                    onBack={() => setMethodStep(null)}
                  />
                </Elements>
              )}

              {/* Step 2: PayPal */}
              {methodStep === "paypal" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setMethodStep(null)} className="text-sm text-primary hover:underline">
                        Back
                      </button>
                      <span className="text-muted-foreground">•</span>
                      <p className="text-sm font-medium text-foreground">PayPal Account</p>
                    </div>
                    <button
                      onClick={resetForm}
                      className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/50 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">PayPal Email</label>
                    <input
                      type="email"
                      value={paypalEmail}
                      onChange={(e) => setPaypalEmail(e.target.value)}
                      placeholder="you@example.com"
                      className={inputClasses}
                    />
                  </div>
                  <button
                    onClick={handleSavePaypal}
                    disabled={saving || !paypalEmail}
                    className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-colors disabled:opacity-60"
                  >
                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                    Connect PayPal
                  </button>
                </div>
              )}

              {/* Step 2: Apple Pay */}
              {methodStep === "apple-pay" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setMethodStep(null)} className="text-sm text-primary hover:underline">
                        Back
                      </button>
                      <span className="text-muted-foreground">•</span>
                      <p className="text-sm font-medium text-foreground">Apple Pay</p>
                    </div>
                    <button
                      onClick={resetForm}
                      className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/50 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="p-4 rounded-xl bg-white/30 border border-white/50 text-center">
                    <Smartphone className="h-8 w-8 text-foreground/40 mx-auto mb-2" />
                    <p className="text-sm text-foreground">Connect your Apple Pay account</p>
                    <p className="text-xs text-muted-foreground mt-1">You'll be redirected to verify with Apple</p>
                  </div>
                  <button
                    onClick={handleSaveApplePay}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-colors disabled:opacity-60"
                  >
                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                    Connect Apple Pay
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment History Card */}
      <div className={cardClasses}>
        <div className="p-4 pb-0 flex flex-wrap gap-2">
          {statusFilters.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => { setFilter(s); setSelected(null); }}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                filter === s
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-white/50 text-foreground border border-white/80 hover:bg-white/70"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="p-8 text-center">
            <CreditCard className="h-10 w-10 text-muted-foreground/30 mx-auto" />
            <p className="text-sm text-muted-foreground mt-3">No payments found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto mt-3">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/40">
                    <th className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Date</th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Description</th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Amount</th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Method</th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row, i) => (
                    <tr
                      key={row.id}
                      onClick={() => setSelected(row)}
                      className={`border-b border-white/30 last:border-0 cursor-pointer transition-colors ${
                        selected?.id === row.id
                          ? "bg-primary/10"
                          : i % 2 === 1
                          ? "bg-white/30 hover:bg-white/50"
                          : "hover:bg-white/40"
                      }`}
                    >
                      <td className="px-4 py-3 text-foreground whitespace-nowrap">{row.date}</td>
                      <td className="px-4 py-3 text-foreground">{row.description}</td>
                      <td className="px-4 py-3 text-foreground font-medium whitespace-nowrap">{row.amount}</td>
                      <td className="px-4 py-3 text-foreground whitespace-nowrap">{row.method}</td>
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
              Total Records: {filtered.length}
            </div>
          </>
        )}
      </div>

      {/* Receipt Detail Card */}
      {selected && statusInfo && StatusIcon && (
        <div className={`${cardClasses} p-6 space-y-5`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${statusInfo.bg}`}>
                <StatusIcon className={`h-8 w-8 ${statusInfo.color}`} />
              </div>
              <div>
                <p className={`text-lg font-bold ${statusInfo.color}`}>{selected.status}</p>
                <p className="text-sm text-muted-foreground">{selected.ref}</p>
              </div>
            </div>
            <button className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium bg-white/50 text-foreground border border-white/80 hover:bg-white/70 transition-all">
              <Download className="h-3.5 w-3.5" />
              Download Receipt
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 border-t border-white/40 pt-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Reference</p>
              <p className="text-sm font-semibold text-foreground">{selected.ref}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Date</p>
              <p className="text-sm font-semibold text-foreground">{selected.date}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Description</p>
              <p className="text-sm font-semibold text-foreground">{selected.description}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Amount</p>
              <p className="text-sm font-semibold text-foreground">{selected.amount}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Payment Method</p>
              <p className="text-sm font-semibold text-foreground">{selected.method}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusColors[selected.status]}`}>
                {selected.status}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
