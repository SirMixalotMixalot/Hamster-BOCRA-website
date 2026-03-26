import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import BottomBar from "@/components/BottomBar";

const PoliciesFrameworks = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main className="min-w-0 flex-1 py-12 md:py-16">
        <section className="container max-w-5xl mx-auto px-4">
          <div className="mb-8 md:mb-10">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 text-sm text-blue-700 hover:text-blue-900 transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">Policies & Frameworks</h1>
            <p className="mt-2 text-sm md:text-base leading-relaxed text-muted-foreground">
              Regulatory frameworks, guidelines and policy documents governing Botswana's communications sector.
            </p>
          </div>

          <div className="space-y-8">
            {/* Licensing Frameworks */}
            <div>
              <h2 className="text-base md:text-lg font-semibold text-foreground">1. Licensing Frameworks</h2>
              <ul className="list-disc pl-5 mt-2 space-y-2 text-sm md:text-base leading-relaxed text-muted-foreground">
                <li><span className="font-semibold text-foreground">ICT Licensing Framework, September 2015:</span> Establishes a converged licensing regime with two main categories: Network Facilities Provider (NFP) and Services and Applications Provider (SAP).</li>
                <li><span className="font-semibold text-foreground">Digital Terrestrial Television (DTT) Licensing Framework, 2013 (Consolidated):</span> Defines the value chain, coverage categories, and licensing options for the transition from analogue to digital broadcasting.</li>
                <li><span className="font-semibold text-foreground">Campus Radio Licensing Framework, June 2022 (Approx.):</span> Provides the specific application requirements and operational rules for non-commercial campus-based radio stations.</li>
              </ul>
            </div>

            {/* Interconnection Guidelines */}
            <div>
              <h2 className="text-base md:text-lg font-semibold text-foreground">2. Interconnection Guidelines</h2>
              <ul className="list-disc pl-5 mt-2 space-y-2 text-sm md:text-base leading-relaxed text-muted-foreground">
                <li><span className="font-semibold text-foreground">Guidelines on Interconnection for Botswana Telecommunications Sector, 2012:</span> Set the rules for physical and logical linking of networks to enable communication between different service providers.</li>
              </ul>
            </div>

            {/* QoS Frameworks */}
            <div>
              <h2 className="text-base md:text-lg font-semibold text-foreground">3. Quality of Service (QoS) Frameworks</h2>
              <ul className="list-disc pl-5 mt-2 space-y-2 text-sm md:text-base leading-relaxed text-muted-foreground">
                <li><span className="font-semibold text-foreground">Information Communication Technologies - Quality of Service and Quality of Experience Guidelines, Revised June 2022:</span> Define technical performance standards for regulated sectors and establish methods for monitoring consumer perception of service.</li>
                <li><span className="font-semibold text-foreground">Guidelines on Minimum Requirements for Internet Connectivity in Hospitality Facilities, August 2014:</span> Set minimum bandwidth and quality standards for internet services provided by hotels and other hospitality venues.</li>
              </ul>
            </div>

            {/* Consumer Protection Policies */}
            <div>
              <h2 className="text-base md:text-lg font-semibold text-foreground">4. Consumer Protection Policies</h2>
              <ul className="list-disc pl-5 mt-2 space-y-2 text-sm md:text-base leading-relaxed text-muted-foreground">
                <li><span className="font-semibold text-foreground">Consumer Protection Policy - Communication Sector, 2018/2019:</span> Outlines the rights and obligations of consumers and service providers, focusing on fair treatment and transparency.</li>
              </ul>
            </div>

            {/* Numbering Plan */}
            <div>
              <h2 className="text-base md:text-lg font-semibold text-foreground">5. Numbering Plan</h2>
              <ul className="list-disc pl-5 mt-2 space-y-2 text-sm md:text-base leading-relaxed text-muted-foreground">
                <li><span className="font-semibold text-foreground">National Numbering Plan and List of Numbering Resource Allocation, Regularly Updated (Latest 2022):</span> Manages the allocation and assignment of telephone numbers and short codes to ensure efficient use of national numbering resources.</li>
              </ul>
            </div>

            {/* Technical Specifications */}
            <div>
              <h2 className="text-base md:text-lg font-semibold text-foreground">6. Technical Specifications</h2>
              <ul className="list-disc pl-5 mt-2 space-y-2 text-sm md:text-base leading-relaxed text-muted-foreground">
                <li><span className="font-semibold text-foreground">Technical Specification Document DTT002, (1), 2016:</span> Detailed standards for hardware.</li>
              </ul>
            </div>

            {/* Type Approval Guidelines */}
            <div>
              <h2 className="text-base md:text-lg font-semibold text-foreground">7. Type Approval Guidelines</h2>
              <ul className="list-disc pl-5 mt-2 space-y-2 text-sm md:text-base leading-relaxed text-muted-foreground">
                <li><span className="font-semibold text-foreground">BOCRA Type Approval Guidelines (V1.2), March 2016 (Updated 2023):</span> Details the procedures for registering and approving communications equipment to ensure compliance with international technical standards.</li>
              </ul>
            </div>

            {/* Universal Service Policies */}
            <div>
              <h2 className="text-base md:text-lg font-semibold text-foreground">8. Universal Service Policies</h2>
              <ul className="list-disc pl-5 mt-2 space-y-2 text-sm md:text-base leading-relaxed text-muted-foreground">
                <li><span className="font-semibold text-foreground">Universal Access and Service Fund (UASF) Strategic Plan, Annual Reports 2024:</span> Governs the provision of essential communication services to unserved or underserved areas of Botswana.</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
      <BottomBar />
    </div>
  );
};

export default PoliciesFrameworks;
