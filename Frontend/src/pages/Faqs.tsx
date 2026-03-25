import BottomBar from "@/components/BottomBar";
import Header from "@/components/Header";

const faqs = [
  {
    question: "How do I lodge a complaint against my service provider?",
    answer:
      "First exhaust all complaint channels with your provider (for example BTC, Mascom, or Orange). If the issue remains unresolved, contact BOCRA's Consumer Affairs Manager.",
  },
  {
    question: "What issues can BOCRA investigate?",
    answer:
      "BOCRA handles disputes related to billing, failed equipment repairs, internet service quality, and interconnection delays.",
  },
  {
    question: "How can I verify if a mobile phone or gadget is legal for use in Botswana?",
    answer:
      "Ask the retailer for a Type Approval Certificate before buying telecommunications equipment.",
  },
  {
    question: "What are my rights as a telecommunications consumer?",
    answer:
      "Your rights include access to quality services, clear pricing, and protection from unfair trade practices.",
  },
  {
    question: "What are the fees for an ISP or Data Service Provider license?",
    answer:
      "The initial fee is P10,000.00 (once-off) and the annual fee is P3,000.00. Both fees are subject to VAT.",
  },
  {
    question: "How do I apply for a Citizen Band (CB) Radio license?",
    answer:
      "Application forms are available from the BOCRA website and BOCRA offices.",
  },
  {
    question: "What sectors does BOCRA regulate?",
    answer:
      "BOCRA regulates telecommunications, internet, radio communications, broadcasting, and postal services.",
  },
  {
    question: "Who needs a Network Facility Provider (NFP) license?",
    answer:
      "Any operator intending to use radio frequency spectrum (for example 700 MHz or 2.6 GHz bands) requires an NFP license.",
  },
  {
    question: "Where can I find growth trends for mobile phone penetration in Botswana?",
    answer:
      "BOCRA publishes telecommunication market segment reports on its official website.",
  },
  {
    question: "What are Value-Added Networks (VANs)?",
    answer:
      "These networks add extra functionality to basic telecom services, such as specialized data processing or storage.",
  },
  {
    question: "Does BOCRA provide online payment options?",
    answer:
      "Yes. BOCRA provides an online payment gateway that accepts debit and credit cards for various service fees.",
  },
  {
    question: 'What is "Type Approval"?',
    answer:
      "Type Approval is the process through which BOCRA verifies that telecommunications equipment meets safety and technical standards for use in local networks.",
  },
  {
    question: "Where is the BOCRA head office located?",
    answer: "Plot 50671, Independence Avenue, Gaborone.",
  },
  {
    question: "How can I contact BOCRA?",
    answer: "Call (+267) 395 7755 or email info@bocra.org.bw.",
  },
  {
    question: "Where can I access the Communications Regulatory Authority Act?",
    answer:
      "Legislation and draft discussion papers are available in the Documents and Legislation section.",
  },
  {
    question: "Can I buy radios for personal use from outside the country?",
    answer:
      "BOCRA encourages buying from recognized local dealers so support, repair, and proper programming are available locally. Entering Botswana with unlicensed radio equipment is illegal unless there is express authority from BOCRA.",
  },
  {
    question: "Do I have to type-approve equipment that is already type-approved?",
    answer:
      "Type approval is required for equipment entering the market unless it was already approved with BOCRA by the manufacturer on behalf of the distributor. BOCRA may still verify compliance against submitted standards and technical information. Software variations can require new approval.",
  },
  {
    question: "How does a radio dealer assist in acquiring a radio license?",
    answer:
      "A radio dealer sells, repairs, programs, and deprograms radio equipment. Dealers help ensure radios are tuned to allocated frequencies and handled in line with safety and technical expectations.",
  },
  {
    question: "What are the requirements to have equipment type approved?",
    answer:
      "You typically need a completed type approval form, business details, technical specifications, a type approval certificate from Region 1 (Africa and Europe) or another recognized regulator, and a declaration of conformity from the manufacturer.",
  },
  {
    question: "What are the requirements to sell and maintain radio equipment, and how do you get the license?",
    answer:
      "To sell or repair radio equipment, you need a Radio Dealers license from BOCRA. You must demonstrate technical expertise, access to testing and tuning equipment, and financial capability to sustain the business.",
  },
  {
    question: "How do I dispose of radios that I no longer need?",
    answer:
      "Write to BOCRA explaining the intended disposal. Depending on equipment condition, use a dealer to deprogram radios and issue a boarding certificate where applicable. Serviceable radios may be sold to licensed operators or disposed of through auctioneers. Radios must remain licensed under the Telecommunications Act whether in use or not.",
  },
  {
    question: "How long does it take to get a radio license?",
    answer:
      "Normally up to three working days, subject to submission of all required information.",
  },
  {
    question: "What are the requirements to have a radio license?",
    answer:
      "Complete the frequency application form on the BOCRA website with service type and operational area details, include company registration, and complete the license renewal form with equipment details (such as serial number, make, and model).",
  },
  {
    question: "How can I obtain more information on growth trends of telecommunication services in Botswana?",
    answer:
      "BOCRA publishes growth trends for telecommunication market segments on its website.",
  },
  {
    question: "What are Value-Added Networks (VANs)?",
    answer:
      "Value-Added Networks provide additional functionality that increases the value of basic telecommunication services and infrastructure.",
  },
  {
    question: "What are the fees for Internet Service Provider, Data Service Provider, and Private Network licences?",
    answer:
      "The initial once-off fee is P10,000.00 and the annual fee is P3,000.00. Both attract VAT.",
  },
];

const Faqs = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="min-w-0 flex-1 py-12 md:py-16">
        <section className="container max-w-5xl mx-auto px-4">
          <div className="mb-8 md:mb-10">
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">Frequently Asked Questions</h1>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <article key={`${index + 1}-${faq.question}`} className="rounded-2xl border border-border bg-card p-5 md:p-6">
                <h2 className="text-base md:text-lg font-semibold text-foreground">
                  {index + 1}. {faq.question}
                </h2>
                <p className="mt-2 text-sm md:text-base leading-relaxed text-muted-foreground">{faq.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <BottomBar />
    </div>
  );
};

export default Faqs;
