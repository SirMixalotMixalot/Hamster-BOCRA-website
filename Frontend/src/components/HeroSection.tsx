import { useEffect, useState } from "react";
import { MessageSquare, Shield, BarChart3, ArrowRight, Newspaper, Calendar, ArrowUpRight, ShieldCheck } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import { getHomePublishPayload, type HomeNewsItem, type HomePublishPayload, type HomeStatItem } from "@/lib/homePublishing";

const defaultNewsItems: HomeNewsItem[] = [
  {
    tag: "Public Notice",
    tagColor: "bg-bocra-gold/15 text-bocra-gold",
    date: "10 Jun 2025",
    title: "BOCRA Website Development Hackathon",
    description: "BOCRA invites the public to participate in the upcoming Website Development Hackathon aimed at improving digital service delivery.",
  },
  {
    tag: "Press Release",
    tagColor: "bg-bocra-blue/10 text-bocra-blue",
    date: "5 Jun 2025",
    title: "Botswana Collaborates with Five SADC Member States to Substantially Reduce and Harmonise International Roaming Tariffs",
    description: "In a landmark move, Botswana and five SADC member states have agreed to reduce and harmonise international roaming tariffs across the region.",
  },
  {
    tag: "Media Release",
    tagColor: "bg-bocra-teal/10 text-bocra-teal",
    date: "28 May 2025",
    title: "BOCRA Approves Reduced Data Prices for Botswana Telecommunications Corporation (BTC)",
    description: "BOCRA has approved a reduction in data prices for BTC, a move aimed at making internet access more affordable for Batswana.",
  },
];

const complaintSteps = [
  {
    number: "01",
    title: "Describe the Issue",
    description: "Provide details about the service provider and the nature of your complaint, including relevant dates and evidence.",
  },
  {
    number: "02",
    title: "Submit Your Complaint",
    description: "Fill in the complaint form and attach any supporting documents such as bills, screenshots, or correspondence.",
  },
  {
    number: "03",
    title: "Track Your Case",
    description: "Receive a reference number and monitor the progress of your complaint online until it is resolved.",
  },
];

const licenceSteps = [
  {
    number: "01",
    title: "Enter Licence Details",
    description: "Provide the licence number or the operator's name that you wish to verify in the BOCRA database.",
  },
  {
    number: "02",
    title: "Instant Verification",
    description: "Our system checks against the official BOCRA licence registry in real time, with no delays.",
  },
  {
    number: "03",
    title: "View Licence Status",
    description: "See whether the licence is valid, expired, or suspended, along with the holder's key details.",
  },
];

const typeApprovalSteps = [
  {
    number: "01",
    title: "Submit Application",
    description: "Complete the Type Approval application form and submit required technical documentation and test reports.",
  },
  {
    number: "02",
    title: "Technical Assessment",
    description: "BOCRA engineers assess the equipment against applicable national and international technical standards.",
  },
  {
    number: "03",
    title: "Certification Issued",
    description: "Approved equipment receives an official Type Approval certificate permitting its use in Botswana.",
  },
];

const defaultStatsHighlights: HomeStatItem[] = [
  { value: "4+", label: "Licensed Mobile Operators" },
  { value: "87%", label: "Mobile Penetration Rate" },
  { value: "60%+", label: "Internet Penetration" },
  { value: "200+", label: "Licensed Service Providers" },
];

const heroQuickActions = [
  { label: "Telecommunications", dotClass: "bg-bocra-blue", href: "/licensing/telecommunications" },
  { label: "Broadcasting", dotClass: "bg-bocra-teal", href: "/licensing/broadcasting" },
  { label: "Postal", dotClass: "bg-bocra-rose", href: "/licensing/postal-services" },
  { label: "Internet", dotClass: "bg-bocra-gold", href: "/licensing/internet-services" },
];

