import { TrendingUp, Users, Wifi, Phone, Globe2 } from "lucide-react";

const stats = [
  { icon: Phone, label: "Mobile Subscriptions", value: "3.8M+", change: "+5.2%", color: "text-primary" },
  { icon: Wifi, label: "Internet Penetration", value: "67.4%", change: "+8.1%", color: "text-secondary" },
  { icon: Users, label: "Active SIM Cards", value: "4.1M", change: "+3.4%", color: "text-bocra-sky" },
  { icon: Globe2, label: ".bw Domains Registered", value: "12,400+", change: "+12%", color: "text-bocra-gold" },
];

const StatsSection = () => {
  return (
    <section className="py-16 md:py-20" id="statistics">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Telecom at a Glance</h2>
          <p className="mt-2 text-muted-foreground text-sm">Key indicators from Botswana's communications sector</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card rounded-2xl p-5 md:p-6 border border-border text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="text-2xl md:text-3xl font-extrabold text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-1 mb-2">{stat.label}</div>
              <div className="inline-flex items-center gap-0.5 text-xs font-medium text-secondary">
                <TrendingUp className="h-3 w-3" />
                {stat.change} YoY
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
