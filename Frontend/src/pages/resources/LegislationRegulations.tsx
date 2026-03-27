import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import BottomBar from "@/components/BottomBar";

const LegislationRegulations = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main className="min-w-0 flex-1 py-12 md:py-16">
        <section className="container max-w-5xl mx-auto px-4">
          <div className="mb-3 md:mb-4">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 text-sm text-blue-700 hover:text-blue-900 transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">Legislation & Regulations</h1>
            <p className="mt-2 text-sm md:text-base leading-relaxed text-muted-foreground">
              Acts, policies, and guidelines governing Botswana's communications sector.
            </p>
          </div>

          <div className="space-y-8">
            {/* Governing Legislation */}
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">Governing Legislation</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground">Communications Regulatory Authority Act No 19 of 2012</h3>
                  <p className="mt-1 text-sm md:text-base leading-relaxed text-muted-foreground">Established BOCRA as an independent converged regulator for the telecommunications, internet, ICT, radio communications, broadcasting and postal sectors. It empowers the Authority to issue BOCRA Licensees licenses, manage the radio frequency spectrum, and conduct Type Approval for equipment. Crucially for customers, it mandates BOCRA to protect the interests of consumers regarding price, quality, and variety of services.</p>
                </div>

                <div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground">Electronic Communications and Transactions Act 2014 (Act No 14 of 2014)</h3>
                  <p className="mt-1 text-sm md:text-base leading-relaxed text-muted-foreground">Facilitates e-commerce by giving legal recognition to Electronic Signatures and electronic communications. BOCRA is mandated to accredit Secure Electronic Signature service providers and administer take-down notices for unlawful online content. It protects customers by providing a seven-day cooling-off period for online purchases.</p>
                </div>

                <div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground">Electronic Records (Evidence) Act 2014 (Act No 13 of 2014)</h3>
                  <p className="mt-1 text-sm md:text-base leading-relaxed text-muted-foreground">Provides for the admissibility of electronic records as evidence in legal proceedings. BOCRA acts as the Certifying Authority, establishing approved processes for producing electronic documents and certifying electronic record systems to ensure their integrity.</p>
                </div>

                <div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground">Consumer Protection Act 2018 (Act No 5 of 2018)</h3>
                  <p className="mt-1 text-sm md:text-base leading-relaxed text-muted-foreground">The general Act that protects consumers from unfair business practices across all industries. BOCRA aligns its Consumer Protection Policy with these broader national standards.</p>
                </div>

                <div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground">Media Practitioners Act No. 29 of 2008 (Cap. 61:09)</h3>
                  <p className="mt-1 text-sm md:text-base leading-relaxed text-muted-foreground">Established a Media Council to maintain professional standards and ethics; it has largely been superseded by newer legislative efforts like the Media Practitioners' Association Act (2022).</p>
                </div>

                <div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground">Copyright and Neighbouring Rights Act No. 6 of 2006 (Cap. 68:02)</h3>
                  <p className="mt-1 text-sm md:text-base leading-relaxed text-muted-foreground">Protects the rights of authors and creators of original works and provides for the management of these rights.</p>
                </div>

                <div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground">Cinematograph Act No. 73 of 1970 (Cap. 60:02)</h3>
                  <p className="mt-1 text-sm md:text-base leading-relaxed text-muted-foreground">Regulates the exhibition of films and the licensing of cinemas in Botswana.</p>
                </div>

                <div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground">Printed Publications Act No. 15 of 1968 (Cap. 20:01)</h3>
                  <p className="mt-1 text-sm md:text-base leading-relaxed text-muted-foreground">Requires the registration of newspapers and imposes duties on printers and publishers regarding imprints and record-keeping.</p>
                </div>

                <div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground">Credit Information Act No. 17 of 2021</h3>
                  <p className="mt-1 text-sm md:text-base leading-relaxed text-muted-foreground">Regulates the credit reporting system, licensing of credit bureaus, and the sharing of consumer credit information, overseen by the Bank of Botswana.</p>
                </div>

                <div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground">National Library Service Act No. 29 of 1967 (Cap. 58:02)</h3>
                  <p className="mt-1 text-sm md:text-base leading-relaxed text-muted-foreground">Establishes the Botswana National Library Service to preserve literary heritage and provide public access to information.</p>
                </div>

                <div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground">Universal Postal Convention Act No. 41 of 1971 (Cap. 39:07)</h3>
                  <p className="mt-1 text-sm md:text-base leading-relaxed text-muted-foreground">Incorporates international postal standards and conventions into domestic law to facilitate global mail exchange.</p>
                </div>

                <div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground">Data Protection Act No. 18 of 2024</h3>
                  <p className="mt-1 text-sm md:text-base leading-relaxed text-muted-foreground">Regulates the collection and processing of personal data to protect individual privacy, overseen by the Information and Data Protection Commission.</p>
                </div>

                <div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground">Cybercrime and Computer Related Crimes Act No. 18 of 2018 (Cap. 08:06)</h3>
                  <p className="mt-1 text-sm md:text-base leading-relaxed text-muted-foreground">Defines and penalises offences such as unauthorised access to data, illegal interception, and the publication of harmful or misleading digital information.</p>
                </div>

                <div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground">Virtual Assets Act No. 3 of 2022</h3>
                  <p className="mt-1 text-sm md:text-base leading-relaxed text-muted-foreground">Regulates the trading and business of virtual assets (such as cryptocurrencies) and provides for the licensing of virtual asset service providers.</p>
                </div>

                <div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground">Botswana Telecommunications Corporation Act No. 3 of 1980 (Cap. 72:02)</h3>
                  <p className="mt-1 text-sm md:text-base leading-relaxed text-muted-foreground">Originally established the BTC to provide and manage national and international public telecommunications services.</p>
                </div>

                <div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground">Botswana Telecommunications Corporation (Transition) Act No. 28 of 2008 (Cap. 72:05)</h3>
                  <p className="mt-1 text-sm md:text-base leading-relaxed text-muted-foreground">Facilitated the conversion of BTC from a statutory corporation into a public company limited by shares to enable privatisation.</p>
                </div>

                <div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground">Botswana Postal Services (Transition) Act No. 1 of 2014 (Cap. 72:06)</h3>
                  <p className="mt-1 text-sm md:text-base leading-relaxed text-muted-foreground">Provides for the registration of Botswana Postal Services under the Companies Act for its continued existence as a corporate entity.</p>
                </div>

                <div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground">Broadcasting (Repeal) Act No. 17 of 2012 (Cap. 72:04)</h3>
                  <p className="mt-1 text-sm md:text-base leading-relaxed text-muted-foreground">Repealed the original Broadcasting Act to allow for the transfer of broadcasting regulation to BOCRA under the converged CRA Act.</p>
                </div>
              </div>
            </div>

            {/* Subsidiary Regulations */}
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">Subsidiary Regulations</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground">Communications Regulatory Authority Regulations 2022 (SI 82 of 2022)</h3>
                  <p className="mt-1 text-sm md:text-base leading-relaxed text-muted-foreground">These regulations are the operational framework for the main Act. They cover specific rules for broadcasting (local content, advertising fairness), telecommunications (infrastructure sharing, subscriber registration), and postal services. For consumers, they include dedicated provisions on Consumer Affairs, such as complaint handling, billing accuracy and protection against unsolicited electronic communications.</p>
                </div>

                <div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground">Electronic Records (Evidence) Regulations</h3>
                  <p className="mt-1 text-sm md:text-base leading-relaxed text-muted-foreground">Issued under the Electronic Records (Evidence) Act. These provide the "how-to" for legal compliance regarding digital data. They establish the process for certifying electronic record systems to ensure the integrity and admissibility of digital documents in court.</p>
                </div>

                <div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground">Broadcasting Regulations</h3>
                  <p className="mt-1 text-sm md:text-base leading-relaxed text-muted-foreground">Originally established under the Broadcasting Act (and saved/updated under the CRA Act), these focus on regulating local content, advertising & sponsorship and ownership limits. Prevents a single person from owning both a TV and radio station that serve the same local market.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <BottomBar />
    </div>
  );
};

export default LegislationRegulations;
