import { useState } from "react";
import { MessageSquare, Shield, BarChart3, BookOpen, ArrowRight, ChevronDown, ClipboardList, Radio, Newspaper, Calendar, ArrowUpRight, Wifi, Tv, Package, Globe2, HelpCircle, ExternalLink, X, Scale, ShieldCheck } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const serviceColumns = [
  {
    title: "Consumer Services",
    items: [
      { icon: MessageSquare, label: "File a Complaint", description: "Submit a formal complaint against a provider", action: "toggle-complaint-modal" },
      { icon: HelpCircle, label: "Consumer Education", description: "Know your rights and protections" },
      { icon: BarChart3, label: "Statistics", description: "Market data and sector indicators", action: "toggle-telecom-stats-modal" },
      { icon: ExternalLink, label: "Tools & Portals", description: "Access external BOCRA systems" },
    ],
  },
  {
    title: "Regulatory Services",
    items: [
      { icon: Shield, label: "Type Approval", description: "Equipment certification and approval" },
      { icon: Radio, label: "Spectrum Management", description: "Frequency planning and allocation" },
      { icon: BookOpen, label: "Regulations", description: "Acts, policies, and guidelines" },
      { icon: ClipboardList, label: "Public Consultations", description: "Draft documents for public comment" },
    ],
  },
  {
    title: "Sectors We Regulate",
    items: [
      { icon: Wifi, label: "Telecommunications", description: "Mobile, fixed-line, and data services" },
      { icon: Tv, label: "Broadcasting", description: "Radio and television regulation" },
      { icon: Package, label: "Postal Services", description: "Postal and courier services oversight" },
      { icon: Globe2, label: "Internet & ICT", description: "Internet services and .bw domain" },
    ],
  },
];

const newsItems = [
  {
    tag: "Press Release",
    tagColor: "bg-bocra-blue/10 text-bocra-blue",
    date: "18 Mar 2026",
    title: "BOCRA Launches New Consumer Protection Framework",
    description: "New measures to safeguard consumer rights in the telecommunications sector have been announced by the Authority.",
  },
  {
    tag: "Public Notice",
    tagColor: "bg-bocra-gold/15 text-bocra-gold",
    date: "15 Mar 2026",
    title: "Public Consultation on 5G Spectrum Allocation",
    description: "Stakeholders are invited to comment on the proposed 5G spectrum allocation plan before the April deadline.",
  },
  {
    tag: "Announcement",
    tagColor: "bg-bocra-teal/10 text-bocra-teal",
    date: "10 Mar 2026",
    title: "Annual Report 2025 Now Available",
    description: "Download the latest annual report covering Botswana's communications sector performance and growth.",
  },
  {
    tag: "Tender",
    tagColor: "bg-bocra-rose/10 text-bocra-rose",
    date: "8 Mar 2026",
    title: "Procurement: Network Quality Monitoring System",
    description: "BOCRA invites qualified vendors to submit bids for a national network quality monitoring solution.",
  },
];

const row1Buttons = [
  { label: "File a Complaint", description: "Report a service provider issue", icon: MessageSquare, event: "toggle-complaint-modal" },
  { label: "Verify Licence", description: "Check licence validity", icon: ShieldCheck, event: "toggle-verify-licence-modal" },
  { label: "Type Approval", description: "Equipment certification", icon: Shield, event: "toggle-type-approval-modal" },
];

const row2Buttons = [
  { label: "Consumer Rights", description: "Know your protections", icon: Scale, event: "" },
  { label: "Statistics", description: "Market data & indicators", icon: BarChart3, event: "toggle-telecom-stats-modal" },
  { label: "News", description: "Latest updates & notices", icon: Newspaper, event: "__news__" },
];

