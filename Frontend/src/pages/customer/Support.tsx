import { LifeBuoy } from "lucide-react";

const Support = () => {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-heading font-bold text-foreground">Support</h2>
        <p className="text-sm text-muted-foreground mt-1">Get help or contact BOCRA</p>
      </div>
      <div className="bg-card rounded-xl border border-border p-8 text-center">
        <LifeBuoy className="h-10 w-10 text-muted-foreground/30 mx-auto" />
        <p className="text-sm text-muted-foreground mt-3">No support tickets yet</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Submit a ticket to contact BOCRA about your application or complaint</p>
      </div>
    </div>
  );
};

export default Support;
