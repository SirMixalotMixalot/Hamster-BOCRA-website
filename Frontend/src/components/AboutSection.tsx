import { Shield, Eye, Target, Award } from "lucide-react";

const pillars = [
  { icon: Shield, label: "Regulatory Excellence", description: "Independent and transparent regulation" },
  { icon: Eye, label: "Consumer Protection", description: "Safeguarding the public interest" },
  { icon: Target, label: "Universal Access", description: "Connectivity for every citizen" },
  { icon: Award, label: "Innovation", description: "Enabling digital transformation" },
];

const AboutSection = () => {
  return (
    <section className="py-16 md:py-20 bg-primary text-primary-foreground" id="about">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">About BOCRA</p>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight">
              Botswana Communications Regulatory Authority
            </h2>
            <p className="mt-4 text-primary-foreground/80 text-sm leading-relaxed">
              Established through the Communications Regulatory Authority Act of 2012, BOCRA is Botswana's converged regulator for telecommunications, internet, broadcasting, and postal services. We promote competition, protect consumers, and enable universal access to quality communications infrastructure.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="px-3 py-1.5 rounded-full border border-primary-foreground/20 text-xs font-medium">Est. 2013</span>
              <span className="px-3 py-1.5 rounded-full border border-primary-foreground/20 text-xs font-medium">4 Sectors</span>
              <span className="px-3 py-1.5 rounded-full border border-primary-foreground/20 text-xs font-medium">100+ Licences</span>
              <span className="px-3 py-1.5 rounded-full border border-primary-foreground/20 text-xs font-medium">Gaborone, BW</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {pillars.map((pillar) => (
              <div key={pillar.label} className="bg-primary-foreground/10 rounded-xl p-5 backdrop-blur-sm border border-primary-foreground/10">
                <pillar.icon className="h-6 w-6 text-accent mb-3" />
                <h3 className="text-sm font-semibold mb-1">{pillar.label}</h3>
                <p className="text-xs text-primary-foreground/70">{pillar.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
