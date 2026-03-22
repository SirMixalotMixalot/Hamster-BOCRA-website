import { useState } from "react";
import { Search, Menu, X, ChevronDown, FileText, Shield, Radio, BookOpen, Newspaper, HelpCircle, Building2, Users, Briefcase, Scale, Wifi, Mail as MailIcon, Tv, Package, Globe2, BarChart3, MessageSquare, ExternalLink, Award, ClipboardList, FileCheck, Sparkles } from "lucide-react";
import bocraLogo from "@/assets/bocra-logo.png";
import MegaMenuDrawer from "./MegaMenuDrawer";

const navItems = [
  {
    label: "About BOCRA",
    id: "about",
    sections: [
      {
        title: "Organization",
        items: [
          { icon: Scale, label: "Our Mandate", description: "Learn about our regulatory responsibilities" },
          { icon: Users, label: "Leadership", description: "Meet our Board and Executive team" },
          { icon: Award, label: "Strategic Plan", description: "Our vision for Botswana's digital future" },
          { icon: Briefcase, label: "Careers", description: "Join our team of professionals", action: "navigate:/careers" },
        ],
      },
      {
        title: "Governance",
        items: [
          { icon: Building2, label: "Board of Directors", description: "Our governing body" },
          { icon: FileText, label: "Annual Reports", description: "Financial and operational reports" },
          { icon: BookOpen, label: "Policies", description: "Regulatory policies and frameworks" },
        ],
      },
    ],
  },
  {
    label: "Services",
    id: "services",
    sections: [
      {
        title: "For Citizens",
        items: [
          { icon: MessageSquare, label: "File a Complaint", description: "Report service issues or disputes", action: "toggle-complaint-modal" },
          { icon: Shield, label: "Consumer Rights", description: "Know your rights as a consumer" },
          { icon: BarChart3, label: "Service Quality", description: "Quality of service standards" },
        ],
      },
      {
        title: "For Businesses",
        items: [
          { icon: FileCheck, label: "Licensing", description: "Apply for telecommunications licenses", action: "toggle-signin-modal" },
          { icon: ClipboardList, label: "Type Approval", description: "Get equipment approved for use", action: "toggle-signin-modal" },
          { icon: Wifi, label: "Spectrum Management", description: "Frequency allocation and management" },
          { icon: ExternalLink, label: "Interconnection", description: "Network interconnection guidelines" },
        ],
      },
    ],
  },
  {
    label: "Licensing",
    id: "licensing",
    sections: [
      {
        title: "License Types",
        items: [
          { icon: Wifi, label: "Telecommunications", description: "Fixed and mobile network licenses" },
          { icon: Tv, label: "Broadcasting", description: "Radio and television broadcasting" },
          { icon: Globe2, label: "Internet Services", description: "ISP and data services" },
          { icon: Package, label: "Postal Services", description: "Courier and postal licenses" },
        ],
      },
      {
        title: "Actions",
        items: [
          { icon: FileCheck, label: "Apply for License", description: "Start a new license application", action: "toggle-signin-modal" },
          { icon: ClipboardList, label: "Renew License", description: "Renew an existing license", action: "toggle-signin-modal" },
          { icon: Shield, label: "Verify License", description: "Check license status and validity", action: "toggle-signin-modal" },
          { icon: Scale, label: "Fee Schedule", description: "View licensing fees", action: "toggle-signin-modal" },
          { icon: BarChart3, label: "Track Application", description: "Check your application status", action: "toggle-signin-modal" },
        ],
      },
    ],
  },
  {
    label: "Resources",
    id: "resources",
    sections: [
      {
        title: "Documents",
        items: [
          { icon: BookOpen, label: "Legislation & Regulations", description: "Acts, policies, and guidelines" },
          { icon: FileText, label: "Publications", description: "Reports, studies, and papers" },
          { icon: ClipboardList, label: "Consultations", description: "Draft documents for public comment" },
          { icon: BarChart3, label: "Telecom Statistics", description: "Market data and sector indicators" },
        ],
      },
      {
        title: "News & Media",
        items: [
          { icon: Newspaper, label: "News & Press", description: "Latest announcements and media" },
          { icon: FileText, label: "Public Notices", description: "Official notices and advisories" },
          { icon: Briefcase, label: "Tenders", description: "Procurement opportunities" },
          { icon: MailIcon, label: "Contact BOCRA", description: "Office location, phone, and email", action: "toggle-contact-modal" },
        ],
      },
      {
        title: "Support",
        items: [
          { icon: HelpCircle, label: "FAQs", description: "Frequently asked questions" },
          { icon: FileCheck, label: "Forms & Downloads", description: "Application forms and templates" },
          { icon: BookOpen, label: "Glossary", description: "Telecommunications terms explained" },
        ],
      },
    ],
  },
];

