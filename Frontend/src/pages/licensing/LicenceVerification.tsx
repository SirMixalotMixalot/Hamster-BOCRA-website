import Header from "@/components/Header";
import BottomBar from "@/components/BottomBar";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Minus, Search } from "lucide-react";
import { useState } from "react";

interface Section {
  title: string;
  content: React.ReactNode;
}

const sections: Section[] = [
  {
    title: "What can you verify?",
    content: (
      <div className="space-y-3 text-sm md:text-base leading-relaxed text-muted-foreground">
        <p>The BOCRA Online Licence Verification portal confirms the validity of:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Radio licences held by operators and service providers.</li>
          <li>Type Approval certificates for telecommunications equipment.</li>
          <li>Licence status of service providers across all regulated sectors.</li>
        </ul>
        <p>The system provides details on device make, model, IMEI/TAC numbers, and overall compliance status.</p>
      </div>
    ),
  },
  {
    title: "Why verify a licence?",
    content: (
      <div className="space-y-3 text-sm md:text-base leading-relaxed text-muted-foreground">
        <p>Verifying a licence helps protect consumers and businesses from unlicensed operators. Operating without a valid licence is a contravention of the Communications Regulatory Authority (CRA) Act, and consequences for operators include:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><span className="font-semibold text-foreground">Civil Penalties and Fines:</span> BOCRA may impose fines for each day of unauthorised operation.</li>
          <li><span className="font-semibold text-foreground">Suspension or Revocation:</span> the Authority may officially revoke the right to operate.</li>
          <li><span className="font-semibold text-foreground">Equipment Seizure:</span> for radio-based services, unauthorised use of frequencies can lead to equipment seizure.</li>
          <li><span className="font-semibold text-foreground">Blacklisting:</span> difficulty in obtaining future licences or government tenders.</li>
        </ul>
      </div>
    ),
  },
  {
    title: "How to verify",
    content: (
      <div className="space-y-3 text-sm md:text-base leading-relaxed text-muted-foreground">
        <p>You can verify a licence using the search tool above by entering:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>The operator or company name.</li>
          <li>The licence number.</li>
          <li>The equipment IMEI or TAC number (for Type Approval verification).</li>
        </ul>
        <p>Results will show the licence type, issue date, expiration date, and current status (Active, Expired, or Suspended).</p>
      </div>
    ),
  },
  {
    title: "Self-Service Portal",
    content: (
      <div className="space-y-3 text-sm md:text-base leading-relaxed text-muted-foreground">
        <p>For many radio and equipment-related services, you can create an account on the Self-Service Portal to track your application or renewal status digitally. Licensees can use the portal to:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>View the status of licence applications and renewals.</li>
          <li>Access licence certificates and compliance documents.</li>
          <li>Manage equipment registrations and Type Approval records.</li>
        </ul>
      </div>
    ),
  },
];

const LicenceVerification = () => {
  const navigate = useNavigate();
  const [openSet, setOpenSet] = useState<Set<number>>(new Set());

  const toggle = (index: number) => {
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index); else next.add(index);
      return next;
    });
  };

  const openVerifyModal = () => {
    window.dispatchEvent(new CustomEvent("toggle-verify-licence-modal"));
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
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">Licence Verification</h1>
          </div>

          <div className="space-y-4 mb-8">
            <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
              To check and verify whether service providers, operators and equipment are licensed by BOCRA, use the verification tool below. The system confirms the validity of radio licences and Type Approval certificates, providing details on device make, model, IMEI/TAC numbers, and overall compliance status.
            </p>

            {/* Verify button */}
            <button
              onClick={openVerifyModal}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-all duration-300 hover:scale-[1.02] shadow-md"
            >
              <Search className="h-4 w-4" />
              Verify a Licence
            </button>
          </div>

          <div className="space-y-2">
            {sections.map((section, index) => (
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

export default LicenceVerification;
