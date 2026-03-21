import {
  Users,
  FileText,
  ShieldCheck,
  MessageSquareWarning,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

const stats = [
  { label: "Total Users", value: 0, icon: Users, color: "text-bocra-blue bg-bocra-blue/10" },
  { label: "Pending Applications", value: 0, icon: Clock, color: "text-bocra-gold bg-bocra-gold/10" },
  { label: "Active Licences", value: 0, icon: CheckCircle2, color: "text-bocra-teal bg-bocra-teal/10" },
  { label: "Open Complaints", value: 0, icon: AlertCircle, color: "text-bocra-rose bg-bocra-rose/10" },
];

const quickActions = [
  { label: "Review Applications", description: "Pending submissions", icon: FileText, to: "/admin/applications" },
  { label: "Manage Licences", description: "Issue or revoke", icon: ShieldCheck, to: "/admin/licences" },
  { label: "View Complaints", description: "Unresolved cases", icon: MessageSquareWarning, to: "/admin/complaints" },
];

const Dashboard = () => {
  return (
    <div className="space-y-6 max-w-6xl">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-heading font-bold text-foreground">Admin Dashboard</h2>
        <p className="text-sm text-muted-foreground mt-1">System overview and pending actions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <span className="text-2xl font-heading font-bold text-foreground">{stat.value}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-3">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <a
              key={action.label}
              href={action.to}
              className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                <action.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground">{action.label}</div>
                <div className="text-xs text-muted-foreground">{action.description}</div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </a>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Recent Activity</h3>
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto" />
          <p className="text-sm text-muted-foreground mt-3">No recent activity</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Application reviews, licence actions, and system events will appear here</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
