import { FileText } from "lucide-react";

const Applications = () => {
  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading font-bold text-foreground">My Applications</h2>
          <p className="text-sm text-muted-foreground mt-1">Track your licence applications</p>
        </div>
        <a
          href="/customer/applications/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          New Application
        </a>
      </div>
      <div className="bg-card rounded-xl border border-border p-8 text-center">
        <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto" />
        <p className="text-sm text-muted-foreground mt-3">No applications yet</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Start a new licence application to get started</p>
      </div>
    </div>
  );
};

export default Applications;