const Header = () => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-bocra-navy shadow-sm">
        <div className="container flex items-center justify-between h-16 md:h-[72px]">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 shrink-0">
            <img src={bocraLogo} alt="BOCRA" className="h-10 w-10 object-contain brightness-200" />
            <div className="hidden sm:block">
              <div className="font-heading font-bold text-white text-sm leading-tight">BOCRA</div>
              <div className="text-[10px] text-white/60 leading-tight">Communications Regulatory Authority</div>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveMenu(activeMenu === item.id ? null : item.id)}
                className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeMenu === item.id ? "bg-white/20 text-white" : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${activeMenu === item.id ? "rotate-180" : ""}`} />
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 rounded-md hover:bg-white/10 transition-colors">
              <Search className="h-5 w-5 text-white/70" />
            </button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("toggle-signin-modal", { detail: { step: "sign-in" } }))}
              className="hidden md:inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-white/10 border border-white/20 text-sm font-medium text-white hover:bg-white/20 transition-colors"
            >
              Apply for License
            </button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("toggle-signin-modal"))}
              className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 border border-white/30 rounded-md text-sm font-medium text-white hover:bg-white/10 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                const event = new CustomEvent("toggle-ai-chatbot");
                window.dispatchEvent(event);
              }}
              className="hidden md:inline-flex items-center gap-2 px-3 py-2 bg-bocra-gold text-bocra-navy rounded-md text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
            >
              <div className="w-6 h-6 rounded-md bg-bocra-navy/20 flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-bocra-navy" />
              </div>
              AI Assistant
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 rounded-md hover:bg-white/10 transition-colors">
              {mobileOpen ? <X className="h-5 w-5 text-white" /> : <Menu className="h-5 w-5 text-white" />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="border-t border-white/10 animate-fade-in">
            <div className="container py-4">
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                <input
                  type="text"
                  placeholder="Search BOCRA services, documents, regulations..."
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-white/20 bg-white/10 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-bocra-gold/30 focus:border-bocra-gold text-sm"
                  autoFocus
                />
              </div>
            </div>
          </div>
        )}

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-white/10 animate-fade-in max-h-[80vh] overflow-y-auto">
            <div className="container py-4 space-y-2">
              {navItems.map((item) => (
                <div key={item.id}>
                  <button
                    onClick={() => setActiveMenu(activeMenu === item.id ? null : item.id)}
                    className="flex items-center justify-between w-full px-3 py-2.5 rounded-md text-sm font-medium text-white/80 hover:bg-white/10"
                  >
                    {item.label}
                    <ChevronDown className={`h-4 w-4 transition-transform ${activeMenu === item.id ? "rotate-180" : ""}`} />
                  </button>
                  {activeMenu === item.id && (
                    <div className="pl-4 space-y-1 animate-fade-in">
                      {item.sections.map((section) =>
                        section.items.map((subItem) => (
                          <a
                            key={subItem.label}
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if ("action" in subItem && subItem.action) {
                                setMobileOpen(false);
                                setActiveMenu(null);
                                if (subItem.action.startsWith("navigate:")) {
                                  window.location.href = subItem.action.replace("navigate:", "");
                                } else {
                                  window.dispatchEvent(new CustomEvent(subItem.action));
                                }
                              }
                            }}
                            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white/60 hover:text-white hover:bg-white/10"
                          >
                            <subItem.icon className="h-4 w-4" />
                            {subItem.label}
                          </a>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))}
              <div className="pt-2 space-y-2 border-t border-white/10">
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    const event = new CustomEvent("toggle-ai-chatbot");
                    window.dispatchEvent(event);
                  }}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-white bg-white/10 rounded-md"
                >
                  <Sparkles className="h-4 w-4" />
                  AI Assistant
                </button>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    window.dispatchEvent(new CustomEvent("toggle-signin-modal", { detail: { step: "sign-in" } }));
                  }}
                  className="block w-full text-center px-4 py-2.5 bg-bocra-gold text-bocra-navy rounded-md text-sm font-semibold"
                >
                  Apply for License
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mega Menu Drawer */}
      <MegaMenuDrawer
        isOpen={activeMenu !== null && !mobileOpen}
        onClose={() => setActiveMenu(null)}
        activeItem={navItems.find((n) => n.id === activeMenu) || null}
      />
    </>
  );
};

export default Header;
