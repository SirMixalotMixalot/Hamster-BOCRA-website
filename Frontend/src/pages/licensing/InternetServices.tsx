import Header from "@/components/Header";
import BottomBar from "@/components/BottomBar";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const InternetServices = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="min-w-0 flex-1 py-12 md:py-16">
        <section className="container max-w-5xl mx-auto px-4">
          <div className="mb-8 md:mb-10">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-1.5 text-sm text-bocra-gold hover:text-bocra-gold/80 transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </button>
            <div className="flex items-center gap-3">
              <span className="h-4 w-4 rounded-full bg-bocra-gold shrink-0" />
              <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">Internet and Data Service Licences</h1>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-bocra-gold/5 border-l-4 border-bocra-gold rounded-r-xl p-5">
              <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
                Internet and data service licences are legally telecommunications licences but practically apply to internet and digital services. BOCRA regulates ISPs, managed broadband providers, VoIP operators, and cloud service providers under the converged licensing framework.
              </p>
            </div>

            {/* Services Covered */}
            <div className="bg-card border border-border rounded-2xl p-6 hover:border-bocra-gold/30 transition-colors">
              <h2 className="text-base md:text-lg font-semibold text-foreground flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-bocra-gold" />
                Services Covered
              </h2>
              <p className="mt-2 text-sm md:text-base leading-relaxed text-muted-foreground">Internet and data service licences cover the following:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1 text-sm md:text-base leading-relaxed text-muted-foreground">
                <li>Internet Service Providers (ISPs)</li>
                <li>Managed broadband services</li>
                <li>VoIP providers</li>
                <li>Data roaming services</li>
                <li>Cloud and hosting services</li>
              </ul>
            </div>

            {/* Applicable Licence Types */}
            <div className="bg-card border border-border rounded-2xl p-6 hover:border-bocra-gold/30 transition-colors">
              <h2 className="text-base md:text-lg font-semibold text-foreground flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-bocra-gold" />
                Applicable Licence Types
              </h2>
              <p className="mt-2 text-sm md:text-base leading-relaxed text-muted-foreground">While these are legally telecommunications licences, they practically apply to internet and digital services. The relevant licence types include:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1.5 text-sm md:text-base leading-relaxed text-muted-foreground">
                <li><span className="font-semibold text-bocra-gold">SAP Licence:</span> most ISPs operate under a Services and Applications Provider licence.</li>
                <li><span className="font-semibold text-bocra-gold">VANS Licence:</span> Value-Added Network Services over existing infrastructure.</li>
                <li><span className="font-semibold text-bocra-gold">Point-to-Multipoint Licence:</span> required for wireless ISPs distributing broadband wirelessly.</li>
                <li><span className="font-semibold text-bocra-gold">NFP Licence:</span> backbone providers building internet infrastructure fall under Network Facilities Provider.</li>
              </ul>
            </div>

            {/* Fees */}
            <div className="bg-card border border-border rounded-2xl p-6 hover:border-bocra-gold/30 transition-colors">
              <h2 className="text-base md:text-lg font-semibold text-foreground flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-bocra-gold" />
                Fees
              </h2>
              <ul className="list-disc pl-5 mt-2 space-y-1.5 text-sm md:text-base leading-relaxed text-muted-foreground">
                <li><span className="font-semibold text-bocra-gold">Initial fee:</span> P10,000 (once-off) + VAT.</li>
                <li><span className="font-semibold text-bocra-gold">Annual fee:</span> P3,000 per annum + VAT.</li>
                <li><span className="font-semibold text-bocra-gold">Renewal/Application fee:</span> P10,000 + VAT for ISPs.</li>
              </ul>
            </div>

            {/* General Requirements */}
            <div className="bg-bocra-gold/5 border border-bocra-gold/20 rounded-2xl p-6">
              <h2 className="text-base md:text-lg font-semibold text-foreground flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-bocra-gold" />
                General Requirements
              </h2>
              <p className="mt-2 text-sm md:text-base leading-relaxed text-muted-foreground">Internet and data service licence applicants must meet:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1.5 text-sm md:text-base leading-relaxed text-muted-foreground">
                <li><span className="font-semibold text-foreground">Legal entity status:</span> the applicant must be a company incorporated in Botswana.</li>
                <li><span className="font-semibold text-foreground">Technical capability:</span> ability to provide services reliably, including network diagrams and technical specifications.</li>
                <li><span className="font-semibold text-foreground">Financial viability:</span> 3-year financial projections and proof of funding.</li>
                <li><span className="font-semibold text-foreground">Business plan:</span> a 3-year plan including market analysis, target market, and pricing.</li>
                <li>Tax clearance certificate from BURS.</li>
                <li>Certified copy of the Certificate of Incorporation and latest Annual Returns from CIPA.</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
      <BottomBar />
    </div>
  );
};

export default InternetServices;
