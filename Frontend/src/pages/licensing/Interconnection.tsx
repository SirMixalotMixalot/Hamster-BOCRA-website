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
    title: "What is Interconnection?",
    content: (
      <div className="space-y-3 text-sm md:text-base leading-relaxed text-muted-foreground">
        <p>
          Interconnection means the physical and logical linking of Telecommunication Systems in order to allow the Users of one Telecommunications System to communicate with Users of the same or another Telecommunications System, or to access services provided by another Licensee.
        </p>
        <p>
          Interconnection is fundamental to ensuring that customers of one network can reach customers on another network, enabling universal connectivity across Botswana's telecommunications landscape.
        </p>
      </div>
    ),
  },
  {
    title: "Interconnect Links Between Public Exchanges",
    content: (
      <div className="space-y-3 text-sm md:text-base leading-relaxed text-muted-foreground">
        <p>Technical matters to be covered in interconnection agreements include, but are not limited to:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Minimum number of interconnect links.</li>
          <li>Maximum interconnect link capacity.</li>
          <li>Requirements to interconnect to specific exchanges.</li>
          <li>Signalling requirements.</li>
        </ul>
        <p>Licensees shall define the technical interconnection rules within their Reference Interconnection Offers (RIOs). Technical interconnection rules shall not be anti-competitive nor shall they represent an unreasonable obstacle to interconnection. The Authority has the right to approve or withhold approval from any such rules.</p>
      </div>
    ),
  },
  {
    title: "Number of Interconnect Links",
    content: (
      <div className="space-y-3 text-sm md:text-base leading-relaxed text-muted-foreground">
        <p>
          In order to protect the interconnection service resilience, Licensees may require other Licensees to interconnect to a specified minimum number of their exchanges and to specify particular exchanges or levels of switching.
        </p>
        <p>
          In general, Licensees should not define a maximum limit on the number of interconnect links to any other Licensee. In any instance where it might be considered necessary to constrain capacity on either a temporary or permanent basis, the Authority shall be consulted immediately before any constraints would come into force.
        </p>
      </div>
    ),
  },
  {
    title: "Link Direction and Capacity",
    content: (
      <div className="space-y-3 text-sm md:text-base leading-relaxed text-muted-foreground">
        <p><span className="font-semibold text-foreground">Link Direction:</span> Licensees providing interconnection of public exchanges shall enable Licensees using its service to designate interconnect links as being either uni-directional (in either direction) or bi-directional (both-way). The use of uni-directional routes segregated by traffic type can protect certain traffic streams against congestion caused by others and provide differing Grades of Service to particular traffic streams.</p>
        <p><span className="font-semibold text-foreground">Link Capacity:</span> At a minimum, voice networks of Licensees shall be interconnected in multiples of 2 Mbps (2048 Kbps) E1 transmission links. Licensees providing interconnection of public exchanges may define a minimum and a maximum capacity for any interconnect link.</p>
        <p>Licensees should not place excessive reliance on any particular interconnect link as this may endanger interconnection service resilience. Licensees should endeavour to spread interconnection traffic over a number of diverse interconnect links.</p>
      </div>
    ),
  },
  {
    title: "Point of Interconnection",
    content: (
      <div className="space-y-3 text-sm md:text-base leading-relaxed text-muted-foreground">
        <p>
          The Point of Interconnection is defined as the boundary between the networks of interconnected Licensees and is located at some point on the transmission interconnect link.
        </p>
        <p>The Point of Interconnection may be located at:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><span className="font-semibold text-foreground">Collocation:</span> at the premises of the Licensee providing interconnection.</li>
          <li><span className="font-semibold text-foreground">Customer Sited Interconnect:</span> within the premises of the Licensee requesting interconnection.</li>
          <li><span className="font-semibold text-foreground">In-Span Interconnect:</span> at a point in between their respective premises.</li>
        </ul>
        <p>Licensees shall be responsible for providing, operating and maintaining the transmission equipment up to the point of interconnection. They shall be considered as owning any transmission equipment and infrastructure up to the point of interconnection.</p>
        <p>Licensees shall be responsible for the traffic carried over their own network up to (for outgoing traffic) or from (for incoming traffic) the point of interconnection.</p>
      </div>
    ),
  },
  {
    title: "Interconnect Extension Circuits and Transmission Technologies",
    content: (
      <div className="space-y-3 text-sm md:text-base leading-relaxed text-muted-foreground">
        <p>
          Licensees providing interconnection shall enable Licensees to whom they are providing a service to lease interconnection transmission links from the point of interconnection to other points in their network in order to enable switching interconnection to a greater number of exchanges.
        </p>
        <p>Licensees shall support the use of modern transmission technologies for interconnect links and should consider the resilience of transmission routes including:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Redundancy and diverse routing</li>
          <li>Path protection and separation</li>
          <li>Diversity and ring architectures</li>
        </ul>
      </div>
    ),
  },
  {
    title: "Signalling Networks and Interface Standards",
    content: (
      <div className="space-y-3 text-sm md:text-base leading-relaxed text-muted-foreground">
        <p>
          Licensees providing interconnection shall specify the signalling configuration to be used on interconnect links within their RIOs and shall notify interconnected Licensees of any modification in the adopted International Telecommunication Union (ITU) signalling system within a reasonable time in advance.
        </p>
        <p>Licensees shall adhere, as far as possible, to the appropriate ITU technical standards related to interconnection interfaces. Licensees offering interconnection services shall:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>State the technical standards used for interconnection within their RIOs.</li>
          <li>Provide reasonable notice to interconnected Licensees of any modifications to the technical standards related to interconnection interfaces.</li>
          <li>Collaborate with interconnected Licensees to overcome any technical problems.</li>
        </ul>
      </div>
    ),
  },
  {
    title: "Numbering",
    content: (
      <div className="space-y-3 text-sm md:text-base leading-relaxed text-muted-foreground">
        <p>PSTN Licensees shall provide details of the number ranges which are hosted on each of their local exchanges. Licensees using the service may then route calls to those number ranges directly on the interconnect link to the local exchange.</p>
        <p>Mobile Licensees shall provide details of the active number ranges.</p>
      </div>
    ),
  },
  {
    title: "Quality of Service",
    content: (
      <div className="space-y-3 text-sm md:text-base leading-relaxed text-muted-foreground">
        <p>Licensees providing interconnection services shall do so with the same quality of service as for calls carried wholly on their own networks.</p>
        <p>Licensees shall work jointly to ensure the overall quality of the calls which are made via an interconnection point and their own networks. Licensees shall adopt general principles regarding standards, techniques and methods in order to guarantee the quality of telecommunication networks and services, as stipulated in ITU recommendations.</p>
        <p>Licensees shall define a number of Quality of Service measures that they shall provide to and expect from interconnected Licensees within their RIOs.</p>
      </div>
    ),
  },
];

const Interconnection = () => {
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
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">Interconnection</h1>
          </div>

          <div className="space-y-4 mb-8">
            <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
              Interconnection is the physical and logical linking of Telecommunication Systems in order to allow the Users of one Telecommunications System to communicate with Users of the same or another Telecommunications System, or to access services provided by another Licensee. BOCRA sets out guidelines and regulations that govern interconnection between licensed operators in Botswana.
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

export default Interconnection;
