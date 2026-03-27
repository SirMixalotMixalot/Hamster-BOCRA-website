import { useEffect, useMemo, useState } from "react";
import { MessageSquare, Shield, BarChart3, ArrowRight, Newspaper, Calendar, ArrowUpRight, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import newsImage1 from "@/assets/news/news1.jpg";
import newsImage2 from "@/assets/news/news2.jpg";
import newsImage3 from "@/assets/news/news3.jpg";
import { getHomePublishPayload, type HomeNewsItem, type HomePublishPayload, type HomeStatItem } from "@/lib/homePublishing";
import { useLanguage } from "@/i18n";

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

const newsCarouselImages = [newsImage1, newsImage2, newsImage3];

const HeroSection = () => {
  const { t, locale } = useLanguage();

  const complaintSteps = useMemo(() => [
    { number: "01", title: t("complaint.step1.title"), description: t("complaint.step1.description") },
    { number: "02", title: t("complaint.step2.title"), description: t("complaint.step2.description") },
    { number: "03", title: t("complaint.step3.title"), description: t("complaint.step3.description") },
  ], [locale]);

  const licenceSteps = useMemo(() => [
    { number: "01", title: t("licence.step1.title"), description: t("licence.step1.description") },
    { number: "02", title: t("licence.step2.title"), description: t("licence.step2.description") },
    { number: "03", title: t("licence.step3.title"), description: t("licence.step3.description") },
  ], [locale]);

  const typeApprovalSteps = useMemo(() => [
    { number: "01", title: t("typeApproval.step1.title"), description: t("typeApproval.step1.description") },
    { number: "02", title: t("typeApproval.step2.title"), description: t("typeApproval.step2.description") },
    { number: "03", title: t("typeApproval.step3.title"), description: t("typeApproval.step3.description") },
  ], [locale]);

  const defaultStatsHighlights: HomeStatItem[] = useMemo(() => [
    { value: "4+", label: t("stats.licensedMobileOperators") },
    { value: "87%", label: t("stats.mobilePenetration") },
    { value: "60%+", label: t("stats.internetPenetration") },
    { value: "200+", label: t("stats.licensedProviders") },
  ], [locale]);

  const heroQuickActions = useMemo(() => [
    { label: t("hero.telecommunications"), dotClass: "bg-bocra-blue", href: "/licensing/telecommunications" },
    { label: t("hero.broadcasting"), dotClass: "bg-bocra-teal", href: "/licensing/broadcasting" },
    { label: t("hero.postal"), dotClass: "bg-bocra-rose", href: "/licensing/postal-services" },
    { label: t("hero.internet"), dotClass: "bg-bocra-gold", href: "/licensing/internet-services" },
  ], [locale]);
  const [publishedHomeData, setPublishedHomeData] = useState<HomePublishPayload | null>(null);
  const [activeNewsIndex, setActiveNewsIndex] = useState(0);

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
  const carouselNewsItems = displayedNews.slice(0, 3);
  const activeNewsItem = carouselNewsItems[activeNewsIndex] ?? null;

  useEffect(() => {
    if (carouselNewsItems.length === 0) {
      return;
    }
    setActiveNewsIndex((currentIndex) => {
      if (currentIndex < carouselNewsItems.length) {
        return currentIndex;
      }
      return 0;
    });
  }, [carouselNewsItems.length]);

  useEffect(() => {
    if (carouselNewsItems.length <= 1) {
      return;
    }
    const rotationTimer = window.setInterval(() => {
      setActiveNewsIndex((currentIndex) => (currentIndex + 1) % carouselNewsItems.length);
    }, 6000);
    return () => window.clearInterval(rotationTimer);
  }, [carouselNewsItems.length]);

  const showPreviousNews = () => {
    setActiveNewsIndex((currentIndex) => (currentIndex - 1 + carouselNewsItems.length) % carouselNewsItems.length);
  };

  const showNextNews = () => {
    setActiveNewsIndex((currentIndex) => (currentIndex + 1) % carouselNewsItems.length);
  };

  return (
    <>
      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="relative flex items-center justify-center -mt-16 pb-14 pt-[calc(4rem+3.5rem)] md:-mt-[72px] md:pb-36 md:pt-[calc(4.5rem+9rem)] lg:-mt-[5.75rem] lg:pt-[calc(5.75rem+9rem)]">
        <div className="absolute inset-x-0 -top-1 bottom-0 overflow-hidden">
          <img src={heroBg} alt="" className="h-[calc(100%+4px)] min-h-full w-full -translate-y-px object-cover" />
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
          <div className="absolute top-0 right-[17%] -translate-x-1/2">
            <div className="relative">
              <div className="absolute inset-0 w-40 h-40 -ml-20 -mt-20 rounded-full border border-white/20 animate-[transmit_3.5s_ease-out_infinite]" />
              <div className="absolute inset-0 w-40 h-40 -ml-20 -mt-20 rounded-full border border-white/15 animate-[transmit_3.5s_ease-out_1.2s_infinite]" />
              <div className="absolute inset-0 w-40 h-40 -ml-20 -mt-20 rounded-full border border-white/10 animate-[transmit_3.5s_ease-out_2.4s_infinite]" />
            </div>
          </div>
        </div>

        <div className="relative z-10 w-full min-w-0 container text-center px-4 mx-auto">
          <h1 className="mx-auto w-full text-center text-[clamp(1.35rem,3vw,3.25rem)] font-extrabold text-white leading-tight mb-6">
            {t("hero.title")}
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10">
            {t("hero.subtitle")}
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
                {t("complaint.badge")}
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4 leading-tight">
                {t("complaint.heading")}
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                {t("complaint.description")}
              </p>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("toggle-complaint-modal"))}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all duration-300 hover:scale-[1.02] shadow-md shadow-primary/25"
              >
                {t("complaint.cta")} <ArrowRight className="h-4 w-4" />
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
                        {t("complaint.trackCta")} <ArrowRight className="h-4 w-4" />
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
                {t("licence.badge")}
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4 leading-tight">
                {t("licence.heading")}
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                {t("licence.description")}
              </p>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("toggle-verify-licence-modal"))}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-bocra-teal text-white font-semibold hover:bg-bocra-teal/90 transition-all duration-300 hover:scale-[1.02] shadow-md"
              >
                {t("licence.cta")} <ArrowRight className="h-4 w-4" />
              </button>
              <a
                href="/licensing/verification"
                className="inline-flex items-center gap-1.5 ml-4 text-sm text-bocra-teal hover:text-bocra-teal/80 transition-colors font-medium"
              >
                {t("licence.learnMore")} <ArrowRight className="h-3.5 w-3.5" />
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
                {t("typeApproval.badge")}
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4 leading-tight">
                {t("typeApproval.heading")}
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                {t("typeApproval.description")}
              </p>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("toggle-type-approval-modal"))}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-bocra-blue text-white font-semibold hover:bg-bocra-blue/90 transition-all duration-300 hover:scale-[1.02] shadow-md"
              >
                {t("typeApproval.cta")} <ArrowRight className="h-4 w-4" />
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
                {t("stats.badge")}
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
                {t("stats.heading")}
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                {t("stats.description")}
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
                {t("stats.cta")} <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="bg-card rounded-xl border border-border py-6 shadow-sm transition-shadow hover:shadow-lg overflow-hidden">
              <div className="flex items-end justify-between mb-8">
                <div className="px-6 md:px-8">
                  <div className="inline-flex items-center gap-2 text-bocra-rose font-semibold text-sm mb-3">
                    <Newspaper className="h-4 w-4" />
                    {t("news.badge")}
                  </div>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-foreground">{t("news.heading")}</h2>
                </div>
                <a href="/resources/news" className="hidden md:inline-flex items-center gap-1 text-sm text-primary font-medium hover:underline pr-6 md:pr-8">
                  {t("news.viewAll")} <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>

              {activeNewsItem && (
                <div className="px-6 md:px-8">
                  <article className="overflow-hidden rounded-xl border border-border/80 bg-background/60">
                    <div className="relative">
                      <img
                        src={newsCarouselImages[activeNewsIndex % newsCarouselImages.length]}
                        alt={activeNewsItem.title}
                        className="h-56 w-full object-cover"
                      />
                      {carouselNewsItems.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={showPreviousNews}
                            className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-black/35 text-white transition-colors hover:bg-black/55"
                            aria-label="Previous news item"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={showNextNews}
                            className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-black/35 text-white transition-colors hover:bg-black/55"
                            aria-label="Next news item"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>

                    <div className="p-5">
                      <div className="mb-3 flex items-center gap-2">
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${activeNewsItem.tagColor}`}>
                          {activeNewsItem.tag}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {activeNewsItem.date}
                        </span>
                      </div>
                      <h3 className="mb-2 font-semibold leading-snug text-foreground">
                        {activeNewsItem.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">{activeNewsItem.description}</p>
                    </div>
                  </article>

                  {carouselNewsItems.length > 1 && (
                    <div className="mt-4 flex items-center justify-center gap-2">
                      {carouselNewsItems.map((item, index) => (
                        <button
                          key={`${item.title}-${index}`}
                          type="button"
                          onClick={() => setActiveNewsIndex(index)}
                          className={`h-2.5 rounded-full transition-all ${
                            index === activeNewsIndex ? "w-6 bg-primary" : "w-2.5 bg-border hover:bg-muted-foreground/50"
                          }`}
                          aria-label={`Show news item ${index + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 text-center md:hidden">
                <a href="/resources/news" className="inline-flex items-center gap-1 text-sm text-primary font-medium hover:underline">
                  {t("news.viewAll")} <ArrowUpRight className="h-3.5 w-3.5" />
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
