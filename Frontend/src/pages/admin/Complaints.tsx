import { MessageSquareWarning } from "lucide-react";

const Complaints = () => {
  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="text-2xl font-heading font-bold text-foreground">Complaints</h2>
        <p className="text-sm text-muted-foreground mt-1">Track and resolve customer complaints</p>
      </div>
      <div className="flex gap-2">
        {["All", "Open", "In Progress", "Resolved"].map((filter) => (
          <button
            key={filter}
            className="px-3 py-1.5 rounded-md text-xs font-medium border border-border bg-card hover:bg-muted transition-colors first:bg-primary first:text-primary-foreground first:border-primary"
          >
            {filter}
          </button>
        ))}
      </div>
      <div className="bg-card rounded-xl border border-border p-8 text-center">
        <MessageSquareWarning className="h-10 w-10 text-muted-foreground/30 mx-auto" />
        <p className="text-sm text-muted-foreground mt-3">No complaints filed yet</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Customer complaints and their resolution status will appear here</p>
      </div>
    </div>
  );
};

export default Complaints;
