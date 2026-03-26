import Header from "@/components/Header";
import BottomBar from "@/components/BottomBar";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Minus } from "lucide-react";
import { useState } from "react";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

interface SubSection {
  title: string;
  content: React.ReactNode;
}

interface Section {
  title: string;
  intro?: React.ReactNode;
  subsections?: SubSection[];
  content?: React.ReactNode;
}

const sections: Section[] = [
  /* ---- Types of Licences ---- */
  {
    title: "Types of Licences",
    intro: (
      <p className="text-sm md:text-base leading-relaxed text-muted-foreground mb-4">
        BOCRA regulates Botswana's communications sector under the 2015 converged licensing framework which promotes technology neutrality (services not tied to specific technology), convergence (multiple services over one network), competition and market entry, consumer protection, and open access and economic inclusion. Licences fall into five main categories.
      </p>
    ),
    subsections: [
      {
        title: "Telecommunications Licences",
        content: (
          <div className="space-y-4 text-sm md:text-base leading-relaxed text-muted-foreground">
            <p>These licences cover electronic communications networks and services.</p>

            <div>
              <p className="font-semibold text-foreground">Network Facilities Provider (NFP) Licence</p>
              <p className="mt-1">For entities that own or operate telecom infrastructure such as fibre and copper cables, mobile towers and base stations, satellite earth stations, switches and transmission equipment, submarine cables and radio transmitters.</p>
              <p className="mt-2"><span className="font-semibold text-foreground">Who needs it:</span> Companies building telecom infrastructure, operators leasing infrastructure to other providers, private telecom networks (corporate/internal networks).</p>
              <p className="mt-1"><span className="font-semibold text-foreground">Examples of licensees:</span> Botswana Fibre Networks (BoFiNet).</p>
            </div>

            <div>
              <p className="font-semibold text-foreground">Services and Applications Provider (SAP) Licence</p>
              <p className="mt-1">For entities that provide telecom services without owning infrastructure. Services include internet services (ISPs), voice services (including VoIP), data services, cloud services, value-added network services and corporate connectivity solutions.</p>
              <p className="mt-2"><span className="font-semibold text-foreground">Who needs it:</span> ISPs, VoIP providers, managed IT service providers, companies leasing network capacity from NFPs.</p>
            </div>

            <div>
              <p className="font-semibold text-foreground">Public Telecommunications Operator (PTO) Licence</p>
              <p className="mt-1">For full-service public telecom operators covering mobile voice and SMS, fixed-line services, broadband internet, national backbone networks and international connectivity.</p>
              <p className="mt-2"><span className="font-semibold text-foreground">Who needs it:</span> Large telecom companies serving the public nationwide.</p>
              <p className="mt-1"><span className="font-semibold text-foreground">Examples of licensees:</span> Botswana Telecommunications Corporation, Mascom Wireless, Orange Botswana.</p>
            </div>

            <div>
              <p className="font-semibold text-foreground">Specialised Telecommunications Licences</p>
              <p className="mt-1">These fall within telecom regulation but serve specific technical purposes:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Cellular Licence (mobile voice and data services)</li>
                <li>Point-to-Point Licence (dedicated telecom links and backbone)</li>
                <li>Point-to-Multipoint Licence (wireless broadband distribution)</li>
                <li>Satellite Service Licence (satellite-based connectivity)</li>
                <li>VANS Licence (Value-Added Network Services over existing infrastructure)</li>
              </ul>
            </div>
          </div>
        ),
      },
      {
        title: "Broadcasting Licences",
        content: (
          <div className="space-y-4 text-sm md:text-base leading-relaxed text-muted-foreground">
            <p>These licences regulate content transmission to the public.</p>

            <div>
              <p className="font-semibold text-foreground">Content Services Provider (CSP) Licence</p>
              <p className="mt-1">For entities that produce or distribute broadcast content such as television broadcasting, radio broadcasting, subscription TV services and programme distribution.</p>
              <p className="mt-2"><span className="font-semibold text-foreground">Types of CSPs:</span> Commercial Broadcasters (profit-driven), Community Broadcasters (non-profit, local focus), Subscription and Signal Distributors.</p>
              <p className="mt-2"><span className="font-semibold text-foreground">Examples of licensed broadcasters:</span> Yarona FM, Duma FM, Gabz FM, eBotswana.</p>
              <p className="mt-2 italic">State broadcasters like Radio Botswana and Botswana Television are exempt from commercial licensing.</p>
            </div>
          </div>
        ),
      },
      {
        title: "Internet and Data Service Licences",
        content: (
          <div className="space-y-4 text-sm md:text-base leading-relaxed text-muted-foreground">
            <p>These are legally telecom licences but practically apply to internet and digital services. They include Internet Service Providers (ISPs), managed broadband services, VoIP providers, data roaming services, and cloud and hosting services.</p>
            <p>Many ISPs operate under SAP or VANS licences. Wireless ISPs often require Point-to-Multipoint licences. Backbone providers fall under NFP.</p>
          </div>
        ),
      },
      {
        title: "Postal Services Licences",
        content: (
          <div className="space-y-4 text-sm md:text-base leading-relaxed text-muted-foreground">
            <p>These regulate mail and courier services.</p>
            <div>
              <p className="font-semibold text-foreground">Designated Postal Operator (DPO) Licence</p>
              <p className="mt-1">For a national operator with universal service obligations.</p>
              <p className="mt-1"><span className="font-semibold text-foreground">Example of licensee:</span> BotswanaPost.</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">Commercial Postal Operator (CPO) Licence</p>
              <p className="mt-1">For courier and value-added logistics services such as private courier companies and parcel delivery services.</p>
            </div>
          </div>
        ),
      },
      {
        title: "Radiocommunication and Spectrum Licences",
        content: (
          <div className="space-y-4 text-sm md:text-base leading-relaxed text-muted-foreground">
            <p>These regulate use of radio frequencies, not public telecom services. They include:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Aircraft Radio Licence (aviation communications)</li>
              <li>Amateur Radio Licence (hobbyist radio operations)</li>
              <li>CB Radio Licence (short-range personal communication)</li>
              <li>Private Radio Licence (internal organisational radio systems)</li>
              <li>Radio Frequency Licence (rights to specific spectrum bands)</li>
            </ul>
          </div>
        ),
      },
      {
        title: "Equipment and Technical Regulation Licences",
        content: (
          <div className="space-y-4 text-sm md:text-base leading-relaxed text-muted-foreground">
            <div>
              <p className="font-semibold text-foreground">Radio Dealers Licence</p>
              <p className="mt-1">Authorises sale and distribution of radio and telecom equipment.</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">Type Approval Licence</p>
              <p className="mt-1">Ensures telecom equipment complies with national technical standards before market entry.</p>
            </div>
          </div>
        ),
      },
    ],
  },

  /* ---- General Requirements ---- */
  {
    title: "General Requirements for a Licence",
    content: (
      <div className="space-y-3 text-sm md:text-base leading-relaxed text-muted-foreground">
        <p>Although specific licence terms vary by licence type, most BOCRA licences require:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><span className="font-semibold text-foreground">Fit and proper criteria:</span> good financial standing and governance.</li>
          <li><span className="font-semibold text-foreground">Technical capability:</span> ability to provide services reliably.</li>
          <li><span className="font-semibold text-foreground">Quality of service obligations:</span> minimum performance standards.</li>
          <li>Compliance with frequency/spectrum regulations (for wireless/telecom).</li>
          <li>Reporting and regulatory fees.</li>
        </ul>
      </div>
    ),
  },

  /* ---- Application Process ---- */
  {
    title: "Licence Application Process",
    content: (
      <div className="space-y-5 text-sm md:text-base leading-relaxed text-muted-foreground">
        {[
          {
            step: 1,
            heading: "Determine your licence type",
            body: "Identify the category that fits your business model: Network Facilities Provider (NFP) for those owning/operating physical infrastructure; Services and Application Provider (SAP) for non-infrastructure based services (e.g., internet services using another's network); Content Services including broadcasting (Radio, TV) and subscription management; Postal and Courier Services for commercial postal operators; Radio Communications for private radio networks or amateur radio; Type Approval for registering telecommunications or radio equipment for sale or use in Botswana.",
          },
          {
            step: 2,
            heading: "Check eligibility requirements",
            body: "Legal Entity Status: most licences require the applicant to be a company incorporated in Botswana. Shareholding: certain broadcasting licences have specific citizen shareholding requirements (e.g., up to 80% for radio). Resource Capability: you must demonstrate sufficient technical, financial, and human resources.",
          },
          {
            step: 3,
            heading: "Gather required documents",
            body: null,
          },
          {
            step: 4,
            heading: "Submit application",
            body: "Online Portal: use the Online Self-Service Platform for Radio Communications Licences. For other ICT and Postal licences, download forms from the BOCRA website and submit them to the Licensing Department at Plot 50671 Independence Avenue, Gaborone.",
          },
          {
            step: 5,
            heading: "Pay the application fee",
            body: "Fees are typically non-refundable and must be paid upon submission. Provisional ICT/Postal Licences often require a fee of P5,000 + VAT. Radio/Amateur Licences fees are generally lower; check the specific form for current rates.",
          },
          {
            step: 6,
            heading: "BOCRA reviews application",
            body: "BOCRA evaluates your application based on compliance (ensuring all documents are present and certified), technical merit (ability to provide the proposed service without interference), financial viability (ensuring the business is sustainable), and market impact (checking for demand and fair competition).",
          },
          {
            step: 7,
            heading: "Decision by BOCRA communicated",
            body: "BOCRA will notify you of the outcome in writing. If additional information is needed, it will be requested before making a final decision.",
          },
          {
            step: 8,
            heading: "Final payment and issuance",
            body: "If approved, you must pay the Annual Licence Fee (which varies by service type), provide a Performance Bond if required (common for NFP or SAP licences), and receive your official Licence Certificate.",
          },
        ].map((s) => (
          <div key={s.step} className="flex gap-2">
            <span className="font-semibold text-primary shrink-0">Step {s.step}.</span>
            <div>
              <span className="font-semibold text-foreground">{s.heading}</span>
              {s.body && <p className="mt-1">{s.body}</p>}
              {s.step === 3 && (
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Company Registration: certified copy of the Certificate of Incorporation and latest Annual Returns from CIPA.</li>
                  <li>Tax Clearance: valid tax clearance certificate from BURS.</li>
                  <li>Identification: certified copies of Omang (citizens) or Passports (non-citizens) for all Directors and Shareholders.</li>
                  <li>Business Plan: a 3-year plan including market analysis, target market, and pricing.</li>
                  <li>Technical Plan: detailed network diagrams, technical specifications, and roll-out plans.</li>
                  <li>Financial Statements: 3-year financial projections (cash flows and income statements) and proof of funding.</li>
                  <li>Shareholding Documents: certified shareholding certificates.</li>
                  <li>Lease/Title: proof of business premises (lease agreement or title deed).</li>
                  <li>Reference Letters: for specific services like MVNOs, a signed agreement from a Mobile Network Operator is required.</li>
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    ),
  },

  /* ---- Renewal Process ---- */
  {
    title: "Licence Renewal Process",
    content: (
      <div className="space-y-5 text-sm md:text-base leading-relaxed text-muted-foreground">
        <div>
          <p className="font-semibold text-foreground">When to start renewal</p>
          <p className="mt-1">Renewal timelines vary significantly by licence type:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li><span className="font-semibold text-foreground">Public Telecommunications Operators (PTO):</span> apply not more than 3 years but not less than 2 years before the expiry date.</li>
            <li><span className="font-semibold text-foreground">Service and Application Providers (SAP):</span> apply not more than 12 months but not less than 6 months before expiry.</li>
            <li><span className="font-semibold text-foreground">Accredited Certification Service Providers:</span> application must be made no later than 3 months before expiry.</li>
            <li><span className="font-semibold text-foreground">General ICT and Radio:</span> check specific conditions, as BOCRA often issues notices for licensees to settle outstanding fees and renew before year-end closures.</li>
          </ul>
        </div>

        <div>
          <p className="font-semibold text-foreground">Documents needed for renewal</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Renewal Application Form specific to your licence type (e.g., Frequency Renewal Form for Radio).</li>
            <li>Updated Company Documents: latest annual returns or registration details from CIPA.</li>
            <li>Technical Audit/Equipment List: a list of all equipment currently in use, including serial numbers and models.</li>
            <li>Audited Financial Statements: required for Content Service Providers (within 90 days of the financial year-end) and other major operators.</li>
            <li>Compliance Reports: proof that you have met all previous licence conditions and quality of service standards.</li>
          </ul>
        </div>

        <div>
          <p className="font-semibold text-foreground">Renewal costs</p>
          <p className="mt-1">Renewal costs typically consist of two parts:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li><span className="font-semibold text-foreground">Renewal/Application Fee:</span> a one-time administrative fee (e.g., P5,000 + VAT for Postal or P10,000 + VAT for ISPs).</li>
            <li><span className="font-semibold text-foreground">Annual Operating Fee:</span> ongoing fees often based on a percentage of net operating revenue (e.g., 1% for Content Service Providers) or fixed annual amounts (e.g., P3,000 for ISPs).</li>
            <li><span className="font-semibold text-foreground">Inflation Adjustment:</span> BOCRA may increase fees annually based on the Consumer Price Index (CPI).</li>
          </ul>
        </div>

        <div>
          <p className="font-semibold text-foreground">What happens if your licence expires</p>
          <p className="mt-1">Operating without a valid licence is a contravention of the Communications Regulatory Authority (CRA) Act. Consequences include:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li><span className="font-semibold text-foreground">Civil Penalties and Fines:</span> BOCRA may impose fines for each day of unauthorised operation.</li>
            <li><span className="font-semibold text-foreground">Suspension or Revocation:</span> the Authority may officially revoke your right to operate and publish an "Intent to Revoke" notice.</li>
            <li><span className="font-semibold text-foreground">Equipment Seizure:</span> for radio-based services, unauthorised use of frequencies can lead to the seizure of equipment.</li>
            <li><span className="font-semibold text-foreground">Blacklisting:</span> difficulty in obtaining future licences or government tenders due to a history of non-compliance.</li>
          </ul>
        </div>
      </div>
    ),
  },

  /* ---- Verification ---- */
  {
    title: "Licence Verification",
    content: (
      <div className="space-y-3 text-sm md:text-base leading-relaxed text-muted-foreground">
        <p>
          To check and verify whether service providers, operators and equipment are licensed by BOCRA, visit the BOCRA Online Licence Verification portal, which confirms the validity of radio licences and Type Approval certificates. The system provides details on device make, model, IMEI/TAC numbers, and overall compliance status.
        </p>
      </div>
    ),
  },

  /* ---- Fee Schedule ---- */
  {
    title: "Fee Schedule",
    content: (
      <div className="space-y-3 text-sm md:text-base leading-relaxed text-muted-foreground">
        <p>
          BOCRA mandates a structured fee schedule for telecommunications, postal and radio services, including application, annual licence, spectrum and type approval fees. Licensees must adhere to specific, frequently VAT-inclusive, annual or one-time charges based on service type and infrastructure.
        </p>
      </div>
    ),
  },

  /* ---- Application Timelines ---- */
  {
    title: "Application Timelines and Tracking",
    content: (
      <div className="space-y-3 text-sm md:text-base leading-relaxed text-muted-foreground">
        <p>BOCRA licence application processing times range between:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>3 working days for type approvals and radio licences.</li>
          <li>Approximately 8 weeks for general ICT service licences.</li>
          <li>90 working days for broadcasting licences.</li>
        </ul>
        <p>
          The application process moves from submission to review, potential drafting for approval and final issuance. Rejected applicants are able to request a written explanation of the decision.
        </p>
        <p>
          For many radio and equipment-related services, you can create an account on the Self-Service Portal to track your application or renewal status digitally.
        </p>
      </div>
    ),
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const HowLicensingWorks = () => {
  const navigate = useNavigate();
  const [openSections, setOpenSections] = useState<Set<number>>(new Set());
  const [openSubs, setOpenSubs] = useState<Set<number>>(new Set());

  const toggleSection = (i: number) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  const toggleSub = (i: number) => {
    setOpenSubs((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
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
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">How Licensing Works</h1>
          </div>

          {/* Intro */}
          <div className="space-y-4 mb-8">
            <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
              BOCRA is mandated by Sec 6 (h) of the CRA Act to process applications for and issue licences, permits, permissions, concessions and authorities for regulated sectors being telecommunications, internet, radio communications, broadcasting and postal.
            </p>
          </div>

          {/* Accordion sections */}
          <div className="space-y-2">
            {sections.map((section, sIdx) => (
              <div key={sIdx}>
                <button
                  onClick={() => toggleSection(sIdx)}
                  className="w-full flex items-start gap-3 py-3 text-left"
                >
                  {openSections.has(sIdx) ? (
                    <Minus className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  ) : (
                    <Plus className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  )}
                  <span className="text-sm md:text-base font-semibold text-foreground">{section.title}</span>
                </button>

                {openSections.has(sIdx) && (
                  <div className="pl-8 pb-4">
                    {section.intro}
                    {section.content}

                    {/* Nested sub-sections */}
                    {section.subsections && (
                      <div className="space-y-1">
                        {section.subsections.map((sub, subIdx) => (
                          <div key={subIdx}>
                            <button
                              onClick={() => toggleSub(subIdx)}
                              className="w-full flex items-start gap-3 py-2 text-left"
                            >
                              {openSubs.has(subIdx) ? (
                                <Minus className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                              ) : (
                                <Plus className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                              )}
                              <span className="text-sm md:text-base font-medium text-foreground">{sub.title}</span>
                            </button>
                            {openSubs.has(subIdx) && (
                              <div className="pl-7 pb-3">
                                {sub.content}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
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

export default HowLicensingWorks;
