import { Settings as SettingsIcon } from "lucide-react";

const AdminSettings = () => {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-card rounded-xl border border-border p-8 text-center">
        <SettingsIcon className="h-10 w-10 text-muted-foreground/30 mx-auto" />
        <p className="text-sm text-muted-foreground mt-3">Settings coming soon</p>
        <p className="text-xs text-muted-foreground/60 mt-1">System configuration, email templates, and notification preferences will be managed here</p>
      </div>
    </div>
  );
};

export default AdminSettings;
