import { Users, Search } from "lucide-react";
import { useState } from "react";

const AdminUsers = () => {
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading font-bold text-foreground">Users</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage registered customers and operators</p>
        </div>
      </div>
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
      </div>
      <div className="bg-card rounded-xl border border-border p-8 text-center">
        <Users className="h-10 w-10 text-muted-foreground/30 mx-auto" />
        <p className="text-sm text-muted-foreground mt-3">No users registered yet</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Registered users and their details will appear here</p>
      </div>
    </div>
  );
};

export default AdminUsers;
