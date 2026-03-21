import { Users, Briefcase, BookOpen, ArrowRight } from "lucide-react";

const roles = [
  {
    icon: Users,
    title: "Citizens & Consumers",
    description: "File complaints, check your rights, verify service providers, and access consumer protection resources.",
    actions: ["File a Complaint", "Consumer Rights", "Service Quality", "FAQs"],
    gradient: "from-primary to-bocra-sky",
  },
  {
    icon: Briefcase,
    title: "Businesses & Licensees",
    description: "Apply for licences, manage compliance, access regulatory frameworks, and download required forms.",
    actions: ["Apply for Licence", "Compliance Guide", "Type Approval", "Forms"],
    gradient: "from-secondary to-bocra-green",
  },
  {
    icon: BookOpen,
    title: "Researchers & Media",
    description: "Access telecom statistics, published reports, press releases, speeches, and consultation documents.",
    actions: ["Statistics", "Publications", "Press Releases", "Consultations"],
    gradient: "from-bocra-slate to-bocra-navy",
  },
];

const RolePathways = () => {
  return (
    <section className="py-16 md:py-20 bg-surface-cool" id="pathways">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">How Can We Help You?</h2>
          <p className="mt-2 text-muted-foreground text-sm">Find services tailored to your needs</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {roles.map((role) => (
            <div key={role.title} className="bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-all duration-300 group">
              <div className={`h-2 bg-gradient-to-r ${role.gradient}`} />
              <div className="p-6">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
                  <role.icon className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{role.title}</h3>
                <p className="text-sm text-muted-foreground mb-5">{role.description}</p>
                <div className="space-y-2">
                  {role.actions.map((action) => (
                    <a key={action} href="#" className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted/60 text-sm text-foreground transition-colors group/item">
                      <span>{action}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover/item:text-primary group-hover/item:translate-x-0.5 transition-all" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RolePathways;
