import Header from "@/components/Header";
import BottomBar from "@/components/BottomBar";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Minus } from "lucide-react";
import { useState } from "react";

interface Section {
  title: string;
  content: React.ReactNode;
}

const sections: Section[] = [
  {
    title: "What is Spectrum Management?",
    content: (
      <div className="space-y-3 text-sm md:text-base leading-relaxed text-muted-foreground">
        <p>
          Spectrum management is the process of regulating the use of radio frequencies (the electromagnetic spectrum) to promote efficient use and prevent harmful interference between users. In Botswana, BOCRA is responsible for planning, allocating and assigning radio frequency spectrum to ensure that telecommunications, broadcasting, aviation, maritime and other wireless services can operate without disruption.
        </p>
        <p>
          Effective spectrum management ensures that the limited radio frequency resource is shared fairly among all users, supports economic growth by enabling new wireless technologies, and protects critical services such as emergency communications and air traffic control.
        </p>
      </div>
    ),
  },
  {
    title: "National Frequency Allocation",
    content: (
      <div className="space-y-3 text-sm md:text-base leading-relaxed text-muted-foreground">
        <p>
          BOCRA maintains the National Frequency Allocation Plan, which defines how radio frequency bands are allocated across different services in Botswana. The plan is aligned with the International Telecommunication Union (ITU) Radio Regulations and the regional agreements of the African Telecommunications Union (ATU).
        </p>
        <p>
          The allocation plan covers frequency bands from 9 kHz to 275 GHz and assigns them to services such as mobile communications, fixed links, satellite, broadcasting, aeronautical and maritime operations, and scientific research.
        </p>
      </div>
    ),
  },
  {
    title: "Spectrum Licensing",
    content: (
      <div className="space-y-3 text-sm md:text-base leading-relaxed text-muted-foreground">
        <p>Any person or organisation wishing to use radio frequencies in Botswana must obtain the appropriate licence from BOCRA. Spectrum-related licences include:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><span className="font-semibold text-foreground">Radio Frequency Licence:</span> grants rights to use specific spectrum bands for a defined purpose and geographic area.</li>
          <li><span className="font-semibold text-foreground">Aircraft Radio Licence:</span> for aviation communications equipment.</li>
          <li><span className="font-semibold text-foreground">Amateur Radio Licence:</span> for hobbyist radio operators.</li>
          <li><span className="font-semibold text-foreground">CB Radio Licence:</span> for short-range personal communication.</li>
          <li><span className="font-semibold text-foreground">Private Radio Licence:</span> for internal organisational radio systems.</li>
        </ul>
        <p>Licence applications for radio communications can be submitted through the BOCRA Online Self-Service Platform.</p>
      </div>
    ),
  },
  {
    title: "Spectrum Monitoring and Enforcement",
    content: (
      <div className="space-y-3 text-sm md:text-base leading-relaxed text-muted-foreground">
        <p>
          BOCRA continuously monitors the radio frequency spectrum to detect unauthorised transmissions, harmful interference and non-compliance with licence conditions. Monitoring activities include:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Fixed and mobile spectrum monitoring stations across Botswana.</li>
          <li>Direction-finding equipment to locate sources of interference.</li>
          <li>Coordination with neighbouring countries to resolve cross-border interference.</li>
          <li>Regular audits of licensed spectrum users to verify compliance.</li>
        </ul>
        <p>
          Unauthorised use of radio frequencies is a contravention of the CRA Act and can result in fines, equipment seizure and prosecution.
        </p>
      </div>
    ),
  },
  {
    title: "International Coordination",
    content: (
      <div className="space-y-3 text-sm md:text-base leading-relaxed text-muted-foreground">
        <p>
          Spectrum management requires international cooperation to avoid cross-border interference and ensure global interoperability of wireless services. BOCRA participates in:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>ITU World Radiocommunication Conferences (WRC) that revise international spectrum allocations.</li>
          <li>Regional coordination meetings with the Southern African Development Community (SADC) and the Communications Regulators' Association of Southern Africa (CRASA).</li>
          <li>Bilateral frequency coordination agreements with neighbouring countries including South Africa, Namibia, Zimbabwe and Zambia.</li>
        </ul>
      </div>
    ),
  },
];

const SpectrumManagement = () => {
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
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">Spectrum Management</h1>
          </div>

          <div className="space-y-4 mb-8">
            <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
              BOCRA is responsible for managing Botswana's radio frequency spectrum, a finite national resource that underpins all wireless communications. Spectrum management involves planning, allocating, assigning and monitoring radio frequencies to ensure efficient use and prevent harmful interference.
            </p>
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

export default SpectrumManagement;
