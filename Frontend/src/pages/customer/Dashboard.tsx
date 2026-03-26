import { useEffect, useState } from "react";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Plus,
  ShieldCheck,
  LifeBuoy,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getCachedMe, getMe } from "@/lib/auth";
import { listApplications, type ApplicationListItem } from "@/lib/applications";
import { listSupportTickets, type SupportTicketItem } from "@/lib/support";
import { LoadingDots } from "@/components/ui/loading-dots";

type DashboardStats = {
  activeLicences: number;
  pendingLicences: number;
  totalApplications: number;
  openTickets: number;
};

type RecentActivity = {
  id: string;
  title: string;
  detail: string;
  timestamp: string;
};

const statCards = [
  { key: "activeLicences", label: "Active Licences", icon: CheckCircle2, color: "text-bocra-teal bg-bocra-teal/10" },
  { key: "pendingLicences", label: "Pending Licences", icon: Clock, color: "text-bocra-gold bg-bocra-gold/10" },
  { key: "totalApplications", label: "Total Applications", icon: FileText, color: "text-bocra-blue bg-bocra-blue/10" },
  { key: "openTickets", label: "Open Tickets", icon: AlertCircle, color: "text-bocra-rose bg-bocra-rose/10" },
] as const;

const quickActions = [
  { label: "New Application", description: "Apply for a licence", icon: Plus, to: "/customer/applications/new" },
  { label: "View Licences", description: "View your approved licences", icon: ShieldCheck, to: "/customer/licences" },
  { label: "Get Support", description: "Contact BOCRA", icon: LifeBuoy, to: "/customer/support" },
];

const Dashboard = () => {
  const [userName, setUserName] = useState(() => {
    const me = getCachedMe();
    if (!me) return "";
    const fullName = me.profile.full_name || me.user.email?.split("@")[0] || "";
    return fullName.split(" ")[0];
  });
  const [stats, setStats] = useState<DashboardStats>({
    activeLicences: 0,
    pendingLicences: 0,
    totalApplications: 0,
    openTickets: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  const buildRecentActivity = (applications: ApplicationListItem[], tickets: SupportTicketItem[]) => {
    const activity: RecentActivity[] = [];

    for (const app of applications) {
      activity.push({
        id: `application-${app.id}-created`,
        title: "Application created",
        detail: `${app.reference_number} (${app.licence_type})`,
        timestamp: app.created_at,
      });

      if (app.submitted_at) {
        activity.push({
          id: `application-${app.id}-submitted`,
          title: "Application submitted",
          detail: `${app.reference_number} (${app.licence_type})`,
          timestamp: app.submitted_at,
        });
      }
    }

    for (const ticket of tickets) {
      activity.push({
        id: `ticket-${ticket.id}-created`,
        title: "Support ticket opened",
        detail: ticket.subject,
        timestamp: ticket.created_at,
      });
    }

    return activity
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 6);
  };

  useEffect(() => {
    let mounted = true;

    const cachedMe = getCachedMe();
    if (cachedMe) {
      const fullName = cachedMe.profile.full_name || cachedMe.user.email?.split("@")[0] || "";
      setUserName(fullName.split(" ")[0]);
    }

    const load = async () => {
      try {
        const [me, applications, ticketsResponse] = await Promise.all([
          getMe().catch(() => null),
          listApplications().catch(() => [] as ApplicationListItem[]),
          listSupportTickets().catch(() => ({ items: [] as SupportTicketItem[] })),
        ]);

        if (!mounted) return;

        if (me) {
        const fullName = me.profile.full_name || me.user.email?.split("@")[0] || "";
        const name = fullName.split(" ")[0];
        setUserName(name);
        }

        const pendingStatuses = new Set(["submitted", "under_review", "requires_action"]);
        const activeLicences = applications.filter((app) => app.status === "approved").length;
        const pendingLicences = applications.filter((app) => pendingStatuses.has(app.status)).length;
        const openTickets = (ticketsResponse.items || []).filter((ticket) => ticket.status === "open").length;

        setStats({
          activeLicences,
          pendingLicences,
          totalApplications: applications.length,
          openTickets,
        });
        setRecentActivity(buildRecentActivity(applications, ticketsResponse.items || []));
      } finally {
        if (mounted) {
          setLoadingStats(false);
        }
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-heading font-bold text-foreground">
          Welcome back{userName ? `, ${userName}` : ""}!
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Here's an overview of your account</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="glass rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <span className="text-2xl font-heading font-bold text-foreground">
                {loadingStats ? (
                  <span className="inline-flex items-center gap-1" aria-label="Loading value">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/70 animate-bounce [animation-delay:-0.2s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/70 animate-bounce [animation-delay:-0.1s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/70 animate-bounce" />
                  </span>
                ) : (
                  stats[stat.key]
                )}
              </span>
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
            <Link
              key={action.label}
              to={action.to}
              className="flex items-center gap-4 p-4 glass rounded-xl hover:border-primary/30 hover:bg-primary/5 hover:shadow-glass-lg transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                <action.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground">{action.label}</div>
                <div className="text-xs text-muted-foreground">{action.description}</div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Recent Activity</h3>
        {loadingStats ? (
          <div className="glass rounded-xl p-8 text-center">
            <LoadingDots label="Loading recent activity..." />
          </div>
        ) : recentActivity.length === 0 ? (
          <div className="glass rounded-xl p-8 text-center">
            <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto" />
            <p className="text-sm text-muted-foreground mt-3">No recent activity</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Your application updates and notifications will appear here</p>
          </div>
        ) : (
          <div className="glass rounded-xl overflow-hidden">
            <ul className="divide-y divide-[hsl(var(--glass-border))]">
              {recentActivity.map((item) => (
                <li key={item.id} className="px-5 py-3.5">
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.detail}</p>
                  <p className="text-[11px] text-muted-foreground/80 mt-1">
                    {new Date(item.timestamp).toLocaleString("en-BW", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