const HeroSection = () => {
  const [publishedHomeData, setPublishedHomeData] = useState<HomePublishPayload | null>(null);

  useEffect(() => {
    setPublishedHomeData(getHomePublishPayload());
    const onStorage = () => {
      setPublishedHomeData(getHomePublishPayload());
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onStorage);
    };
  }, []);

  const displayedStats = publishedHomeData?.statsHighlights?.length
    ? publishedHomeData.statsHighlights
    : defaultStatsHighlights;
  const displayedNews = publishedHomeData?.newsItems?.length
    ? publishedHomeData.newsItems
    : defaultNewsItems;

  return (
    <>
      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="relative flex items-center justify-center py-14 md:py-36">
        <div className="absolute inset-0 overflow-hidden">
          <img src={heroBg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/80 to-bocra-navy/70" />

          {/* Wave source 1 — left */}
          <div className="absolute top-[45%] left-[25%] -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <div className="absolute inset-0 w-40 h-40 -ml-20 -mt-20 rounded-full border border-white/20 animate-[transmit_3s_ease-out_infinite]" />
              <div className="absolute inset-0 w-40 h-40 -ml-20 -mt-20 rounded-full border border-white/15 animate-[transmit_3s_ease-out_1s_infinite]" />
              <div className="absolute inset-0 w-40 h-40 -ml-20 -mt-20 rounded-full border border-white/10 animate-[transmit_3s_ease-out_2s_infinite]" />
            </div>
          </div>

          {/* Wave source 2 — right */}
          <div className="absolute top-[43%] right-[17%] -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <div className="absolute inset-0 w-40 h-40 -ml-20 -mt-20 rounded-full border border-white/20 animate-[transmit_3.5s_ease-out_infinite]" />
              <div className="absolute inset-0 w-40 h-40 -ml-20 -mt-20 rounded-full border border-white/15 animate-[transmit_3.5s_ease-out_1.2s_infinite]" />
              <div className="absolute inset-0 w-40 h-40 -ml-20 -mt-20 rounded-full border border-white/10 animate-[transmit_3.5s_ease-out_2.4s_infinite]" />
            </div>
          </div>
        </div>

        <div className="relative z-10 w-full min-w-0 container text-center px-4 mx-auto">
          <h1 className="mx-auto w-full text-center text-[clamp(1.35rem,3vw,3.25rem)] font-extrabold text-white leading-tight mb-6">
            Botswana Communications Regulatory Authority
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10">
            BOCRA oversees telecommunications, broadcasting, internet, and postal services to ensure accessible, affordable, and quality services for all Batswana.
          </p>

          <div
            className="mt-6 sm:mt-10 flex w-full flex-col items-center justify-center gap-4 animate-fade-in-up sm:flex-row"
            style={{ animationDelay: "0.2s" }}
          >
            {heroQuickActions.map((action) => (
              <a
                key={action.label}
                href={action.href}
                className="inline-flex w-full sm:w-auto min-w-[220px] items-center justify-center gap-3 rounded-2xl border border-white/25 bg-white/10 px-6 py-4 text-sm font-semibold uppercase tracking-[0.08em] text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/15"
              >
                <span className={`h-3.5 w-3.5 shrink-0 rounded-full ${action.dotClass}`} />
                <span>{action.label}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FILE A COMPLAINT ──────────────────────────────────── */}
      <section className="pt-14 pb-20 bg-muted/30">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-12 items-start">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 text-primary font-semibold text-sm mb-4">
                <MessageSquare className="h-4 w-4" />
                Consumer Protection
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4 leading-tight">
                Report a service issue with confidence
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                If a telecommunications or postal service provider has failed to meet its obligations, BOCRA is here to help. Our complaint process is straightforward, transparent, and free of charge.
              </p>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("toggle-complaint-modal"))}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all duration-300 hover:scale-[1.02] shadow-md shadow-primary/25"
              >
                File a Complaint <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 space-y-7">
              {complaintSteps.map((step) => (
                <div key={step.number} className="flex gap-5">
                  <div className="text-4xl font-extrabold text-primary/15 leading-none w-12 shrink-0 pt-0.5">
                    {step.number}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground mb-1.5">{step.title}</div>
                    <div className="text-muted-foreground text-sm leading-relaxed">{step.description}</div>
                    {step.number === "03" && (
                      <button
                        onClick={() => window.dispatchEvent(new CustomEvent("toggle-track-complaint-modal"))}
                        className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary/10 text-primary font-semibold text-sm hover:bg-primary/20 transition-all duration-300"
                      >
                        Track Complaint <ArrowRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── VERIFY LICENCE ───────────────────────────────────── */}
      <section className="py-20 bg-background">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="flex flex-col md:flex-row-reverse gap-12 items-start">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 text-bocra-teal font-semibold text-sm mb-4">
                <ShieldCheck className="h-4 w-4" />
                Licence Verification
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4 leading-tight">
                Check the validity of any licence instantly
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                Before engaging a communications service provider, verify that they hold a valid BOCRA licence. Protect yourself and your business from unlicensed operators.
              </p>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("toggle-verify-licence-modal"))}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-bocra-teal text-white font-semibold hover:bg-bocra-teal/90 transition-all duration-300 hover:scale-[1.02] shadow-md"
              >
                Verify a Licence <ArrowRight className="h-4 w-4" />
              </button>
              <a
                href="/licensing/verification"
                className="inline-flex items-center gap-1.5 ml-4 text-sm text-bocra-teal hover:text-bocra-teal/80 transition-colors font-medium"
              >
                Learn more about verification <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
            <div className="flex-1 space-y-7">
              {licenceSteps.map((step) => (
                <div key={step.number} className="flex gap-5">
                  <div className="text-4xl font-extrabold text-bocra-teal/15 leading-none w-12 shrink-0 pt-0.5">
                    {step.number}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground mb-1.5">{step.title}</div>
                    <div className="text-muted-foreground text-sm leading-relaxed">{step.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── TYPE APPROVAL ────────────────────────────────────── */}
      <section className="py-20 bg-background">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-12 items-start">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 text-bocra-blue font-semibold text-sm mb-4">
                <Shield className="h-4 w-4" />
                Equipment Certification
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4 leading-tight">
                Get your equipment type-approved for Botswana
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                All radio communications equipment used in Botswana must be type-approved by BOCRA. Our certification process ensures equipment meets all required safety and technical standards.
              </p>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("toggle-type-approval-modal"))}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-bocra-blue text-white font-semibold hover:bg-bocra-blue/90 transition-all duration-300 hover:scale-[1.02] shadow-md"
              >
                Apply for Type Approval <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 space-y-7">
              {typeApprovalSteps.map((step) => (
                <div key={step.number} className="flex gap-5">
                  <div className="text-4xl font-extrabold text-bocra-blue/15 leading-none w-12 shrink-0 pt-0.5">
                    {step.number}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground mb-1.5">{step.title}</div>
                    <div className="text-muted-foreground text-sm leading-relaxed">{step.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATISTICS + NEWS ────────────────────────────────── */}
      <section className="py-20 bg-background">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-8 lg:gap-10 items-start">
            <div className="bg-muted/30 rounded-3xl p-6 md:p-8 border border-border/60">
              <div className="inline-flex items-center gap-2 text-primary font-semibold text-sm mb-4">
                <BarChart3 className="h-4 w-4" />
                Market Data
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
                Botswana's communications sector at a glance
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                BOCRA publishes regular statistics and market indicators to promote transparency and informed decision-making across the communications sector.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {displayedStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-card rounded-2xl p-5 border border-border text-center hover:border-primary/30 hover:shadow-md transition-all duration-300"
                  >
                    <div className="text-3xl md:text-4xl font-extrabold text-primary mb-2">{stat.value}</div>
                    <div className="text-muted-foreground text-sm leading-snug">{stat.label}</div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("toggle-telecom-stats-modal"))}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all duration-300 hover:scale-[1.02] shadow-md shadow-primary/25"
              >
                View Full Statistics <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="bg-card rounded-3xl p-6 md:p-8 border border-border">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <div className="inline-flex items-center gap-2 text-bocra-rose font-semibold text-sm mb-3">
                    <Newspaper className="h-4 w-4" />
                    Latest News
                  </div>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-foreground">Latest news from BOCRA</h2>
                </div>
                <a href="/resources/news" className="hidden md:inline-flex items-center gap-1 text-sm text-primary font-medium hover:underline">
                  View all news <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
              <div className="space-y-4">
                {displayedNews.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl p-5 border border-border"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full ${item.tagColor}`}>
                        {item.tag}
                      </span>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {item.date}
                      </span>
                    </div>
                    <div className="font-semibold text-foreground mb-2 leading-snug">
                      {item.title}
                    </div>
                    <div className="text-sm text-muted-foreground leading-relaxed">{item.description}</div>
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center md:hidden">
                <a href="/resources/news" className="inline-flex items-center gap-1 text-sm text-primary font-medium hover:underline">
                  View all news <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

    </>
  );
};

export default HeroSection;
