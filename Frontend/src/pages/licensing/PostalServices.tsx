import Header from "@/components/Header";
import BottomBar from "@/components/BottomBar";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import postalBg from "@/assets/branding/postal.jpeg";

const PostalServices = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero Banner */}
      <section className="relative flex items-center justify-center -mt-16 py-20 pt-[calc(4rem+5rem)] md:-mt-[72px] md:py-28 md:pt-[calc(4.5rem+7rem)] lg:-mt-[5.75rem] lg:pt-[calc(5.75rem+7rem)]">
        <div className="absolute inset-x-0 -top-1 bottom-0 overflow-hidden">
          <img src={postalBg} alt="" className="h-[calc(100%+4px)] min-h-full w-full -translate-y-px object-cover" />
          <div className="absolute inset-0 bg-black/55" />
        </div>
        <button
          onClick={() => navigate("/")}
          className="absolute left-4 top-[calc(4rem+1rem)] z-10 inline-flex items-center gap-1.5 text-sm text-white/75 transition-colors hover:text-white md:top-[calc(4.5rem+1rem)] lg:top-[calc(5.75rem+1rem)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </button>
        <div className="relative z-10 container max-w-6xl mx-auto px-4 text-center">
          <h1 className="mb-4 text-4xl font-extrabold text-white md:text-5xl">Postal Services Licences</h1>
          <p className="mx-auto max-w-3xl text-lg text-white/85">
            Postal services licences regulate mail and courier services in Botswana.
          </p>
        </div>
      </section>

      <main className="min-w-0 flex-1 py-12 md:py-16">
        <section className="container max-w-5xl mx-auto px-4">
          <div className="space-y-8">
            <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
              BOCRA oversees both the designated national postal operator and commercial courier companies operating within the country.
            </p>

            {/* DPO Licence */}
            <div>
              <h2 className="text-base md:text-lg font-semibold text-foreground">Designated Postal Operator (DPO) Licence</h2>
              <p className="mt-2 text-sm md:text-base leading-relaxed text-muted-foreground">For a national operator with universal service obligations. The DPO is responsible for providing postal services across the country, including to underserved and remote areas.</p>
              <p className="mt-1 text-sm md:text-base leading-relaxed text-muted-foreground"><span className="font-semibold text-foreground">Example of licensee:</span> BotswanaPost.</p>
            </div>

            {/* CPO Licence */}
            <div>
              <h2 className="text-base md:text-lg font-semibold text-foreground">Commercial Postal Operator (CPO) Licence</h2>
              <p className="mt-2 text-sm md:text-base leading-relaxed text-muted-foreground">For courier and value-added logistics services such as:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1 text-sm md:text-base leading-relaxed text-muted-foreground">
                <li>Private courier companies</li>
                <li>Parcel delivery services</li>
                <li>Express mail operators</li>
                <li>Value-added postal logistics</li>
              </ul>
            </div>

            {/* Fees */}
            <div>
              <h2 className="text-base md:text-lg font-semibold text-foreground">Fees</h2>
              <ul className="list-disc pl-5 mt-2 space-y-1.5 text-sm md:text-base leading-relaxed text-muted-foreground">
                <li><span className="font-semibold text-foreground">Application fee:</span> P5,000 + VAT for postal licences.</li>
                <li><span className="font-semibold text-foreground">Renewal fee:</span> P5,000 + VAT.</li>
                <li><span className="font-semibold text-foreground">Annual operating fee:</span> varies by service type.</li>
              </ul>
            </div>

            {/* General Requirements */}
            <div>
              <h2 className="text-base md:text-lg font-semibold text-foreground">General Requirements</h2>
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
