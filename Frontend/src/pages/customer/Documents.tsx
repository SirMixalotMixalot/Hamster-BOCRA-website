import { FolderOpen } from "lucide-react";

const Documents = () => {
  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="text-2xl font-heading font-bold text-foreground">Documents & Resources</h2>
        <p className="text-sm text-muted-foreground mt-1">Access regulations, forms, and guidelines</p>
      </div>
      <div className="bg-card rounded-xl border border-border p-8 text-center">
        <FolderOpen className="h-10 w-10 text-muted-foreground/30 mx-auto" />
        <p className="text-sm text-muted-foreground mt-3">No documents available yet</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Downloadable forms, regulations, and guidelines will appear here</p>
      </div>
    </div>
  );
};

export default Documents;
