import Header from "@/components/Header";
import BottomBar from "@/components/BottomBar";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Minus } from "lucide-react";
import { useState } from "react";

interface FeeSection {
  title: string;
  content: React.ReactNode;
}

const feeSections: FeeSection[] = [
  {
    title: "Application Fees",
    content: (
      <div className="space-y-3 text-sm md:text-base leading-relaxed text-muted-foreground">
        <p>Application fees are typically non-refundable and must be paid upon submission.</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><span className="font-semibold text-foreground">Provisional ICT/Postal Licences:</span> P5,000 + VAT.</li>
          <li><span className="font-semibold text-foreground">ISP/Data Service Provider:</span> P10,000 (once-off) + VAT.</li>
          <li><span className="font-semibold text-foreground">Radio/Amateur Licences:</span> fees are generally lower; check the specific form for current rates.</li>
        </ul>
      </div>
    ),
  },
  {
    title: "Annual Licence Fees",
    content: (
      <div className="space-y-3 text-sm md:text-base leading-relaxed text-muted-foreground">
        <p>Annual fees are ongoing charges that licensees must pay each year to maintain their licence.</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><span className="font-semibold text-foreground">ISP/Data Service Provider:</span> P3,000 per annum + VAT.</li>
          <li><span className="font-semibold text-foreground">Content Service Providers:</span> 1% of net operating revenue.</li>
          <li><span className="font-semibold text-foreground">Network Facilities Providers (NFP):</span> fees vary by service type and infrastructure.</li>
          <li><span className="font-semibold text-foreground">Services and Application Providers (SAP):</span> fees vary by service type.</li>
          <li><span className="font-semibold text-foreground">Public Telecommunications Operators (PTO):</span> fees based on revenue and service categories.</li>
        </ul>
      </div>
    ),
  },
  {
    title: "Renewal Fees",
    content: (
      <div className="space-y-3 text-sm md:text-base leading-relaxed text-muted-foreground">
        <p>Renewal costs typically consist of two parts:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><span className="font-semibold text-foreground">Renewal/Application Fee:</span> a one-time administrative fee (e.g., P5,000 + VAT for Postal or P10,000 + VAT for ISPs).</li>
          <li><span className="font-semibold text-foreground">Annual Operating Fee:</span> ongoing fees often based on a percentage of net operating revenue or fixed annual amounts.</li>
        </ul>
      </div>
    ),
  },
  {
    title: "Spectrum and Frequency Fees",
    content: (
      <div className="space-y-3 text-sm md:text-base leading-relaxed text-muted-foreground">
        <p>Spectrum fees apply to licensees using radio frequency spectrum. These include charges for frequency allocation, assignment and ongoing use of specific spectrum bands. Rates vary based on bandwidth, geographic coverage, and service type.</p>
      </div>
    ),
  },
  {
    title: "Type Approval Fees",
    content: (
      <div className="space-y-3 text-sm md:text-base leading-relaxed text-muted-foreground">
        <p>Type Approval fees are charged to ensure that telecommunications equipment complies with national technical standards before being introduced to the Botswana market. These are typically one-time charges per equipment type or model.</p>
      </div>
    ),
  },
  {
    title: "Inflation Adjustment",
    content: (
      <div className="space-y-3 text-sm md:text-base leading-relaxed text-muted-foreground">
        <p>BOCRA may increase licence fees annually based on the Consumer Price Index (CPI). Licensees should plan for annual adjustments when budgeting for regulatory compliance costs.</p>
      </div>
    ),
  },
];

const LicenceFees = () => {
  const navigate = useNavigate();
  const [openSet, setOpenSet] = useState<Set<number>>(new Set());

  const toggle = (index: number) => {
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index); else next.add(index);
      return next;
    });
  };

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
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">Licence Fees</h1>
          </div>

          <div className="space-y-4 mb-8">
            <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
              BOCRA mandates a structured fee schedule for telecommunications, postal and radio services, including application, annual licence, spectrum and type approval fees. Licensees must adhere to specific, frequently VAT-inclusive, annual or one-time charges based on service type and infrastructure.
            </p>
          </div>

          <div className="space-y-2">
            {feeSections.map((section, index) => (
              <div key={index}>
                <button
                  onClick={() => toggle(index)}
                  className="w-full flex items-start gap-3 py-3 text-left"
                >
                  {openSet.has(index) ? (
                    <Minus className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  ) : (
                    <Plus className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  )}
                  <span className="text-sm md:text-base font-semibold text-foreground">{section.title}</span>
                </button>
                {openSet.has(index) && (
                  <div className="pl-8 pb-4">
                    {section.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
      <BottomBar />
    </div>
  );
};

export default LicenceFees;
