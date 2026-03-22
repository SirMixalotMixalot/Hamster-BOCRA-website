import { useState } from "react";
import { CreditCard, Plus, Download, CheckCircle2, Clock, XCircle, Wallet, Smartphone, X, Loader2 } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

type PaymentStatus = "All" | "Completed" | "Pending" | "Failed";

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

const stripeElementStyle = {
  base: {
    fontSize: "14px",
    color: "#1a1a2e",
    "::placeholder": { color: "#9ca3af" },
    fontFamily: "inherit",
  },
  invalid: { color: "#ef4444" },
};

const methodIcons: Record<string, typeof CreditCard> = {
  card: CreditCard,
  paypal: Wallet,
  "apple-pay": Smartphone,
};

// Stripe Card Form with split elements
const AddPaymentForm = ({
  onCardSuccess,
  onPaypal,
  onApplePay,
  onCancel,
  saving,
}: {
  onCardSuccess: (brand: string, last4: string, expMonth: number, expYear: number) => void;
  onPaypal: () => void;
  onApplePay: () => void;
  onCancel: () => void;
  saving: boolean;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardSaving, setCardSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardName, setCardName] = useState("");

  const handleSubmit = async () => {
    if (!stripe || !elements) return;

    setCardSaving(true);
    setError(null);

    const cardNumber = elements.getElement(CardNumberElement);
    if (!cardNumber) return;

    const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardNumber,
      billing_details: { name: cardName },
    });

    if (stripeError) {
      setError(stripeError.message || "An error occurred");
      setCardSaving(false);
      return;
    }

    if (paymentMethod?.card) {
      const { brand, last4, exp_month, exp_year } = paymentMethod.card;
      onCardSuccess(
        brand ? brand.charAt(0).toUpperCase() + brand.slice(1) : "Card",
        last4 || "0000",
        exp_month,
        exp_year
      );
    }

    setCardSaving(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-sm font-medium text-foreground">Add Payment Method</p>
          {/* Card brand logos */}
          <div className="flex items-center gap-1.5">
            <svg className="h-6 w-auto" viewBox="0 0 48 32" fill="none">
              <rect width="48" height="32" rx="4" fill="#1A1F71" />
              <path d="M19.5 21h-3.2l2-12.4h3.2L19.5 21zm13.2-12.1c-.6-.3-1.6-.5-2.8-.5-3.1 0-5.3 1.6-5.3 4 0 1.7 1.6 2.7 2.8 3.3 1.2.6 1.6 1 1.6 1.5 0 .8-1 1.2-1.9 1.2-1.3 0-1.9-.2-3-.6l-.4-.2-.4 2.6c.7.3 2.1.6 3.5.6 3.3 0 5.4-1.6 5.4-4.1 0-1.4-.8-2.4-2.7-3.3-1.1-.6-1.8-.9-1.8-1.5 0-.5.6-1 1.8-1 1 0 1.8.2 2.4.5l.3.1.5-2.6zm8.1 0H38c-1 0-1.7.3-2.1 1.2l-6 14.3h3.3l.7-1.8h4l.4 1.8H41l-2.6-12.1h2.4v-3.4zm-5.4 9.5l1.7-4.5.5-1.2.3 1.2 1 4.5h-3.5zM15.4 8.6l-3 8.5-.3-1.6c-.6-1.9-2.3-3.9-4.2-4.9l2.8 10.4h3.3l5-12.4h-3.6z" fill="white" />
              <path d="M10.3 8.6H5.1l-.1.3c3.9 1 6.5 3.4 7.6 6.3l-1.1-5.5c-.2-.8-.8-1.1-1.2-1.1z" fill="#F9A533" />
            </svg>
            <svg className="h-6 w-auto" viewBox="0 0 48 32" fill="none">
              <rect width="48" height="32" rx="4" fill="#252525" />
              <circle cx="19" cy="16" r="8" fill="#EB001B" />
              <circle cx="29" cy="16" r="8" fill="#F79E1B" />
              <path d="M24 10.3a8 8 0 0 1 0 11.4 8 8 0 0 1 0-11.4z" fill="#FF5F00" />
            </svg>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/50 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Card Form — no labels, compact */}
      <div className="space-y-2">
        <input
          type="text"
          value={cardName}
          onChange={(e) => setCardName(e.target.value)}
          placeholder="Name on card"
          className={inputClasses}
        />
        <div className="rounded-full border border-white/80 bg-white/50 px-5 py-3">
          <CardNumberElement options={{ style: stripeElementStyle, placeholder: "Card number" }} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-full border border-white/80 bg-white/50 px-5 py-3">
            <CardExpiryElement options={{ style: stripeElementStyle }} />
          </div>
          <div className="rounded-full border border-white/80 bg-white/50 px-5 py-3">
            <CardCvcElement options={{ style: stripeElementStyle }} />
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={cardSaving || !stripe || !cardName}
        className="w-full inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-colors disabled:opacity-60"
      >
        {cardSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
        Add Card
      </button>

      {/* Divider */}
      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/40" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white/40 px-3 text-xs text-muted-foreground backdrop-blur-sm rounded-full">or</span>
        </div>
      </div>

      {/* PayPal & Apple Pay side by side */}
      <div className="flex gap-3">
        <button
          onClick={onPaypal}
          disabled={saving}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium bg-[#0070ba] text-white hover:bg-[#005ea6] transition-colors shadow-md disabled:opacity-60"
        >
          <Wallet className="h-4 w-4" />
          PayPal
        </button>
        <button
          onClick={onApplePay}
          disabled={saving}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium bg-black text-white hover:bg-gray-800 transition-colors shadow-md disabled:opacity-60"
        >
          <Smartphone className="h-4 w-4" />
          Apple Pay
        </button>
      </div>
    </div>
  );
};

const Payments = () => {
  const [filter, setFilter] = useState<PaymentStatus>("All");
  const [selected, setSelected] = useState<PaymentRecord | null>(null);

  // Payment methods
  const [savedMethods, setSavedMethods] = useState<SavedMethod[]>([]);
  const [addingMethod, setAddingMethod] = useState(false);
  const [saving, setSaving] = useState(false);

  const filtered = filter === "All" ? MOCK_PAYMENTS : MOCK_PAYMENTS.filter((p) => p.status === filter);
  const statusInfo = selected ? statusIcons[selected.status] : null;
  const StatusIcon = statusInfo?.icon;

  const resetForm = () => {
    setAddingMethod(false);
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

  const handlePaypal = () => {
    setSaving(true);
    setTimeout(() => {
      setSavedMethods((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          brand: "PayPal",
          detail: "Connected",
          expiry: "",
          isDefault: prev.length === 0,
          type: "paypal",
        },
      ]);
      setSaving(false);
      resetForm();
    }, 800);
  };

  const handleApplePay = () => {
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
            <div className="pt-2">
              {addingMethod && (
                <Elements stripe={stripePromise}>
                  <AddPaymentForm
                    onCardSuccess={handleCardSuccess}
                    onPaypal={handlePaypal}
                    onApplePay={handleApplePay}
                    onCancel={resetForm}
                    saving={saving}
                  />
                </Elements>
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
