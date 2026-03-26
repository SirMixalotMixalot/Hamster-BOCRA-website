import Header from "@/components/Header";
import BottomBar from "@/components/BottomBar";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Broadcasting = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-green-100">
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
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">Broadcasting Licences</h1>
          </div>

          <div className="space-y-8">
            <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
              Broadcasting licences regulate content transmission to the public. BOCRA oversees radio and television broadcasting, subscription TV services, and programme distribution across Botswana under the converged licensing framework.
            </p>

            {/* CSP Licence */}
            <div>
              <h2 className="text-base md:text-lg font-semibold text-foreground">Content Services Provider (CSP) Licence</h2>
              <p className="mt-2 text-sm md:text-base leading-relaxed text-muted-foreground">For entities that produce or distribute broadcast content such as:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1 text-sm md:text-base leading-relaxed text-muted-foreground">
                <li>Television broadcasting</li>
                <li>Radio broadcasting</li>
                <li>Subscription TV services</li>
                <li>Programme distribution</li>
              </ul>
            </div>

            {/* Types of CSPs */}
            <div>
              <h2 className="text-base md:text-lg font-semibold text-foreground">Types of Content Services Providers</h2>
              <ul className="list-disc pl-5 mt-2 space-y-1.5 text-sm md:text-base leading-relaxed text-muted-foreground">
                <li><span className="font-semibold text-foreground">Commercial Broadcasters:</span> profit-driven broadcasting operations.</li>
                <li><span className="font-semibold text-foreground">Community Broadcasters:</span> non-profit, local focus broadcasting serving specific communities.</li>
                <li><span className="font-semibold text-foreground">Subscription and Signal Distributors:</span> entities providing subscription-based content delivery and signal distribution services.</li>
              </ul>
            </div>

            {/* Licensed Broadcasters */}
            <div>
              <h2 className="text-base md:text-lg font-semibold text-foreground">Licensed Broadcasters</h2>
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
            <div>
              <h2 className="text-base md:text-lg font-semibold text-foreground">Shareholding Requirements</h2>
              <p className="mt-2 text-sm md:text-base leading-relaxed text-muted-foreground">Certain broadcasting licences have specific citizen shareholding requirements. For example, radio broadcasting licences may require up to 80% citizen shareholding.</p>
            </div>

            {/* General Requirements */}
            <div>
              <h2 className="text-base md:text-lg font-semibold text-foreground">General Requirements</h2>
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
