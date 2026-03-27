import Header from "@/components/Header";
import BottomBar from "@/components/BottomBar";
import encyBg from "@/assets/styling/ency.jpg";

const StrategicPlan = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero Banner */}
      <section className="relative flex items-center justify-center -mt-16 py-20 pt-[calc(4rem+5rem)] md:-mt-[72px] md:py-28 md:pt-[calc(4.5rem+7rem)] lg:-mt-[5.75rem] lg:pt-[calc(5.75rem+7rem)]">
        <div className="absolute inset-x-0 -top-1 bottom-0 overflow-hidden">
          <img src={encyBg} alt="" className="h-[calc(100%+4px)] min-h-full w-full -translate-y-px object-cover" />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="relative z-10 container max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Strategic Plan</h1>
          <p className="text-lg text-white/80 max-w-3xl mx-auto">
            BOCRA's vision and strategic direction for a connected, digitally driven society.
          </p>
        </div>
      </section>

      <main className="min-w-0 flex-1 py-12 md:py-16">
        <section className="container max-w-5xl mx-auto px-4">

          <div className="space-y-6">
            <div>
              <h2 className="text-base md:text-lg font-semibold text-foreground">Vision</h2>
              <p className="mt-2 text-sm md:text-base leading-relaxed text-muted-foreground">
                A connected and digitally driven society.
              </p>
            </div>

            <div>
              <h2 className="text-base md:text-lg font-semibold text-foreground">Strategic Direction</h2>
              <p className="mt-2 text-sm md:text-base leading-relaxed text-muted-foreground">
                BOCRA's strategic plan is guided by its vision of a connected and digitally driven society. The plan focuses on regulating the communications sector to promote healthy competition, drive innovation, ensure robust consumer protection, and guarantee universal access for all citizens across Botswana.
              </p>
            </div>

            <div>
              <h2 className="text-base md:text-lg font-semibold text-foreground">Key Focus Areas</h2>
              <p className="mt-2 text-sm md:text-base leading-relaxed text-muted-foreground">
                As a converged regulator overseeing telecommunications, broadcasting, postal services and the internet, BOCRA's strategy centres on fostering private sector investment and innovation, enhancing public knowledge and awareness of the regulated sectors, and ensuring that the needs of low income, rural or disadvantaged groups are taken into account by service providers.
              </p>
            </div>

            <div>
              <h2 className="text-base md:text-lg font-semibold text-foreground">Core Values Driving the Plan</h2>
              <p className="mt-2 text-sm md:text-base leading-relaxed text-muted-foreground">
                The strategic plan is underpinned by four core values: Excellence in regulatory service delivery, Proactiveness in staying ahead of evolving technology trends, Integrity in ensuring transparent and accountable decision making, and People as the primary driver of organizational success.
              </p>
            </div>
          </div>
        </section>
      </main>
      <BottomBar />
    </div>
  );
};

export default StrategicPlan;
