import Header from "@/components/Header";
import BottomBar from "@/components/BottomBar";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const StrategicPlan = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="min-w-0 flex-1 py-12 md:py-16">
        <section className="container max-w-5xl mx-auto px-4">
          <div className="mb-8 md:mb-10">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </button>
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">Strategic Plan</h1>
          </div>

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
