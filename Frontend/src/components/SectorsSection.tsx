import { Wifi, Tv, Package, Globe2, ArrowRight } from "lucide-react";

const sectors = [
  {
    icon: Wifi,
    name: "Telecommunications",
    description: "Regulation of mobile, fixed-line, and data services to ensure quality, competition, and universal access across Botswana.",
    stats: "3 Mobile Operators",
    color: "text-bocra-blue",
    bg: "bg-bocra-blue/10",
  },
  {
    icon: Tv,
    name: "Broadcasting",
    description: "Licensing and oversight of radio and television broadcasters to promote content diversity and public interest.",
    stats: "25+ Licences",
    color: "text-bocra-rose",
    bg: "bg-bocra-rose/10",
  },
  {
    icon: Package,
    name: "Postal Services",
    description: "Ensuring postal and courier services meet accessibility and quality standards nationwide.",
    stats: "Universal Service",
    color: "text-bocra-gold",
    bg: "bg-bocra-gold/10",
  },
  {
    icon: Globe2,
    name: "Internet & ICT",
    description: "Promoting affordable internet access, managing the .bw domain, and advancing Botswana's digital transformation.",
    stats: ".bw Registry",
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
];

const SectorsSection = () => {
  return (
    <section className="py-16 md:py-20" id="sectors">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Sectors We Regulate</h2>
          <p className="mt-2 text-muted-foreground text-sm max-w-lg mx-auto">
            BOCRA oversees Botswana's communications landscape across four key sectors
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          {sectors.map((sector) => (
            <div key={sector.name} className="group bg-card rounded-2xl p-6 border border-border hover:border-primary/20 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-14 h-14 rounded-xl ${sector.bg} flex items-center justify-center`}>
                  <sector.icon className={`h-7 w-7 ${sector.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-foreground">{sector.name}</h3>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${sector.bg} ${sector.color}`}>{sector.stats}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{sector.description}</p>
                  <button className="mt-3 flex items-center gap-1 text-sm font-medium text-primary hover:gap-2 transition-all">
                    Learn more <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SectorsSection;
