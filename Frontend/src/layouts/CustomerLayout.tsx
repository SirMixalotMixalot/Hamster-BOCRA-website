import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  FileText,
  CreditCard,
  LifeBuoy,
  LogOut,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Home,
} from "lucide-react";
import bocraLogo from "@/assets/bocra-logo.png";
import AIChatbot from "@/components/AIChatbot";
import { logout } from "@/lib/auth";

const sidebarLinks = [
  { to: "/customer/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/customer/applications", icon: FileText, label: "Applications" },
  { to: "/customer/payments", icon: CreditCard, label: "Payments" },
  { to: "/customer/support", icon: LifeBuoy, label: "Support" },
];

const CustomerLayout = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

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
        {/* Logo – solid navy */}
        <div className="flex items-center gap-2.5 px-5 h-16 shrink-0 bg-bocra-navy border-b border-white/10">
          <img src={bocraLogo} alt="BOCRA" className="h-16 w-auto object-contain brightness-200 shrink-0" />
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto p-1 text-white/50 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav area */}
        <div className="flex-1 flex flex-col bg-gray-300 border-r border-gray-400/30">
          {/* Nav links */}
          <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
            {sidebarLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setSidebarOpen(false)}
                title={collapsed ? link.label : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${collapsed ? "justify-center" : ""} ${
                    isActive
                      ? "bg-white/40 text-bocra-navy shadow-sm"
                      : "text-bocra-navy/60 hover:bg-white/30 hover:text-bocra-navy"
                  }`
                }
              >
                <link.icon className="h-4 w-4 shrink-0" />
                {!collapsed && link.label}
              </NavLink>
            ))}
          </nav>

          {/* Profile & Logout */}
          <div className="px-2 pb-3 space-y-1 border-t border-gray-400/30 pt-3">
            <NavLink
              to="/customer/profile"
              onClick={() => setSidebarOpen(false)}
              title={collapsed ? "Profile" : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${collapsed ? "justify-center" : ""} ${
                  isActive
                    ? "bg-white/40 text-bocra-navy shadow-sm"
                    : "text-bocra-navy/60 hover:bg-white/30 hover:text-bocra-navy"
                }`
              }
            >
              <User className="h-4 w-4 shrink-0" />
              {!collapsed && "Profile"}
            </NavLink>
            <NavLink
              to="/"
              onClick={() => setSidebarOpen(false)}
              title={collapsed ? "Home" : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-bocra-navy/60 hover:bg-white/30 hover:text-bocra-navy ${collapsed ? "justify-center" : ""}`}
            >
              <Home className="h-4 w-4 shrink-0" />
              {!collapsed && "Home Page"}
            </NavLink>
            <button
              onClick={handleLogout}
              title={collapsed ? "Sign Out" : undefined}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-bocra-navy/40 hover:bg-white/30 hover:text-bocra-navy transition-all ${collapsed ? "justify-center" : ""}`}
            >
              <LogOut className="h-4 w-4" />
              {!collapsed && "Sign Out"}
            </button>
            {/* Collapse toggle */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={`hidden lg:flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-bocra-navy/40 hover:bg-white/30 hover:text-bocra-navy transition-all ${collapsed ? "justify-center" : ""}`}
            >
              {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
              {!collapsed && "Collapse"}
            </button>
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
        <header className="h-16 shrink-0 bg-bocra-navy border-b border-white/10 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 rounded-md hover:bg-white/10">
              <Menu className="h-5 w-5 text-white/60" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const event = new CustomEvent("toggle-ai-chatbot");
                window.dispatchEvent(event);
              }}
              className="hidden md:inline-flex items-center gap-2 px-3 py-2 bg-bocra-gold text-bocra-navy rounded-md text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
            >
              AI Assistant
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-portal-gradient">
          <div className="max-w-5xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      <AIChatbot />
    </div>
  );
};

export default CustomerLayout;
