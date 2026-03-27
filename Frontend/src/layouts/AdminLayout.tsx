import { useState } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  MessageSquareWarning,
  LifeBuoy,
  BarChart3,
  Briefcase,
  User,
  Home,
  LogOut,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import bocraLogo from "@/assets/bocra-logo.png";
import AIChatbot from "@/components/AIChatbot";
import { logout } from "@/lib/auth";

const sidebarLinks = [
  { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/users", icon: Users, label: "Users" },
  { to: "/admin/applications", icon: FileText, label: "Applications" },
  { to: "/admin/complaints", icon: MessageSquareWarning, label: "Complaints" },
  { to: "/admin/tickets", icon: LifeBuoy, label: "Tickets" },
  { to: "/admin/careers", icon: Briefcase, label: "Careers" },
  { to: "/admin/reports", icon: BarChart3, label: "Documents Management" },
];

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  "/admin/dashboard": { title: "Dashboard", subtitle: "System overview and pending actions" },
  "/admin/users": { title: "Users", subtitle: "Manage registered customers and operators" },
  "/admin/applications": { title: "Applications", subtitle: "Review and process submitted licences" },
  "/admin/complaints": { title: "Complaints", subtitle: "Track and resolve customer complaints" },
  "/admin/tickets": { title: "Tickets", subtitle: "Handle support tickets and escalations" },
  "/admin/careers": { title: "Careers", subtitle: "Manage job posts and applications" },
  "/admin/reports": { title: "Documents Management", subtitle: "Manage published documents and reports" },
  "/admin/settings": { title: "Profile", subtitle: "Update profile and account preferences" },
};

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const activeMeta = Object.entries(pageMeta).find(([route]) => location.pathname.startsWith(route))?.[1] ?? {
    title: "Admin",
    subtitle: "Admin portal section",
  };

  const handleLogout = () => {
    void logout();
    navigate("/");
  };

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col transition-all duration-300 lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "w-16" : "w-64"}`}
      >
        <div className="flex h-full flex-col bg-transparent">
          <div className="px-3 pt-3 lg:hidden">
            <button onClick={() => setSidebarOpen(false)} className="ml-auto flex rounded-full p-2 text-slate-600 hover:bg-slate-100">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="hidden h-[5.75rem] flex-col justify-center px-5 lg:flex">
            {!collapsed && (
              <>
                <h2 className="text-base font-heading font-bold leading-tight text-foreground">{activeMeta.title}</h2>
                <p className="text-xs text-muted-foreground">{activeMeta.subtitle}</p>
              </>
            )}
          </div>

          {/* Nav area */}
          <div className="mx-3 mb-3 mt-3 overflow-hidden rounded-3xl border border-slate-200/80 bg-white/75 shadow-[0_18px_38px_-22px_rgba(15,23,42,0.55)] backdrop-blur-xl">
            {/* Nav links */}
            <nav className="space-y-1 px-2 py-3">
            {sidebarLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setSidebarOpen(false)}
                title={collapsed ? link.label : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-full text-sm font-medium transition-all ${
                    collapsed ? "justify-center px-2 py-3.5" : "px-3 py-2.5"
                  } ${
                    isActive
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
              >
                <link.icon className={`${collapsed ? "h-5 w-5" : "h-4 w-4"} shrink-0`} />
                {!collapsed && link.label}
              </NavLink>
            ))}
            </nav>

            <div className="hidden border-t border-slate-200/80 p-2 lg:block">
              <button
                onClick={() => setCollapsed(!collapsed)}
                className={`inline-flex w-full items-center gap-2 rounded-full text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 ${
                  collapsed ? "justify-center px-2 py-3.5" : "px-3 py-2.5"
                }`}
              >
                {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-4 w-4" />}
                {!collapsed && "Collapse"}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="shrink-0 px-4 pb-2 pt-3 lg:px-6">
          <div className="mr-auto flex w-full max-w-6xl items-center justify-between rounded-full border border-slate-200/70 bg-white/80 px-3 py-2 shadow-[0_16px_36px_-22px_rgba(15,23,42,0.5)] backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <button onClick={() => setSidebarOpen(true)} className="rounded-full p-2 transition-colors hover:bg-slate-100 lg:hidden">
                <Menu className="h-5 w-5 text-slate-700" />
              </button>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="inline-flex items-center rounded-full px-2 py-1.5 transition-colors hover:bg-slate-100"
                aria-label="Go to home"
              >
                <img src={bocraLogo} alt="BOCRA" className="h-9 w-auto object-contain" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <NavLink
                to="/admin/settings"
                className={({ isActive }) =>
                  `hidden md:inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
                  }`
                }
              >
                <User className="h-4 w-4" />
                Profile
              </NavLink>
              <NavLink
                to="/"
                className="hidden md:inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
              >
                <Home className="h-4 w-4" />
                Home
              </NavLink>
              <NavLink
                to="/admin/settings"
                className="inline-flex items-center justify-center rounded-full p-2 text-slate-700 transition-colors hover:bg-slate-100 md:hidden"
                aria-label="Profile"
              >
                <User className="h-4 w-4" />
              </NavLink>
              <NavLink
                to="/"
                className="inline-flex items-center justify-center rounded-full p-2 text-slate-700 transition-colors hover:bg-slate-100 md:hidden"
                aria-label="Home"
              >
                <Home className="h-4 w-4" />
              </NavLink>
              <button
                onClick={handleLogout}
                className="inline-flex items-center justify-center rounded-full p-2 text-slate-700 transition-colors hover:bg-slate-100 md:hidden"
                aria-label="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
              <button
                onClick={handleLogout}
                className="hidden md:inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("toggle-ai-chatbot"))}
                className="inline-flex items-center gap-2 rounded-full bg-bocra-gold px-3.5 py-2 text-sm font-semibold text-bocra-navy shadow-sm transition-all duration-300 hover:opacity-95 hover:shadow-md"
            >
              AI Assistant
            </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-background p-4 lg:p-6">
          {collapsed && (
            <div className="mb-6 hidden lg:block">
              <h2 className="text-2xl font-heading font-bold text-foreground">{activeMeta.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{activeMeta.subtitle}</p>
            </div>
          )}
          <Outlet />
        </main>
      </div>

      <AIChatbot />
    </div>
  );
};

export default AdminLayout;
