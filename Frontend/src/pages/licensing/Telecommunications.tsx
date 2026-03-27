import Header from "@/components/Header";
import BottomBar from "@/components/BottomBar";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Telecommunications = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="min-w-0 flex-1 py-12 md:py-16">
        <section className="container max-w-5xl mx-auto px-4">
          <div className="mb-8 md:mb-10">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-1.5 text-sm text-bocra-blue hover:text-bocra-blue/80 transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </button>
            <div className="flex items-center gap-3">
              <span className="h-4 w-4 rounded-full bg-bocra-blue shrink-0" />
              <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">Telecommunications Licences</h1>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-bocra-blue/5 border-l-4 border-bocra-blue rounded-r-xl p-5">
              <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
                Telecommunications licences cover electronic communications networks and services. Under the 2015 converged licensing framework, BOCRA issues several categories of telecommunications licences to promote technology neutrality, convergence, competition, consumer protection, and open access.
              </p>
            </div>

            {/* NFP */}
            <div className="bg-card border border-border rounded-2xl p-6 hover:border-bocra-blue/30 transition-colors">
              <h2 className="text-base md:text-lg font-semibold text-foreground flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-bocra-blue" />
                Network Facilities Provider (NFP) Licence
              </h2>
              <p className="mt-2 text-sm md:text-base leading-relaxed text-muted-foreground">For entities that own or operate telecom infrastructure such as:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1 text-sm md:text-base leading-relaxed text-muted-foreground">
                <li>Fibre and copper cables</li>
                <li>Mobile towers and base stations</li>
                <li>Satellite earth stations</li>
                <li>Switches and transmission equipment</li>
                <li>Submarine cables</li>
                <li>Radio transmitters</li>
              </ul>
              <p className="mt-2 text-sm md:text-base leading-relaxed text-muted-foreground"><span className="font-semibold text-foreground">Who needs it:</span> Companies building telecom infrastructure, operators leasing infrastructure to other providers, private telecom networks (corporate/internal networks).</p>
              <p className="mt-1 text-sm md:text-base leading-relaxed text-muted-foreground"><span className="font-semibold text-foreground">Examples of licensees:</span> Botswana Fibre Networks (BoFiNet).</p>
            </div>

            {/* SAP */}
            <div className="bg-card border border-border rounded-2xl p-6 hover:border-bocra-blue/30 transition-colors">
              <h2 className="text-base md:text-lg font-semibold text-foreground flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-bocra-blue" />
                Services and Applications Provider (SAP) Licence
              </h2>
              <p className="mt-2 text-sm md:text-base leading-relaxed text-muted-foreground">For entities that provide telecom services without owning infrastructure. Services include:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1 text-sm md:text-base leading-relaxed text-muted-foreground">
                <li>Internet services (ISPs)</li>
                <li>Voice services (including VoIP)</li>
                <li>Data services</li>
                <li>Cloud services</li>
                <li>Value-added network services</li>
                <li>Corporate connectivity solutions</li>
              </ul>
              <p className="mt-2 text-sm md:text-base leading-relaxed text-muted-foreground"><span className="font-semibold text-foreground">Who needs it:</span> ISPs, VoIP providers, managed IT service providers, companies leasing network capacity from NFPs.</p>
            </div>

            {/* PTO */}
            <div className="bg-card border border-border rounded-2xl p-6 hover:border-bocra-blue/30 transition-colors">
              <h2 className="text-base md:text-lg font-semibold text-foreground flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-bocra-blue" />
                Public Telecommunications Operator (PTO) Licence
              </h2>
              <p className="mt-2 text-sm md:text-base leading-relaxed text-muted-foreground">For full-service public telecom operators covering:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1 text-sm md:text-base leading-relaxed text-muted-foreground">
                <li>Mobile voice and SMS</li>
                <li>Fixed-line services</li>
                <li>Broadband internet</li>
                <li>National backbone networks</li>
                <li>International connectivity</li>
              </ul>
              <p className="mt-2 text-sm md:text-base leading-relaxed text-muted-foreground"><span className="font-semibold text-foreground">Who needs it:</span> Large telecom companies serving the public nationwide.</p>
              <p className="mt-1 text-sm md:text-base leading-relaxed text-muted-foreground"><span className="font-semibold text-foreground">Examples of licensees:</span> Botswana Telecommunications Corporation, Mascom Wireless, Orange Botswana.</p>
            </div>

            {/* Specialised */}
            <div className="bg-card border border-border rounded-2xl p-6 hover:border-bocra-blue/30 transition-colors">
              <h2 className="text-base md:text-lg font-semibold text-foreground flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-bocra-blue" />
                Specialised Telecommunications Licences
              </h2>
              <p className="mt-2 text-sm md:text-base leading-relaxed text-muted-foreground">These fall within telecom regulation but serve specific technical purposes:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1.5 text-sm md:text-base leading-relaxed text-muted-foreground">
                <li><span className="font-semibold text-bocra-blue">Cellular Licence:</span> mobile voice and data services.</li>
                <li><span className="font-semibold text-bocra-blue">Point-to-Point Licence:</span> dedicated telecom links and backbone.</li>
                <li><span className="font-semibold text-bocra-blue">Point-to-Multipoint Licence:</span> wireless broadband distribution.</li>
                <li><span className="font-semibold text-bocra-blue">Satellite Service Licence:</span> satellite-based connectivity.</li>
                <li><span className="font-semibold text-bocra-blue">VANS Licence:</span> Value-Added Network Services over existing infrastructure.</li>
              </ul>
            </div>

            {/* General Requirements */}
            <div className="bg-bocra-blue/5 border border-bocra-blue/20 rounded-2xl p-6">
              <h2 className="text-base md:text-lg font-semibold text-foreground flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-bocra-blue" />
                General Requirements
              </h2>
              <p className="mt-2 text-sm md:text-base leading-relaxed text-muted-foreground">Most telecommunications licences require:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1.5 text-sm md:text-base leading-relaxed text-muted-foreground">
                <li><span className="font-semibold text-foreground">Fit and proper criteria:</span> good financial standing and governance.</li>
                <li><span className="font-semibold text-foreground">Technical capability:</span> ability to provide services reliably.</li>
                <li><span className="font-semibold text-foreground">Quality of service obligations:</span> minimum performance standards.</li>
                <li>Compliance with frequency/spectrum regulations.</li>
                <li>Reporting and regulatory fees.</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
      <BottomBar />
    </div>
  );
};

export default Telecommunications;
