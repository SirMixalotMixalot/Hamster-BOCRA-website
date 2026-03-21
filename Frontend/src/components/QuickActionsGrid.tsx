import { FileText, MessageSquare, Shield, ClipboardList, BookOpen, BarChart3, Bell, Phone } from "lucide-react";

const actions = [
  { icon: FileText, label: "Apply for a Licence", description: "Start licensing process", color: "bg-primary/10 text-primary" },
  { icon: MessageSquare, label: "File a Complaint", description: "Submit a formal complaint", color: "bg-bocra-rose/10 text-bocra-rose" },
  { icon: Shield, label: "Verify a Licence", description: "Check licence validity", color: "bg-secondary/10 text-secondary" },
  { icon: ClipboardList, label: "Type Approval", description: "Equipment certification", color: "bg-bocra-gold/10 text-bocra-gold" },
  { icon: BookOpen, label: "Documents & Legislation", description: "Acts, policies, guidelines", color: "bg-bocra-sky/10 text-bocra-sky" },
  { icon: BarChart3, label: "Telecom Statistics", description: "Market data & indicators", color: "bg-bocra-green/10 text-bocra-green" },
  { icon: Bell, label: "Notices & Tenders", description: "Public opportunities", color: "bg-bocra-slate/10 text-bocra-slate" },
  { icon: Phone, label: "Contact BOCRA", description: "Get in touch with us", color: "bg-primary/10 text-primary" },
];

const QuickActionsGrid = () => {
  return (
    <section className="py-16 md:py-20" id="quick-actions">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Quick Actions</h2>
          <p className="mt-2 text-muted-foreground text-sm">Access the most common services in one click</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {actions.map((action) => (
            <a
              key={action.label}
              href="#"
              className="group bg-card rounded-xl p-5 border border-border hover:border-primary/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <action.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">{action.label}</h3>
              <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickActionsGrid;
