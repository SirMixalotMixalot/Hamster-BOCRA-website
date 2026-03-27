import Header from "@/components/Header";
import BottomBar from "@/components/BottomBar";
import boardBg from "@/assets/styling/board.jpg";

const mandates = [
  { letter: "a", text: "Protect and promote the interests of consumers, purchasers and other users of the services in the regulated sectors, particularly in respect of the prices charged for, and the availability, quality and variety of services and products, and where appropriate, the variety of services and products offered throughout Botswana, such as will satisfy all reasonable demands for those services and products." },
  { letter: "b", text: "Where relevant and so far as is practicable, ensure that the regulated sectors have and maintain the resources to provide those services and are otherwise fit and proper persons to provide the services." },
  { letter: "c", text: "Monitor the performance of the regulated sectors in relation to levels of investment, availability, quantity, quality and standards of services, competition, pricing, the costs of services, the efficiency of production and distribution of services and any other matters decided upon by the Authority." },
  { letter: "d", text: "Facilitate and encourage private sector investment and innovation in the regulated sectors." },
  { letter: "e", text: "Enhance public knowledge, awareness and understanding of the regulated sectors." },
  { letter: "f", text: "Foster the development of the supply of services and technology in each regulated sector in accordance with recognised standards." },
  { letter: "g", text: "Encourage the preservation and protection of the environment and conservation of natural resources in accordance with the law by regulated suppliers." },
  { letter: "h", text: "Process applications for and issue licences, permits, permissions, concessions and authorities for regulated sectors as may be prescribed." },
  { letter: "i", text: "Prior to the issuance of Public Telecommunications Operator and broadcasting licenses, notify the Minister." },
  { letter: "j", text: "Impose administrative sanctions and issue and follow up enforcement procedures to ensure compliance with conditions of licences, permits, permissions, concessions, authorities and contracts." },
  { letter: "k", text: "Promote efficiency and economic growth in the regulated sectors and disseminate information about matters relevant to its regulatory function." },
  { letter: "l", text: "Perform all additional functions and duties as may be conferred on it by law." },
  { letter: "m", text: "Hear complaints and disputes from consumers and regulated suppliers and resolve these, or facilitate their resolution." },
  { letter: "n", text: "Consult with other regulatory authorities with a view to improving the regulatory services it offers, and obtaining market intelligence about the sectors it regulates." },
  { letter: "o", text: "Foster and promote the use of consumer forums to provide information to enable it to improve its regulatory duties and functions." },
  { letter: "p", text: "Ensure that the needs of low income, rural or disadvantaged groups of persons are taken into account by regulated suppliers." },
  { letter: "q", text: "Maintain a register of licences, permits, permissions, concessions, authorities, contracts and regulatory decisions which is available to the public and from which the public may obtain a copy of any entry for a prescribed fee." },
  { letter: "r", text: "Make industry regulations for the better carrying out of its responsibilities under this Act including codes and rules of conduct, records to be kept by regulated suppliers, definitions of and information about cost accounting standards, standards applicable to regulated services, complaint handling procedures, circumstances surrounding access rights by one regulated supplier to the facilities owned or controlled by another regulated supplier, records, form and content for Subscriber Identity Module (SIM) card registration to be kept by regulated suppliers, and price control regulations." },
  { letter: "s", text: "Administer and comply with the provisions of this Act." },
  { letter: "t", text: "At the request of the Government, represent Botswana in international regulatory and other fora concerning the regulated sectors." },
  { letter: "u", text: "Advise the Minister on matters relating to the regulated sectors and proposed policy and legislation for those sectors." },
  { letter: "v", text: "Do anything reasonably incidental or conducive to the performance of any of the above duties." },
  { letter: "w", text: "Take regulatory decisions in an open, transparent, accountable, proportionate, and objective manner and not to show undue preference to any person or organization." },
  { letter: "x", text: "Promote and facilitate convergence of technologies." },
];

const OurMandate = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero Banner */}
      <section className="relative flex items-center justify-center -mt-16 py-20 pt-[calc(4rem+5rem)] md:-mt-[72px] md:py-28 md:pt-[calc(4.5rem+7rem)] lg:-mt-[5.75rem] lg:pt-[calc(5.75rem+7rem)]">
        <div className="absolute inset-x-0 -top-1 bottom-0 overflow-hidden">
          <img src={boardBg} alt="" className="h-[calc(100%+4px)] min-h-full w-full -translate-y-px object-cover" />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="relative z-10 container max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Our Mandate</h1>
          <p className="text-lg text-white/80 max-w-3xl mx-auto">
            BOCRA's legal mandates as defined by the Communications Regulatory Act, 2012.
          </p>
        </div>
      </section>

      <main className="min-w-0 flex-1 py-12 md:py-16">
        <section className="container max-w-5xl mx-auto px-4">
          <div className="space-y-6">
            <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
              According to the Communications Regulatory Act, 2012, the Botswana Communications Regulatory Authority has the following legal mandates:
            </p>

            {mandates.map((mandate, index) => (
              <div key={index} className="flex gap-1.5 text-sm md:text-base leading-relaxed text-muted-foreground">
                <span className="font-semibold text-primary shrink-0">{index + 1}.</span>
                <span>{mandate.text}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
      <BottomBar />
    </div>
  );
};

export default OurMandate;
