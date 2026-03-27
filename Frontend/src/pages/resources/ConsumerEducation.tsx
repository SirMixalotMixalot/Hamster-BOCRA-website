import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import BottomBar from "@/components/BottomBar";
import TypeApprovalModal from "@/components/TypeApprovalModal";

const ConsumerEducation = () => {
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
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">Consumer Education</h1>
            <p className="mt-2 text-sm md:text-base leading-relaxed text-muted-foreground">
              Know your rights and responsibilities as a communications consumer in Botswana.
            </p>
          </div>

          <div className="space-y-8">
            {/* Consumer Education Intro */}
            <div>
              <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
                The Botswana Communications Regulatory Authority is empowered by the Communications Regulatory Authority Act 2012, to promote the interests of consumers, purchasers and other users of the telecommunication services in respect of price, quality and variety of such services and equipment supplied for provision of the same. Liberalisation of the telecommunications market brought with it a variety of telecommunications services that differ in price and quality. The growth of the telecommunications industry is rapid. New telecommunications service and technology emerge fast. Consumers need to obtain sufficient information about these services in order to make informed choices and get the best value for money, as their basic rights.
              </p>
              <p className="mt-3 text-sm md:text-base leading-relaxed text-muted-foreground">
                The Constitution of Botswana provides for rights, which are recognised as inalienable to every citizen of this country. BOCRA has also listed some rights which every consumer of telecommunications services is entitled to, irrespective of his or her status in life. It is therefore incumbent upon the consumer to demand these rights that include the following.
              </p>
            </div>

            {/* Consumer Rights */}
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">Your Rights as a Consumer</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground">Right to Quality Service</h3>
                  <p className="mt-1 text-sm md:text-base leading-relaxed text-muted-foreground">You have the right to access high-quality, reliable and consistent services that meet the standards set in the service provider's license and BOCRA's Quality of Service guidelines.</p>
                </div>

                <div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground">Right to Transparent Billing</h3>
                  <p className="mt-1 text-sm md:text-base leading-relaxed text-muted-foreground">You have the right to receive accurate, timely, and easy-to-understand bills for the services you use, ensuring you are only charged for what you have actually consumed.</p>
                </div>

                <div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground">Right to Service Information</h3>
                  <p className="mt-1 text-sm md:text-base leading-relaxed text-muted-foreground">You have the right to clear and accurate information about product features, pricing, and terms and conditions before you sign up, so you can make an informed choice.</p>
                </div>

                <div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground">Right to File Complaints</h3>
                  <p className="mt-1 text-sm md:text-base leading-relaxed text-muted-foreground">You have the right to lodge a complaint if you are unhappy with your service. You must first contact your provider, but you have the right to escalate the issue to BOCRA if it is not resolved satisfactorily.</p>
                </div>

                <div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground">Right to Number Portability</h3>
                  <p className="mt-1 text-sm md:text-base leading-relaxed text-muted-foreground">You have the right to keep your existing mobile or fixed-line phone number when you switch from one service provider to another.</p>
                </div>

                <div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground">Right to Privacy of Communications</h3>
                  <p className="mt-1 text-sm md:text-base leading-relaxed text-muted-foreground">You have the right to expect that your personal data and private conversations are kept secure and are not accessed or shared without your permission or a legal requirement.</p>
                </div>

                <div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground">Right to Fair Contracts</h3>
                  <p className="mt-1 text-sm md:text-base leading-relaxed text-muted-foreground">You have the right to contracts that do not contain unfair or hidden terms. Providers must explain the main parts of your agreement before you sign it.</p>
                </div>

                <div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground">Right to Choice</h3>
                  <p className="mt-1 text-sm md:text-base leading-relaxed text-muted-foreground">You have the right to choose from a variety of service providers and products at competitive prices to find the option that best fits your needs. This has to do with assurance of access to a variety of products and services at competitive prices so that options of which product to buy and which not, will exist for the different segments of society.</p>
                </div>

                <div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground">Right to Be Informed</h3>
                  <p className="mt-1 text-sm md:text-base leading-relaxed text-muted-foreground">This right impels service providers to factually and comprehensively inform consumers about products or services devoid of falsehood, deceit, misleading information and advertisement. It is as such the responsibility of service providers to always give accurate, sufficient and relevant information to guide consumers in making rationale choices and informed decisions. It amounts to a breach of consumers' rights not to disclose all information pertaining to a product.</p>
                </div>

                <div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground">Right to Be Heard</h3>
                  <p className="mt-1 text-sm md:text-base leading-relaxed text-muted-foreground">This provides ample opportunities and channels of expressing grievances, opinions, lodging complaints, suggesting ways and means of improving service delivery to customers. The customer is always right and it is therefore incumbent upon all providers of telecommunications services to respect and uphold the right of the customer.</p>
                </div>

                <div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground">Right to Safety</h3>
                  <p className="mt-1 text-sm md:text-base leading-relaxed text-muted-foreground">This is aimed at protecting consumers against marketing unwholesome, sub-standard, defective goods and services.</p>
                </div>

                <div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground">Right to Be Treated Fairly</h3>
                  <p className="mt-1 text-sm md:text-base leading-relaxed text-muted-foreground">You have the right to receive services without discrimination based on your race, gender, age, or disability.</p>
                </div>
              </div>
            </div>

            {/* Consumer Duties */}
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">Your Duties as a Consumer</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground">Responsibility to Pay Bills on Time</h3>
                  <p className="mt-1 text-sm md:text-base leading-relaxed text-muted-foreground">You must pay for the services you use by the due date specified in your contract or bill to avoid late fees or service disconnection.</p>
                </div>

                <div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground">Responsibility to Protect Your Equipment</h3>
                  <p className="mt-1 text-sm md:text-base leading-relaxed text-muted-foreground">You are responsible for the safety and proper use of your devices (like routers or SIM cards). This includes keeping passwords and PINs private to prevent unauthorized use.</p>
                </div>

                <div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground">Responsibility to Provide Accurate Information</h3>
                  <p className="mt-1 text-sm md:text-base leading-relaxed text-muted-foreground">When signing up for a service, you must provide truthful and up-to-date personal details, including valid identification for SIM card registration (KYC).</p>
                </div>

                <div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground">Responsibility to Use Services Legally</h3>
                  <p className="mt-1 text-sm md:text-base leading-relaxed text-muted-foreground">You must not use communication services for illegal activities, such as sending threatening messages, committing fraud, or bypassing network security.</p>
                </div>

                <div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground">Responsibility to Inform Your Provider of Changes</h3>
                  <p className="mt-1 text-sm md:text-base leading-relaxed text-muted-foreground">You should notify your service provider if your contact details change or if you want to cancel or modify your plan.</p>
                </div>

                <div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground">Responsibility to Report Faults Promptly</h3>
                  <p className="mt-1 text-sm md:text-base leading-relaxed text-muted-foreground">If you experience a service outage or technical issue, you should report it to your provider immediately so they have a fair chance to fix it.</p>
                </div>

                <div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground">Responsibility to Follow the Complaint Process</h3>
                  <p className="mt-1 text-sm md:text-base leading-relaxed text-muted-foreground">Before escalating an issue to BOCRA, you must first give your service provider a chance to resolve the matter through their internal complaints procedures.</p>
                </div>
              </div>
            </div>

            {/* Service Quality Standards */}
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">Service Quality Standards</h2>

              <div className="space-y-6">
                {/* Minimum Internet Speeds */}
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground">Minimum Internet Speeds (Throughput)</h3>
                  <p className="mt-1 text-sm md:text-base leading-relaxed text-muted-foreground">BOCRA sets minimum downlink (download) and uplink (upload) throughput targets based on the network technology and the area's classification (Urban, Sub-urban, or Rural):</p>

                  <div className="mt-3 space-y-3">
                    <div>
                      <h4 className="text-sm md:text-base font-semibold text-foreground">4G (LTE) Networks:</h4>
                      <ul className="list-disc pl-5 mt-1 space-y-1 text-sm md:text-base leading-relaxed text-muted-foreground">
                        <li>Urban (Category 1): ≥ 30 Mbps</li>
                        <li>Sub-urban (Category 2): ≥ 25 Mbps</li>
                        <li>Rural (Category 3): ≥ 20 Mbps</li>
                        <li>Uplink (All Categories): ≥ 10 Mbps</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-sm md:text-base font-semibold text-foreground">5G Networks:</h4>
                      <ul className="list-disc pl-5 mt-1 space-y-1 text-sm md:text-base leading-relaxed text-muted-foreground">
                        <li>Urban (Category 1): ≥ 100 Mbps</li>
                        <li>Sub-urban (Category 2): ≥ 80 Mbps</li>
                        <li>Rural (Category 3): ≥ 50 Mbps</li>
                        <li>Uplink: Ranges from ≥ 10 Mbps (Rural) to ≥ 40 Mbps (Urban)</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-sm md:text-base font-semibold text-foreground">3G Networks:</h4>
                      <p className="mt-1 text-sm md:text-base leading-relaxed text-muted-foreground">The average downlink throughput per user is set at ≥ 5.00 Mbps.</p>
                    </div>
                  </div>
                </div>

                {/* Call Drop Rate */}
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground">Call Drop Rate Standards</h3>
                  <p className="mt-1 text-sm md:text-base leading-relaxed text-muted-foreground">The Call Drop Rate is defined as the probability that a call terminates unexpectedly without the user's action.</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-sm md:text-base leading-relaxed text-muted-foreground">
                    <li><span className="font-semibold text-foreground">Target:</span> For 2G, 3G, and 4G (ERAB drop rate) networks, the target is ≤ 2%.</li>
                    <li><span className="font-semibold text-foreground">Compliance:</span> At least 95% of cells must record measurement values meeting this target for real traffic.</li>
                  </ul>
                </div>

                {/* Network Availability */}
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground">Network Availability Targets</h3>
                  <p className="mt-1 text-sm md:text-base leading-relaxed text-muted-foreground">Network or Cell Availability measures the percentage of time a cell is operational and capable of handling traffic.</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-sm md:text-base leading-relaxed text-muted-foreground">
                    <li><span className="font-semibold text-foreground">Mobile Networks (3G, 4G, 5G):</span> The target is ≥ 99%.</li>
                    <li><span className="font-semibold text-foreground">Broadband Services:</span> The service availability target is also ≥ 99%.</li>
                  </ul>
                </div>

                {/* Customer Service Response Time */}
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground">Customer Service Response Time</h3>
                  <p className="mt-1 text-sm md:text-base leading-relaxed text-muted-foreground">The guidelines define "Call Centre Operator Response" as the time taken for an operator to answer a customer's call after the option to speak to an assistant has been chosen.</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-sm md:text-base leading-relaxed text-muted-foreground">
                    <li><span className="font-semibold text-foreground">Interactive Voice Response (IVR):</span> The duration before a customer can make a choice must be &lt; 15 seconds.</li>
                    <li><span className="font-semibold text-foreground">Call Centre Operator:</span> Once the option for an assistant is selected, the operator must pick up within &lt; 180 seconds.</li>
                    <li><span className="font-semibold text-foreground">Complaint Resolution:</span> Licensees must resolve customer complaints within the timeframe specified in the BOCRA complaints handling procedure.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Type Approval */}
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">Type Approval</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground">Definition</h3>
                  <p className="mt-1 text-sm md:text-base leading-relaxed text-muted-foreground">Type Approval refers to the official process by which BOCRA verifies and certifies that communications equipment meets specific technical standards and regulatory requirements before it can be sold or used in Botswana.</p>
                </div>

                <div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground">Why it is Required</h3>
                  <p className="mt-1 text-sm md:text-base leading-relaxed text-muted-foreground">Through Type Approval of Radio Telecommunications Terminal Equipment (RTTE) and Telecommunications Terminal Equipment (TTE), BOCRA ensures the integrity and reliability of the nation's communication infrastructure. This process is essential for ensuring that all such devices adhere to the:</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-sm md:text-base leading-relaxed text-muted-foreground">
                    <li><span className="font-semibold text-foreground">National Frequency Plan:</span> Equipment must operate within the frequency allocations specified by Botswana's National Frequency Plan to avoid interference with other communication systems.</li>
                    <li><span className="font-semibold text-foreground">Health & Safety Standards:</span> Devices must meet strict health and safety guidelines to prevent harm to users and ensure safe operation.</li>
                    <li><span className="font-semibold text-foreground">Electromagnetic Conformity Standards:</span> Equipment must comply with electromagnetic compatibility (EMC) standards to ensure it does not emit excessive electromagnetic interference (EMI) and is immune to a reasonable level of EMI from other devices.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground">What Equipment Needs Approval</h3>
                  <ul className="list-disc pl-5 mt-1 space-y-1 text-sm md:text-base leading-relaxed text-muted-foreground">
                    <li>Radio Telecommunications Terminal Equipment (RTTE)</li>
                    <li>Telecommunications Terminal Equipment (TTE)</li>
                    <li>All communications equipment used in Botswana</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground">What Documents are Needed to Apply</h3>
                  <p className="mt-1 text-sm md:text-base leading-relaxed text-muted-foreground">The Type Approval application form is in 4 steps:</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-sm md:text-base leading-relaxed text-muted-foreground">
                    <li><span className="font-semibold text-foreground">Applicant Details:</span> The requestor selects the accredited customer they are applying for Type Approval, then selects the accredited Manufacturer of the equipment intending to Type Approve and selects an accredited Repair Service Provider.</li>
                    <li><span className="font-semibold text-foreground">Equipment Information:</span> Provide the equipment model details and a sample IMEI for SIM-enabled devices.</li>
                    <li><span className="font-semibold text-foreground">Technical Details:</span> Provide frequency details for the device model.</li>
                    <li><span className="font-semibold text-foreground">Attachments:</span> Declaration of conformity/Certificate, RF Test Report, Brief of Technical Description, EMC Test Report, Health and Safety Report, Equipment Image, SAR Test Report.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground">What are the Fees</h3>
                  <p className="mt-1 text-sm md:text-base leading-relaxed text-muted-foreground">The fees are determined by an invoice that is sent after completing the application and being approved.</p>
                </div>

                <div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground">How Long it Takes</h3>
                  <p className="mt-1 text-sm md:text-base leading-relaxed text-muted-foreground">There is no specified time but the workflow involves multiple stages: initial review, validation, payment processing and final certificate issuance. Requesters can track the real-time status (e.g. Pending, Validated, Approved) through their account dashboard.</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="border-t pt-8 mt-8">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">Quick Actions</h2>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent("toggle-complaint-modal"))}
                  className="px-5 py-2.5 bg-blue-700 text-white rounded-md text-sm font-medium hover:bg-blue-800 transition"
                >
                  File a Complaint
                </button>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent("toggle-track-complaint-modal"))}
                  className="px-5 py-2.5 bg-blue-700 text-white rounded-md text-sm font-medium hover:bg-blue-800 transition"
                >
                  Track a Complaint
                </button>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent("toggle-type-approval-modal"))}
                  className="px-5 py-2.5 bg-blue-700 text-white rounded-md text-sm font-medium hover:bg-blue-800 transition"
                >
                  Apply for Type Approval
                </button>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent("toggle-verify-licence-modal"))}
                  className="px-5 py-2.5 bg-blue-700 text-white rounded-md text-sm font-medium hover:bg-blue-800 transition"
                >
                  Verify a Licence
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <BottomBar />
      <TypeApprovalModal />
    </div>
  );
};

export default ConsumerEducation;
