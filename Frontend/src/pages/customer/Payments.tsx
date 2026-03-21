import { CreditCard } from "lucide-react";

const Payments = () => {
  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="text-2xl font-heading font-bold text-foreground">Payments</h2>
        <p className="text-sm text-muted-foreground mt-1">View your payment history and receipts</p>
      </div>
      <div className="bg-card rounded-xl border border-border p-8 text-center">
        <CreditCard className="h-10 w-10 text-muted-foreground/30 mx-auto" />
        <p className="text-sm text-muted-foreground mt-3">No payments yet</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Payment records will appear here after submitting an application</p>
      </div>
    </div>
  );
};

export default Payments;
