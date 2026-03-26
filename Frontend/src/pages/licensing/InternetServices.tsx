import Header from "@/components/Header";
import BottomBar from "@/components/BottomBar";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const InternetServices = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-yellow-50">
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
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">Internet and Data Service Licences</h1>
          </div>

          <div className="space-y-8">
            <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
              Internet and data service licences are legally telecommunications licences but practically apply to internet and digital services. BOCRA regulates ISPs, managed broadband providers, VoIP operators, and cloud service providers under the converged licensing framework.
            </p>

            {/* Services Covered */}
            <div>
              <h2 className="text-base md:text-lg font-semibold text-foreground">Services Covered</h2>
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
            <div>
              <h2 className="text-base md:text-lg font-semibold text-foreground">Applicable Licence Types</h2>
              <p className="mt-2 text-sm md:text-base leading-relaxed text-muted-foreground">While these are legally telecommunications licences, they practically apply to internet and digital services. The relevant licence types include:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1.5 text-sm md:text-base leading-relaxed text-muted-foreground">
                <li><span className="font-semibold text-foreground">SAP Licence:</span> most ISPs operate under a Services and Applications Provider licence.</li>
                <li><span className="font-semibold text-foreground">VANS Licence:</span> Value-Added Network Services over existing infrastructure.</li>
                <li><span className="font-semibold text-foreground">Point-to-Multipoint Licence:</span> required for wireless ISPs distributing broadband wirelessly.</li>
                <li><span className="font-semibold text-foreground">NFP Licence:</span> backbone providers building internet infrastructure fall under Network Facilities Provider.</li>
              </ul>
            </div>

            {/* Fees */}
            <div>
              <h2 className="text-base md:text-lg font-semibold text-foreground">Fees</h2>
              <ul className="list-disc pl-5 mt-2 space-y-1.5 text-sm md:text-base leading-relaxed text-muted-foreground">
                <li><span className="font-semibold text-foreground">Initial fee:</span> P10,000 (once-off) + VAT.</li>
                <li><span className="font-semibold text-foreground">Annual fee:</span> P3,000 per annum + VAT.</li>
                <li><span className="font-semibold text-foreground">Renewal/Application fee:</span> P10,000 + VAT for ISPs.</li>
              </ul>
            </div>

            {/* General Requirements */}
            <div>
              <h2 className="text-base md:text-lg font-semibold text-foreground">General Requirements</h2>
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
