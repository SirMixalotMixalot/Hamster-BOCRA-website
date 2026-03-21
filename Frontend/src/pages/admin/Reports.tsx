import { BarChart3 } from "lucide-react";

const Reports = () => {
  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="text-2xl font-heading font-bold text-foreground">Reports</h2>
        <p className="text-sm text-muted-foreground mt-1">Generate and view regulatory reports</p>
      </div>
      <div className="bg-card rounded-xl border border-border p-8 text-center">
        <BarChart3 className="h-10 w-10 text-muted-foreground/30 mx-auto" />
        <p className="text-sm text-muted-foreground mt-3">No reports generated yet</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Licence statistics, compliance reports, and analytics will appear here</p>
      </div>
    </div>
  );
};

export default Reports;
