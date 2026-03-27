import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Menu, X, ChevronDown, FileText, Shield, BookOpen, HelpCircle, Users, Briefcase, Scale, Wifi, Tv, Package, Globe2, BarChart3, ExternalLink, Award, ClipboardList, FileCheck, Newspaper, LogIn, Building2, ClipboardCheck, DollarSign, ShieldCheck, ScrollText, GraduationCap, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import bocraLogo from "@/assets/bocra-logo.png";
import MegaMenuDrawer from "./MegaMenuDrawer";
import { SearchResultAction, SearchResultItem, searchContent } from "@/lib/search";
import { getAccessToken, getStoredRole } from "@/lib/auth";
import { useLanguage } from "@/i18n";

type PublicDocumentSection =
  | "news"
  | "tenders"
  | "forms"
  | "publications"
  | "legislation"
  | "annual-reports"
  | "statistics"
  | "uncategorized";

const DOCUMENT_SECTION_ROUTE: Record<PublicDocumentSection, string> = {
  news: "/resources/news",
  tenders: "/resources/tenders",
  forms: "/resources/forms-documents",
  publications: "/resources/publications",
  legislation: "/resources/legislation",
  "annual-reports": "/about/annual-reports",
  statistics: "/resources/statistics",
  uncategorized: "/resources/forms-documents",
};

const navItems = [
  {
    label: "About BOCRA",
    id: "about",
    sections: [
      {
        title: "About",
        items: [
          { icon: Globe2, label: "Overview", description: "Our history, mission, vision and values", action: "navigate:/about/who-we-are" },
          { icon: Scale, label: "Our Mandate", description: "Learn about our regulatory responsibilities", action: "navigate:/about/mandate" },
          { icon: Award, label: "Strategic Plan", description: "Our vision for Botswana's digital future", action: "navigate:/about/strategic-plan" },
        ],
      },
      {
        title: "People",
        items: [
          { icon: Building2, label: "Organisational Structure", description: "Board, executive team and departments", action: "navigate:/about/structure" },
        ],
      },
      {
        title: "Join Us",
        items: [
          { icon: Briefcase, label: "Careers", description: "Join our team of professionals", action: "navigate:/careers" },
        ],
      },
    ],
  },
  {
    label: "Licensing",
    id: "licensing",
    sections: [
      {
        title: "Licensing Process",
        items: [
          { icon: ClipboardCheck, label: "How Licensing Works", description: "Application, renewal and timelines", action: "navigate:/licensing/how-it-works" },
          { icon: DollarSign, label: "Licence Fees", description: "Fee schedule for all licence types", action: "navigate:/licensing/fees" },
          { icon: ShieldCheck, label: "Licence Verification", description: "Verify operator and equipment licences", action: "navigate:/licensing/verification" },
        ],
      },
      {
        title: "License Types",
        items: [
          { icon: Wifi, label: "Telecommunications", description: "Fixed and mobile network licenses", action: "navigate:/licensing/telecommunications" },
          { icon: Tv, label: "Broadcasting", description: "Radio and television broadcasting", action: "navigate:/licensing/broadcasting" },
          { icon: Globe2, label: "Internet Services", description: "ISP and data services", action: "navigate:/licensing/internet-services" },
          { icon: Package, label: "Postal Services", description: "Courier and postal licenses", action: "navigate:/licensing/postal-services" },
        ],
      },
      {
        title: "Spectrum & Interconnection",
        items: [
          { icon: Wifi, label: "Spectrum Management", description: "Frequency allocation and management", action: "navigate:/licensing/spectrum-management" },
          { icon: ExternalLink, label: "Interconnection", description: "Network interconnection guidelines", action: "navigate:/licensing/interconnection" },
        ],
      },
    ],
  },
  {
    label: "Resources",
    id: "resources",
    sections: [
      {
        title: "Legal & Consumer",
        items: [
          { icon: BookOpen, label: "Legislation & Regulations", description: "Acts, policies, and guidelines", action: "navigate:/resources/legislation" },
          { icon: ScrollText, label: "Policies & Frameworks", description: "Regulatory frameworks and guidelines", action: "navigate:/resources/policies" },
          { icon: GraduationCap, label: "Consumer Education", description: "Know your rights and responsibilities", action: "navigate:/resources/consumer-education" },
        ],
      },
      {
        title: "Publications & Forms",
        items: [
          { icon: FileCheck, label: "Forms & Documents", description: "Application forms, templates, and downloadable documents", action: "navigate:/resources/forms-documents" },
          { icon: FileText, label: "Publications", description: "Reports, studies, and papers", action: "navigate:/resources/publications" },
          { icon: FileText, label: "Annual Reports", description: "Yearly performance and sector reports", action: "navigate:/about/annual-reports" },
        ],
      },
      {
        title: "Support",
        items: [
          { icon: HelpCircle, label: "FAQs", description: "Frequently asked questions", action: "navigate:/faqs" },
          { icon: Newspaper, label: "News", description: "Latest announcements and media updates", action: "navigate:/resources/news" },
          { icon: BarChart3, label: "Statistics", description: "Market data and sector indicators", action: "navigate:/resources/statistics" },
          { icon: Briefcase, label: "Tenders", description: "View current procurement opportunities", action: "navigate:/resources/tenders" },
        ],
      },
    ],
  },
  {
    label: "Quick Links",
    id: "quicklinks",
    sections: [
      {
        title: "For Customers",
        items: [
          { icon: FileCheck, label: "Apply for License", description: "Start a new license application", action: "toggle-signin-modal" },
          { icon: ClipboardList, label: "Renew License", description: "Renew an existing license", action: "toggle-signin-modal" },
          { icon: Shield, label: "Verify License", description: "Check license status and validity", action: "toggle-verify-licence-modal" },
        ],
      },
      {
        title: "For General Public",
        items: [
          { icon: ClipboardList, label: "Type Approval", description: "Get equipment approved for use", action: "toggle-signin-modal" },
          { icon: Search, label: "Track Complaint", description: "Check your complaint status", action: "toggle-track-complaint-modal" },
        ],
      },
    ],
  },
];

