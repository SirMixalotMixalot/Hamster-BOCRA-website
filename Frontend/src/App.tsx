import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { BrowserRouter, Route, Routes, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import CustomerLayout from "./layouts/CustomerLayout.tsx";
import Dashboard from "./pages/customer/Dashboard.tsx";
import Profile from "./pages/customer/Profile.tsx";
import Applications from "./pages/customer/Applications.tsx";
import Payments from "./pages/customer/Payments.tsx";
import VerifyLicence from "./pages/customer/VerifyLicence.tsx";
import Documents from "./pages/customer/Documents.tsx";
import Support from "./pages/customer/Support.tsx";
import CustomerLicences from "./pages/customer/Licences.tsx";
import AdminLayout from "./layouts/AdminLayout.tsx";
import AdminDashboard from "./pages/admin/Dashboard.tsx";
import AdminUsers from "./pages/admin/Users.tsx";
import AdminApplications from "./pages/admin/Applications.tsx";
import Licences from "./pages/admin/Licences.tsx";
import Complaints from "./pages/admin/Complaints.tsx";
import Reports from "./pages/admin/Reports.tsx";
import AdminSettings from "./pages/admin/Settings.tsx";
import Careers from "./pages/Careers.tsx";
import NewApplication from "./pages/customer/applications/NewApplication.tsx";
import { bootstrapAuth, getAccessToken, getStoredRole, subscribeToSupabaseAuthChanges } from "@/lib/auth";

const queryClient = new QueryClient();

const AuthBootstrapper = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let active = true;

    const run = async () => {
      const token = getAccessToken();
      const storedRole = getStoredRole();

      // Only auto-redirect admins from landing page; customers can stay
      if (location.pathname === "/" && token && storedRole === "admin") {
        navigate("/admin/dashboard", { replace: true });
      }

      // First OAuth login has no cached role yet. Don't redirect yet —
      // let bootstrap determine the role first.
      if (location.pathname === "/" && token && !storedRole) {
        // Will be handled after bootstrapAuth() below
      }

      const me = await bootstrapAuth();
      if (!active) {
        return;
      }

      const path = location.pathname;
      const isProtected = path.startsWith("/admin") || path.startsWith("/customer");

      if (!me) {
        if (isProtected) {
          navigate("/", { replace: true });
        }
        return;
      }

      const isAdmin = me.profile.role === "admin";

      // Only auto-redirect admins; customers can browse the landing page
      if (path === "/" && isAdmin) {
        navigate("/admin/dashboard", { replace: true });
        return;
      }

      if (path.startsWith("/admin") && !isAdmin) {
        navigate("/customer/dashboard", { replace: true });
      }
    };

    run();

    const unsubscribe = subscribeToSupabaseAuthChanges(() => {
      void run();
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [location.pathname, navigate]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthBootstrapper />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/careers" element={<Careers />} />

          {/* Customer Portal */}
          <Route path="/customer" element={<CustomerLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="applications" element={<Applications />} />
            <Route path="applications/new" element={<NewApplication />} />
            <Route path="licences" element={<CustomerLicences />} />
            <Route path="payments" element={<Payments />} />
            <Route path="verify" element={<VerifyLicence />} />
            <Route path="documents" element={<Documents />} />
            <Route path="support" element={<Support />} />
          </Route>

          {/* Admin Panel */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="applications" element={<AdminApplications />} />
            <Route path="licences" element={<Licences />} />
            <Route path="complaints" element={<Complaints />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
