import Header from "@/components/Header";
import BottomBar from "@/components/BottomBar";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import t2Bg from "@/assets/styling/t2.jpg";

const Telecommunications = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero Banner */}
      <section className="relative flex items-center justify-center -mt-16 py-20 pt-[calc(4rem+5rem)] md:-mt-[72px] md:py-28 md:pt-[calc(4.5rem+7rem)] lg:-mt-[5.75rem] lg:pt-[calc(5.75rem+7rem)]">
        <div className="absolute inset-x-0 -top-1 bottom-0 overflow-hidden">
          <img src={t2Bg} alt="" className="h-[calc(100%+4px)] min-h-full w-full -translate-y-px object-cover" />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <button
          onClick={() => navigate("/")}
          className="absolute top-4 left-4 z-10 inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </button>
        <div className="relative z-10 container max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Telecommunications</h1>
          <p className="text-lg text-white/80 max-w-3xl mx-auto">
            Telecommunications licences cover electronic communications networks and services.
          </p>
        </div>
      </section>

      <main className="min-w-0 flex-1 py-12 md:py-16">
        <section className="container max-w-6xl mx-auto px-4">
          <div className="space-y-8">
            <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
              Under the 2015 converged licensing framework, BOCRA issues several categories of telecommunications licences to promote technology neutrality, convergence, competition, consumer protection, and open access.
            </p>

            {/* NFP */}
            <div>
              <h2 className="text-base md:text-lg font-semibold text-foreground">Network Facilities Provider (NFP) Licence</h2>
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
            <div>
              <h2 className="text-base md:text-lg font-semibold text-foreground">Services and Applications Provider (SAP) Licence</h2>
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
            <div>
              <h2 className="text-base md:text-lg font-semibold text-foreground">Public Telecommunications Operator (PTO) Licence</h2>
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
            <div>
              <h2 className="text-base md:text-lg font-semibold text-foreground">Specialised Telecommunications Licences</h2>
              <p className="mt-2 text-sm md:text-base leading-relaxed text-muted-foreground">These fall within telecom regulation but serve specific technical purposes:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1.5 text-sm md:text-base leading-relaxed text-muted-foreground">
                <li><span className="font-semibold text-foreground">Cellular Licence:</span> mobile voice and data services.</li>
                <li><span className="font-semibold text-foreground">Point-to-Point Licence:</span> dedicated telecom links and backbone.</li>
                <li><span className="font-semibold text-foreground">Point-to-Multipoint Licence:</span> wireless broadband distribution.</li>
                <li><span className="font-semibold text-foreground">Satellite Service Licence:</span> satellite-based connectivity.</li>
                <li><span className="font-semibold text-foreground">VANS Licence:</span> Value-Added Network Services over existing infrastructure.</li>
              </ul>
            </div>

            {/* General Requirements */}
            <div>
              <h2 className="text-base md:text-lg font-semibold text-foreground">General Requirements</h2>
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