const Header = () => {
  const navigate = useNavigate();
  const { locale, setLocale, t } = useLanguage();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [hasSubmittedSearch, setHasSubmittedSearch] = useState(false);
  const [authRole, setAuthRole] = useState<string | null>(null);
  const [langOpen, setLangOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const langDesktopRef = useRef<HTMLDivElement | null>(null);
  const langMobileRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const syncAuthRole = () => {
      if (!getAccessToken()) {
        setAuthRole(null);
        return;
      }
      setAuthRole(getStoredRole());
    };

    syncAuthRole();
    window.addEventListener("storage", syncAuthRole);
    return () => window.removeEventListener("storage", syncAuthRole);
  }, []);

  useEffect(() => {
    if (!langOpen) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        langDesktopRef.current?.contains(target) ||
        langMobileRef.current?.contains(target)
      ) return;
      setLangOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [langOpen]);

  const isAuthenticated = !!authRole;
  const portalPath = authRole === "admin" ? "/admin/dashboard" : "/customer/dashboard";
  const portalLabel = authRole === "admin" ? t("header.adminPortal") : t("header.customerPortal");

  const groupedResults = useMemo(() => {
    const grouped: Record<SearchResultItem["type"], SearchResultItem[]> = {
      news: [],
      decision: [],
      document: [],
      service: [],
      page: [],
    };

    for (const result of searchResults) {
      grouped[result.type].push(result);
    }

    return grouped;
  }, [searchResults]);

  const resultGroups = [
    { key: "news" as const, label: "News" },
    { key: "decision" as const, label: "Decisions" },
    { key: "document" as const, label: "Documents" },
    { key: "page" as const, label: "Pages" },
    { key: "service" as const, label: "Services" },
  ];

  useEffect(() => {
    if (!searchOpen) {
      setShowSearchResults(false);
      setSearchError(null);
      setHasSubmittedSearch(false);
    }
  }, [searchOpen]);

  useEffect(() => {
    if (!showSearchResults) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowSearchResults(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (!searchContainerRef.current) {
        return;
      }
      if (!searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSearchResults]);

  const submitSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedQuery = searchQuery.trim();

    if (!trimmedQuery) {
      setSearchError("Enter a search term to continue.");
      setSearchResults([]);
      setHasSubmittedSearch(true);
      setShowSearchResults(true);
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setHasSubmittedSearch(true);
    setShowSearchResults(true);

    try {
      const response = await searchContent(trimmedQuery);
      setSearchResults(response.results);
    } catch (error) {
      setSearchResults([]);
      setSearchError(error instanceof Error ? error.message : "Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchAction = (action?: SearchResultAction) => {
    if (!action) {
      return false;
    }

    switch (action) {
      case "open_signin_modal":
        window.dispatchEvent(new CustomEvent("toggle-signin-modal", { detail: { step: "sign-in" } }));
        return true;
      case "open_contact_modal":
        window.dispatchEvent(new CustomEvent("toggle-contact-modal"));
        return true;
      case "open_ai_chatbot":
        window.dispatchEvent(new CustomEvent("toggle-ai-chatbot"));
        return true;
      case "open_complaint_modal":
        window.dispatchEvent(new CustomEvent("toggle-complaint-modal"));
        return true;
      case "open_verify_licence_modal":
        window.dispatchEvent(new CustomEvent("toggle-verify-licence-modal"));
        return true;
      case "open_services_overlay":
        setActiveMenu("quicklinks");
        setMobileOpen(false);
        return true;
      default:
        return false;
    }
  };

  const handleServiceFallback = (result: SearchResultItem): boolean => {
    const title = result.title.toLowerCase();
    if (title.includes("complaint")) {
      window.dispatchEvent(new CustomEvent("toggle-complaint-modal"));
      return true;
    }
    if (title.includes("verify")) {
      window.dispatchEvent(new CustomEvent("toggle-verify-licence-modal"));
      return true;
    }
    return false;
  };

  const getDocumentTarget = (result: SearchResultItem): string => {
    const match = /^\/documents\/([^/?#]+)/.exec(result.url || "");
    const documentId = match?.[1] ?? null;
    const section = result.section && result.section in DOCUMENT_SECTION_ROUTE ? result.section : "uncategorized";
    const targetPath = DOCUMENT_SECTION_ROUTE[section as PublicDocumentSection];
    if (!documentId) {
      return targetPath;
    }
    return `${targetPath}?docId=${encodeURIComponent(documentId)}`;
  };

  const handleResultClick = (result: SearchResultItem) => {
    setShowSearchResults(false);
    setSearchOpen(false);

    if (result.type === "document") {
      navigate(getDocumentTarget(result));

      return;
    }

    if (result.type === "service" && handleServiceFallback(result)) {
      return;
    }

    const actionHandled = handleSearchAction(result.action);

    if (actionHandled && (!result.url || result.url === "#" || result.url === "/")) {
      return;
    }

    if (!result.url || result.url === "#") {
      return;
    }

    if (result.url.startsWith("http://") || result.url.startsWith("https://")) {
      window.location.href = result.url;
      return;
    }

    navigate(result.url);
  };

  const handleMenuAction = (action?: string) => {
    if (!action) {
      return;
    }

    if (action.startsWith("navigate:")) {
      navigate(action.replace("navigate:", ""));
      return;
    }

    window.dispatchEvent(new CustomEvent(action));
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-transparent shadow-none">
        <div className="hidden lg:block container pt-4 pb-2">
          <div className="group relative rounded-full border border-slate-200/70 bg-white/80 px-6 py-3 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.55)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-[0_28px_65px_-28px_rgba(15,23,42,0.65)]">
            <div className="pointer-events-none absolute inset-y-1 left-1/2 w-48 -translate-x-1/2 rounded-full bg-white/70 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
            <div className="relative z-10 flex items-center justify-between gap-6">
              <button type="button" onClick={() => navigate("/")} className="shrink-0">
                <img src={bocraLogo} alt="BOCRA" className="h-11 w-auto object-contain" />
              </button>

              <nav className="flex items-center gap-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    data-mega-menu-trigger="true"
                    data-menu-id={item.id}
                    onClick={() => setActiveMenu(activeMenu === item.id ? null : item.id)}
                    className={`flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                      activeMenu === item.id
                        ? "bg-slate-900 text-white"
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    {item.label}
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${activeMenu === item.id ? "rotate-180" : ""}`} />
                  </button>
                ))}
              </nav>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                  aria-label="Toggle search"
                >
                  <Search className="h-5 w-5" />
                </button>
                <div className="relative" ref={langDesktopRef}>
                  <button
                    onClick={() => setLangOpen(!langOpen)}
                    className="flex items-center gap-1 rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                    aria-label="Select language"
                  >
                    <Globe className="h-5 w-5" />
                    <ChevronDown className={`h-3 w-3 transition-transform ${langOpen ? "rotate-180" : ""}`} />
                  </button>
                  {langOpen && (
                    <div className="absolute right-0 top-full mt-1 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg animate-fade-in z-50">
                      <button
                        onMouseDown={(e) => { e.stopPropagation(); setLocale("en"); setLangOpen(false); }}
                        className={`flex w-full items-center gap-2 px-4 py-2.5 text-sm transition-colors ${locale === "en" ? "bg-slate-100 font-semibold text-slate-900" : "text-slate-600 hover:bg-slate-50"}`}
                      >
                        English
                      </button>
                      <button
                        onMouseDown={(e) => { e.stopPropagation(); setLocale("tn"); setLangOpen(false); }}
                        className={`flex w-full items-center gap-2 px-4 py-2.5 text-sm transition-colors ${locale === "tn" ? "bg-slate-100 font-semibold text-slate-900" : "text-slate-600 hover:bg-slate-50"}`}
                      >
                        Setswana
                      </button>
                    </div>
                  )}
                </div>
                {isAuthenticated ? (
                  <button
                    onClick={() => navigate(portalPath)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
                  >
                    {portalLabel}
                  </button>
                ) : (
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent("toggle-signin-modal"))}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
                  >
                    {t("header.signIn")}
                  </button>
                )}
                <button
                  onClick={() => {
                    const event = new CustomEvent("toggle-ai-chatbot");
                    window.dispatchEvent(event);
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-bocra-gold px-3.5 py-2 text-sm font-semibold text-bocra-navy shadow-sm transition-all duration-300 hover:opacity-95 hover:shadow-md"
                >
                  {t("header.aiAssistant")}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="container py-3 lg:hidden">
          <div className="group relative overflow-hidden rounded-full border border-slate-200/70 bg-white/80 px-3 py-2 shadow-[0_14px_34px_-24px_rgba(15,23,42,0.6)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-0.5 hover:scale-[1.01]">
            <div className="pointer-events-none absolute inset-y-1 left-1/2 w-40 -translate-x-1/2 rounded-full bg-white/70 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
            <div className="relative z-10 flex h-11 items-center justify-between md:h-12">
              {/* Logo */}
              <button type="button" onClick={() => navigate("/")} className="shrink-0">
                <img src={bocraLogo} alt="BOCRA" className="h-10 w-auto object-contain md:h-11" />
              </button>

              {/* Actions */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                  aria-label="Toggle search"
                >
                  <Search className="h-5 w-5" />
                </button>
                <div className="relative" ref={langMobileRef}>
                  <button
                    onClick={() => setLangOpen(!langOpen)}
                    className="flex items-center gap-1 rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                    aria-label="Select language"
                  >
                    <Globe className="h-5 w-5" />
                    <ChevronDown className={`h-3 w-3 transition-transform ${langOpen ? "rotate-180" : ""}`} />
                  </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-1 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg animate-fade-in z-50">
                  <button
                    onMouseDown={(e) => { e.stopPropagation(); setLocale("en"); setLangOpen(false); }}
                    className={`flex w-full items-center gap-2 px-4 py-2.5 text-sm transition-colors ${locale === "en" ? "bg-slate-100 font-semibold text-slate-900" : "text-slate-600 hover:bg-slate-50"}`}
                  >
                    English
                  </button>
                  <button
                    onMouseDown={(e) => { e.stopPropagation(); setLocale("tn"); setLangOpen(false); }}
                    className={`flex w-full items-center gap-2 px-4 py-2.5 text-sm transition-colors ${locale === "tn" ? "bg-slate-100 font-semibold text-slate-900" : "text-slate-600 hover:bg-slate-50"}`}
                  >
                    Setswana
                  </button>
                </div>
              )}
                </div>
                {isAuthenticated ? (
                  <button
                    onClick={() => navigate(portalPath)}
                    className="rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                    aria-label={portalLabel}
                  >
                    <LogIn className="h-5 w-5" />
                  </button>
                ) : (
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent("toggle-signin-modal"))}
                    className="rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                    aria-label={t("header.signIn")}
                  >
                    <LogIn className="h-5 w-5" />
                  </button>
                )}
                <button onClick={() => setMobileOpen(!mobileOpen)} className="rounded-full p-2 text-slate-700 transition-colors hover:bg-slate-100">
                  {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="animate-fade-in border-t border-slate-200/70">
            <div className="container py-4">
              <div className="relative max-w-2xl mx-auto" ref={searchContainerRef}>
                <form onSubmit={submitSearch}>
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50 lg:text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search BOCRA services, documents, regulations..."
                    className="w-full rounded-lg border border-white/20 bg-white/10 py-3 pl-12 pr-4 text-sm text-white placeholder:text-white/50 focus:border-bocra-gold focus:outline-none focus:ring-2 focus:ring-bocra-gold/30 lg:border-slate-300 lg:bg-white lg:text-slate-900 lg:placeholder:text-slate-500"
                    autoFocus
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    onFocus={() => {
                      if (hasSubmittedSearch) {
                        setShowSearchResults(true);
                      }
                    }}
                  />
                </form>

                {showSearchResults && (
                  <div className="absolute z-50 mt-2 w-full rounded-lg border border-white/15 bg-bocra-navy/95 p-3 shadow-xl backdrop-blur lg:border-slate-200 lg:bg-white/95">
                    {isSearching && (
                      <p className="px-2 py-1 text-sm text-white/80 lg:text-slate-700">Searching...</p>
                    )}

                    {!isSearching && searchError && (
                      <p className="px-2 py-1 text-sm text-red-200 lg:text-red-600">{searchError}</p>
                    )}

                    {!isSearching && !searchError && hasSubmittedSearch && searchResults.length === 0 && (
                      <p className="px-2 py-1 text-sm text-white/70 lg:text-slate-600">No results found.</p>
                    )}

                    {!isSearching && !searchError && searchResults.length > 0 && (
                      <div className="max-h-96 overflow-y-auto space-y-3">
                        {resultGroups.map((group) => {
                          const items = groupedResults[group.key];
                          if (items.length === 0) {
                            return null;
                          }

                          return (
                            <section key={group.key} className="space-y-1">
                              <h4 className="px-2 text-xs font-semibold uppercase tracking-wide text-bocra-gold/90 lg:text-bocra-navy">
                                {group.label}
                              </h4>
                              {items.map((result, index) => (
                                <button
                                  key={`${result.type}-${result.url}-${index}`}
                                  type="button"
                                  onClick={() => handleResultClick(result)}
                                  className="w-full rounded-md px-2 py-2 text-left transition-colors hover:bg-white/10 lg:hover:bg-slate-100"
                                >
                                  <p className="text-sm font-medium text-white lg:text-slate-900">{result.title}</p>
                                  <p className="line-clamp-2 text-xs text-white/70 lg:text-slate-600">{result.snippet}</p>
                                </button>
                              ))}
                            </section>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
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
                                handleMenuAction(subItem.action);
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
                  AI Assistant
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
