import Header from "@/components/Header";
import BottomBar from "@/components/BottomBar";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PostalServices = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="min-w-0 flex-1 py-12 md:py-16">
        <section className="container max-w-5xl mx-auto px-4">
          <div className="mb-8 md:mb-10">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-1.5 text-sm text-bocra-rose hover:text-bocra-rose/80 transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </button>
            <div className="flex items-center gap-3">
              <span className="h-4 w-4 rounded-full bg-bocra-rose shrink-0" />
              <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">Postal Services Licences</h1>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-bocra-rose/5 border-l-4 border-bocra-rose rounded-r-xl p-5">
              <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
                Postal services licences regulate mail and courier services in Botswana. BOCRA oversees both the designated national postal operator and commercial courier companies operating within the country.
              </p>
            </div>

            {/* DPO Licence */}
            <div className="bg-card border border-border rounded-2xl p-6 hover:border-bocra-rose/30 transition-colors">
              <h2 className="text-base md:text-lg font-semibold text-foreground flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-bocra-rose" />
                Designated Postal Operator (DPO) Licence
              </h2>
              <p className="mt-2 text-sm md:text-base leading-relaxed text-muted-foreground">For a national operator with universal service obligations. The DPO is responsible for providing postal services across the country, including to underserved and remote areas.</p>
              <p className="mt-1 text-sm md:text-base leading-relaxed text-muted-foreground"><span className="font-semibold text-foreground">Example of licensee:</span> BotswanaPost.</p>
            </div>

            {/* CPO Licence */}
            <div className="bg-card border border-border rounded-2xl p-6 hover:border-bocra-rose/30 transition-colors">
              <h2 className="text-base md:text-lg font-semibold text-foreground flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-bocra-rose" />
                Commercial Postal Operator (CPO) Licence
              </h2>
              <p className="mt-2 text-sm md:text-base leading-relaxed text-muted-foreground">For courier and value-added logistics services such as:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1 text-sm md:text-base leading-relaxed text-muted-foreground">
                <li>Private courier companies</li>
                <li>Parcel delivery services</li>
                <li>Express mail operators</li>
                <li>Value-added postal logistics</li>
              </ul>
            </div>

            {/* Fees */}
            <div className="bg-card border border-border rounded-2xl p-6 hover:border-bocra-rose/30 transition-colors">
              <h2 className="text-base md:text-lg font-semibold text-foreground flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-bocra-rose" />
                Fees
              </h2>
              <ul className="list-disc pl-5 mt-2 space-y-1.5 text-sm md:text-base leading-relaxed text-muted-foreground">
                <li><span className="font-semibold text-bocra-rose">Application fee:</span> P5,000 + VAT for postal licences.</li>
                <li><span className="font-semibold text-bocra-rose">Renewal fee:</span> P5,000 + VAT.</li>
                <li><span className="font-semibold text-bocra-rose">Annual operating fee:</span> varies by service type.</li>
              </ul>
            </div>

            {/* General Requirements */}
            <div className="bg-bocra-rose/5 border border-bocra-rose/20 rounded-2xl p-6">
              <h2 className="text-base md:text-lg font-semibold text-foreground flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-bocra-rose" />
                General Requirements
              </h2>
              <p className="mt-2 text-sm md:text-base leading-relaxed text-muted-foreground">Postal services licence applicants must meet:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1.5 text-sm md:text-base leading-relaxed text-muted-foreground">
                <li><span className="font-semibold text-foreground">Legal entity status:</span> the applicant must be a company incorporated in Botswana.</li>
                <li><span className="font-semibold text-foreground">Operational capability:</span> ability to provide reliable mail and courier services across the proposed service area.</li>
                <li><span className="font-semibold text-foreground">Financial viability:</span> 3-year financial projections and proof of funding.</li>
                <li><span className="font-semibold text-foreground">Business plan:</span> a 3-year plan including market analysis, target market, and pricing.</li>
                <li>Tax clearance certificate from BURS.</li>
                <li>Proof of business premises (lease agreement or title deed).</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
      <BottomBar />
    </div>
  );
};

export default PostalServices;
