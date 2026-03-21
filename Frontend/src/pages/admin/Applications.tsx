import { FileText } from "lucide-react";

const AdminApplications = () => {
  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="text-2xl font-heading font-bold text-foreground">Applications</h2>
        <p className="text-sm text-muted-foreground mt-1">Review, approve, or reject licence applications</p>
      </div>
      <div className="flex gap-2">
        {["All", "Pending", "Approved", "Rejected"].map((filter) => (
          <button
            key={filter}
            className="px-3 py-1.5 rounded-md text-xs font-medium border border-border bg-card hover:bg-muted transition-colors first:bg-primary first:text-primary-foreground first:border-primary"
          >
            {filter}
          </button>
        ))}
      </div>
      <div className="bg-card rounded-xl border border-border p-8 text-center">
        <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto" />
        <p className="text-sm text-muted-foreground mt-3">No applications submitted yet</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Submitted licence applications will appear here for review</p>
      </div>
    </div>
  );
};

export default AdminApplications;
