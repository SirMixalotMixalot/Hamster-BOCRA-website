import Header from "@/components/Header";
import BottomBar from "@/components/BottomBar";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Broadcasting = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="min-w-0 flex-1 py-12 md:py-16">
        <section className="container max-w-5xl mx-auto px-4">
          <div className="mb-8 md:mb-10">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-1.5 text-sm text-bocra-teal hover:text-bocra-teal/80 transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </button>
            <div className="flex items-center gap-3">
              <span className="h-4 w-4 rounded-full bg-bocra-teal shrink-0" />
              <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">Broadcasting Licences</h1>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-bocra-teal/5 border-l-4 border-bocra-teal rounded-r-xl p-5">
              <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
                Broadcasting licences regulate content transmission to the public. BOCRA oversees radio and television broadcasting, subscription TV services, and programme distribution across Botswana under the converged licensing framework.
              </p>
            </div>

            {/* CSP Licence */}
            <div className="bg-card border border-border rounded-2xl p-6 hover:border-bocra-teal/30 transition-colors">
              <h2 className="text-base md:text-lg font-semibold text-foreground flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-bocra-teal" />
                Content Services Provider (CSP) Licence
              </h2>
              <p className="mt-2 text-sm md:text-base leading-relaxed text-muted-foreground">For entities that produce or distribute broadcast content such as:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1 text-sm md:text-base leading-relaxed text-muted-foreground">
                <li>Television broadcasting</li>
                <li>Radio broadcasting</li>
                <li>Subscription TV services</li>
                <li>Programme distribution</li>
              </ul>
            </div>

            {/* Types of CSPs */}
            <div className="bg-card border border-border rounded-2xl p-6 hover:border-bocra-teal/30 transition-colors">
              <h2 className="text-base md:text-lg font-semibold text-foreground flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-bocra-teal" />
                Types of Content Services Providers
              </h2>
              <ul className="list-disc pl-5 mt-2 space-y-1.5 text-sm md:text-base leading-relaxed text-muted-foreground">
                <li><span className="font-semibold text-bocra-teal">Commercial Broadcasters:</span> profit-driven broadcasting operations.</li>
                <li><span className="font-semibold text-bocra-teal">Community Broadcasters:</span> non-profit, local focus broadcasting serving specific communities.</li>
                <li><span className="font-semibold text-bocra-teal">Subscription and Signal Distributors:</span> entities providing subscription-based content delivery and signal distribution services.</li>
              </ul>
            </div>

            {/* Licensed Broadcasters */}
            <div className="bg-card border border-border rounded-2xl p-6 hover:border-bocra-teal/30 transition-colors">
              <h2 className="text-base md:text-lg font-semibold text-foreground flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-bocra-teal" />
                Licensed Broadcasters
              </h2>
              <p className="mt-2 text-sm md:text-base leading-relaxed text-muted-foreground">Examples of licensed broadcasters in Botswana include:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1 text-sm md:text-base leading-relaxed text-muted-foreground">
                <li>Yarona FM</li>
                <li>Duma FM</li>
                <li>Gabz FM</li>
                <li>eBotswana</li>
              </ul>
              <p className="mt-2 text-sm md:text-base leading-relaxed text-muted-foreground italic">State broadcasters like Radio Botswana and Botswana Television are exempt from commercial licensing.</p>
            </div>

            {/* Shareholding */}
            <div className="bg-card border border-border rounded-2xl p-6 hover:border-bocra-teal/30 transition-colors">
              <h2 className="text-base md:text-lg font-semibold text-foreground flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-bocra-teal" />
                Shareholding Requirements
              </h2>
              <p className="mt-2 text-sm md:text-base leading-relaxed text-muted-foreground">Certain broadcasting licences have specific citizen shareholding requirements. For example, radio broadcasting licences may require up to 80% citizen shareholding.</p>
            </div>

            {/* General Requirements */}
            <div className="bg-bocra-teal/5 border border-bocra-teal/20 rounded-2xl p-6">
              <h2 className="text-base md:text-lg font-semibold text-foreground flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-bocra-teal" />
                General Requirements
              </h2>
              <p className="mt-2 text-sm md:text-base leading-relaxed text-muted-foreground">Broadcasting licences require:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1.5 text-sm md:text-base leading-relaxed text-muted-foreground">
                <li><span className="font-semibold text-foreground">Fit and proper criteria:</span> good financial standing and governance.</li>
                <li><span className="font-semibold text-foreground">Technical capability:</span> ability to provide services reliably.</li>
                <li><span className="font-semibold text-foreground">Quality of service obligations:</span> minimum performance standards.</li>
                <li>Compliance with content regulation standards.</li>
                <li>Audited Financial Statements within 90 days of the financial year-end.</li>
                <li>Annual operating fee of 1% of net operating revenue for Content Service Providers.</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
      <BottomBar />
    </div>
  );
};

export default Broadcasting;