const HeroSection = () => {
  const [exploreOpen, setExploreOpen] = useState(false);
  const [newsOpen, setNewsOpen] = useState(false);

  return (
    <section className="relative h-full flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/80 to-bocra-navy/70" />

        {/* Tower transmission waves */}
        {/* Wave source 1 — left tower */}
        <div className="absolute top-[45%] left-[25%] -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="absolute inset-0 w-40 h-40 -ml-20 -mt-20 rounded-full border border-white/20 animate-[transmit_3s_ease-out_infinite]" />
            <div className="absolute inset-0 w-40 h-40 -ml-20 -mt-20 rounded-full border border-white/15 animate-[transmit_3s_ease-out_1s_infinite]" />
            <div className="absolute inset-0 w-40 h-40 -ml-20 -mt-20 rounded-full border border-white/10 animate-[transmit_3s_ease-out_2s_infinite]" />
          </div>
        </div>

        {/* Wave source 2 — right tower */}
        <div className="absolute top-[43%] right-[17%] -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="absolute inset-0 w-40 h-40 -ml-20 -mt-20 rounded-full border border-white/20 animate-[transmit_3.5s_ease-out_infinite]" />
            <div className="absolute inset-0 w-40 h-40 -ml-20 -mt-20 rounded-full border border-white/15 animate-[transmit_3.5s_ease-out_1.2s_infinite]" />
            <div className="absolute inset-0 w-40 h-40 -ml-20 -mt-20 rounded-full border border-white/10 animate-[transmit_3.5s_ease-out_2.4s_infinite]" />
          </div>
        </div>
      </div>

      {/* Content — centered */}
      <div className="relative z-10 container flex flex-col items-center text-center px-4">
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-bocra-navy leading-tight animate-fade-in-up whitespace-nowrap">
          Botswana Communications Regulatory Authority
        </h1>
        <p className="mt-4 text-base md:text-lg text-primary-foreground/80 max-w-2xl animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          BOCRA oversees telecommunications, broadcasting, internet, and postal services to ensure accessible, affordable, and quality services for all Batswana.
        </p>

        {/* Row 1 — File a Complaint, Verify Licence, Type Approval */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-3xl animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          {row1Buttons.map((btn) => (
            <button
              key={btn.label}
              onClick={() => window.dispatchEvent(new CustomEvent(btn.event))}
              className="group flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                <btn.icon className="h-5 w-5 text-white" />
              </div>
              <div className="text-left flex-1 min-w-0">
                <div className="text-sm font-semibold text-primary-foreground">{btn.label}</div>
                <div className="text-[11px] text-primary-foreground/60 truncate">{btn.description}</div>
              </div>
              <ArrowRight className="h-4 w-4 text-primary-foreground/50 group-hover:text-bocra-gold group-hover:translate-x-1 transition-all duration-300 shrink-0" />
            </button>
          ))}
        </div>

        {/* Row 2 — Consumer Rights, Telecom Stats, News */}
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-3xl animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          {row2Buttons.map((btn) => (
            <button
              key={btn.label}
              onClick={() => {
                if (btn.event === "__news__") {
                  setNewsOpen(!newsOpen);
                  setExploreOpen(false);
                } else if (btn.event) {
                  window.dispatchEvent(new CustomEvent(btn.event));
                }
              }}
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl backdrop-blur-md border transition-all duration-300 hover:scale-[1.02] ${
                btn.event === "__news__" && newsOpen
                  ? "bg-white/20 border-white/30"
                  : "bg-white/10 border-white/20 hover:bg-white/20"
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                <btn.icon className="h-5 w-5 text-white" />
              </div>
              <div className="text-left flex-1 min-w-0">
                <div className="text-sm font-semibold text-primary-foreground">{btn.label}</div>
                <div className="text-[11px] text-primary-foreground/60 truncate">{btn.description}</div>
              </div>
              {btn.event === "__news__" ? (
                <ChevronDown className={`h-4 w-4 text-primary-foreground/50 transition-transform duration-300 shrink-0 ${newsOpen ? "rotate-180" : ""}`} />
              ) : (
                <ArrowRight className="h-4 w-4 text-primary-foreground/50 group-hover:text-bocra-gold group-hover:translate-x-1 transition-all duration-300 shrink-0" />
              )}
            </button>
          ))}
        </div>

      </div>

      {/* Explore Services Overlay */}
      {exploreOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="relative w-[90vw] max-w-5xl max-h-[80vh] bg-card rounded-2xl shadow-2xl border border-border overflow-auto animate-scale-in">
            <div className="sticky top-0 bg-card z-10 px-6 py-4 border-b border-border flex items-center justify-between">
              <span className="text-lg font-semibold text-foreground">Explore BOCRA Services</span>
              <button
                onClick={() => setExploreOpen(false)}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
              {serviceColumns.map((col) => (
                <div key={col.title} className="p-5">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">{col.title}</div>
                  <div className="space-y-1">
                    {col.items.map((item) => (
                      <a
                        key={item.label}
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if ("action" in item && item.action) {
                            setExploreOpen(false);
                            if (item.action.startsWith("navigate:")) {
                              window.location.href = item.action.replace("navigate:", "");
                            } else {
                              window.dispatchEvent(new CustomEvent(item.action));
                            }
                          }
                        }}
                        className="flex items-start gap-3 px-3 py-3 rounded-lg hover:bg-primary/5 transition-colors group"
                      >
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-primary/15 transition-colors">
                          <item.icon className="h-4.5 w-4.5 text-primary" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{item.label}</div>
                          <div className="text-xs text-muted-foreground leading-snug mt-0.5">{item.description}</div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-border flex justify-center">
              <a href="#" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
                View all services <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* News Overlay */}
      {newsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="relative w-[90vw] max-w-5xl max-h-[80vh] bg-card rounded-2xl shadow-2xl border border-border overflow-auto animate-scale-in">
            <div className="sticky top-0 bg-card z-10 px-6 py-4 border-b border-border flex items-center justify-between">
              <span className="text-lg font-semibold text-foreground">Latest News & Notices</span>
              <button
                onClick={() => setNewsOpen(false)}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2">
              {newsItems.map((item) => (
                <a key={item.title} href="#" className="block px-6 py-5 hover:bg-primary/5 transition-colors group border-b border-r border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${item.tagColor}`}>{item.tag}</span>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {item.date}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors mb-1.5">{item.title}</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">{item.description}</div>
                </a>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-border flex justify-center">
              <a href="#" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
                View all news <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};

export default HeroSection;
