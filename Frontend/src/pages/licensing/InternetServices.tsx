import Header from "@/components/Header";
import BottomBar from "@/components/BottomBar";
import internetBg from "@/assets/branding/internet.jpg";

const InternetServices = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero Banner */}
      <section className="relative flex items-center justify-center -mt-16 py-20 pt-[calc(4rem+5rem)] md:-mt-[72px] md:py-28 md:pt-[calc(4.5rem+7rem)] lg:-mt-[5.75rem] lg:pt-[calc(5.75rem+7rem)]">
        <div className="absolute inset-x-0 -top-1 bottom-0 overflow-hidden">
          <img src={internetBg} alt="" className="h-[calc(100%+4px)] min-h-full w-full -translate-y-px object-cover" />
          <div className="absolute inset-0 bg-black/55" />
        </div>
        <div className="relative z-10 container max-w-6xl mx-auto px-4 text-center">
          <h1 className="mb-4 text-4xl font-extrabold text-white md:text-5xl">Internet and Data Service Licences</h1>
          <p className="mx-auto max-w-3xl text-lg text-white/85">
            Internet and data service licences are legally telecommunications licences but practically apply to internet and digital services.
          </p>
        </div>
      </section>

      <main className="min-w-0 flex-1 py-12 md:py-16">
        <section className="container max-w-5xl mx-auto px-4">
          <div className="space-y-8">
            <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
              BOCRA regulates ISPs, managed broadband providers, VoIP operators, and cloud service providers under the converged licensing framework.
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
