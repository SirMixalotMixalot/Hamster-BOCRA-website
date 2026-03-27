import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/i18n";
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
import Complaints from "./pages/admin/Complaints.tsx";
import Tickets from "./pages/admin/Tickets.tsx";
import Reports from "./pages/admin/Reports.tsx";
import AdminSettings from "./pages/admin/Settings.tsx";
import Careers from "./pages/Careers.tsx";
import NewApplication from "./pages/customer/applications/NewApplication.tsx";
import { bootstrapAuth, getCachedMe, subscribeToSupabaseAuthChanges, type MeResponse } from "@/lib/auth";
import Faqs from "./pages/Faqs.tsx";
import WhoWeAre from "./pages/about/WhoWeAre.tsx";
import OurMandate from "./pages/about/OurMandate.tsx";
import StrategicPlan from "./pages/about/StrategicPlan.tsx";
import OrgStructure from "./pages/about/OrgStructure.tsx";
import AnnualReports from "./pages/about/AnnualReports.tsx";
import HowLicensingWorks from "./pages/licensing/HowLicensingWorks.tsx";
import LicenceFees from "./pages/licensing/LicenceFees.tsx";
import LicenceVerification from "./pages/licensing/LicenceVerification.tsx";
import Telecommunications from "./pages/licensing/Telecommunications";
import Broadcasting from "./pages/licensing/Broadcasting";
import InternetServices from "./pages/licensing/InternetServices";
import PostalServices from "./pages/licensing/PostalServices";
import SpectrumManagement from "./pages/licensing/SpectrumManagement";
import Interconnection from "./pages/licensing/Interconnection";
import PoliciesFrameworks from "./pages/resources/PoliciesFrameworks.tsx";
import LegislationRegulations from "./pages/resources/LegislationRegulations.tsx";
import ConsumerEducation from "./pages/resources/ConsumerEducation.tsx";
import Publications from "./pages/resources/Publications.tsx";
import Tenders from "./pages/resources/Tenders.tsx";
import Statistics from "./pages/resources/Statistics.tsx";
import FormsDocuments from "./pages/resources/FormsDocuments.tsx";
import News from "./pages/resources/News.tsx";
import JobDetail from "./pages/careers/JobDetail.tsx";
import JobApplication from "./pages/careers/JobApplication.tsx";
import AdminCareers from "./pages/admin/AdminCareers.tsx";
import SignInModal from "./components/SignInModal.tsx";
import ComplaintModal from "./components/ComplaintModal.tsx";
import TrackComplaintModal from "./components/TrackComplaintModal.tsx";
import VerifyLicenceModal from "./components/VerifyLicenceModal.tsx";

const queryClient = new QueryClient();

const AuthBootstrapper = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [shouldShowOverlay, setShouldShowOverlay] = useState(false);

  const enforceRouteAccess = (path: string, me: MeResponse | null) => {
    const isProtected = path.startsWith("/admin") || path.startsWith("/customer");

    if (!me) {
      if (isProtected) {
        navigate("/", { replace: true });
      }
      return;
    }

    const isAdmin = me.profile.role === "admin";

    if (path.startsWith("/admin") && !isAdmin) {
      navigate("/customer/dashboard", { replace: true });
      return;
    }

    if (path.startsWith("/customer") && isAdmin) {
      navigate("/admin/dashboard", { replace: true });
    }
  };

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      const isProtected = location.pathname.startsWith("/admin") || location.pathname.startsWith("/customer");
      const cachedMe = getCachedMe();
      
      // Only bootstrap if going to protected route or has cached session for protected route
      if (!isProtected && !cachedMe) {
        // Public page with no cached login - no need to wait for auth
        setIsBootstrapping(false);
        return;
      }

      // Protected route requires overlay while verifying
      // Cached login on public page: verify silently in background without overlay
      if (isProtected) {
        setShouldShowOverlay(true);
      }

      const me = await bootstrapAuth();
      if (!active) {
        return;
      }

      setIsBootstrapping(false);
      enforceRouteAccess(location.pathname, me);
    };

    void bootstrap();

    const unsubscribe = subscribeToSupabaseAuthChanges(() => {
      void bootstrapAuth().then((me) => {
        if (!active) return;
        enforceRouteAccess(window.location.pathname, me);
      });
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [navigate, location.pathname]);

  useEffect(() => {
    if (isBootstrapping) {
      return;
    }
    enforceRouteAccess(location.pathname, getCachedMe());
  }, [isBootstrapping, location.pathname]);

  if (!isBootstrapping || !shouldShowOverlay) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-lg">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <p className="text-sm text-foreground">Signing you in and loading your portal...</p>
      </div>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthBootstrapper />
        <SignInModal />
        <ComplaintModal />
        <TrackComplaintModal />
        <VerifyLicenceModal />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/careers/:jobId" element={<JobDetail />} />
          <Route path="/careers/:jobId/apply" element={<JobApplication />} />
          <Route path="/faqs" element={<Faqs />} />
          <Route path="/about/who-we-are" element={<WhoWeAre />} />
          <Route path="/about/mandate" element={<OurMandate />} />
          <Route path="/about/strategic-plan" element={<StrategicPlan />} />
          <Route path="/about/structure" element={<OrgStructure />} />
          <Route path="/about/annual-reports" element={<AnnualReports />} />
          <Route path="/licensing/how-it-works" element={<HowLicensingWorks />} />
          <Route path="/licensing/fees" element={<LicenceFees />} />
          <Route path="/licensing/verification" element={<LicenceVerification />} />
          <Route path="/licensing/telecommunications" element={<Telecommunications />} />
          <Route path="/licensing/broadcasting" element={<Broadcasting />} />
          <Route path="/licensing/internet-services" element={<InternetServices />} />
          <Route path="/licensing/postal-services" element={<PostalServices />} />
          <Route path="/licensing/spectrum-management" element={<SpectrumManagement />} />
          <Route path="/licensing/interconnection" element={<Interconnection />} />
          <Route path="/resources/policies" element={<PoliciesFrameworks />} />
          <Route path="/resources/legislation" element={<LegislationRegulations />} />
          <Route path="/resources/forms-documents" element={<FormsDocuments />} />
          <Route path="/resources/publications" element={<Publications />} />
          <Route path="/resources/tenders" element={<Tenders />} />
          <Route path="/resources/statistics" element={<Statistics />} />
          <Route path="/resources/consumer-education" element={<ConsumerEducation />} />
          <Route path="/resources/news" element={<News />} />

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
            <Route path="complaints" element={<Complaints />} />
            <Route path="tickets" element={<Tickets />} />
            <Route path="reports" element={<Reports />} />
            <Route path="careers" element={<AdminCareers />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
