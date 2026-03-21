import { Calendar, ArrowRight, Tag } from "lucide-react";

const newsItems = [
  {
    type: "Notice",
    typeColor: "bg-bocra-rose/10 text-bocra-rose",
    title: "Public Consultation on Draft ICT Policy Framework 2025",
    date: "March 15, 2026",
    excerpt: "BOCRA invites public comments on the proposed ICT Policy Framework. Submissions due by April 30, 2026.",
  },
  {
    type: "News",
    typeColor: "bg-primary/10 text-primary",
    title: "BOCRA Reports Growth in Mobile Data Usage Across Botswana",
    date: "March 10, 2026",
    excerpt: "Latest telecom statistics show a 23% increase in mobile data consumption year-on-year.",
  },
  {
    type: "Tender",
    typeColor: "bg-secondary/10 text-secondary",
    title: "Tender: Provision of Quality of Service Monitoring Equipment",
    date: "March 5, 2026",
    excerpt: "BOCRA seeks qualified suppliers for QoS monitoring tools. Closing date: April 15, 2026.",
  },
  {
    type: "Notice",
    typeColor: "bg-bocra-gold/10 text-bocra-gold",
    title: "Updated Type Approval Requirements for Communication Devices",
    date: "February 28, 2026",
    excerpt: "New equipment certification standards effective June 1, 2026. Manufacturers advised to review requirements.",
  },
];

const NewsSection = () => {
  return (
    <section className="py-16 md:py-20 bg-surface-cool" id="news">
      <div className="container">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">News, Notices & Tenders</h2>
            <p className="mt-2 text-muted-foreground text-sm">Stay updated with the latest from BOCRA</p>
          </div>
          <a href="#" className="hidden md:flex items-center gap-1 text-sm font-medium text-primary hover:gap-2 transition-all">
            View all <ArrowRight className="h-4 w-4" />
          </a>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          {newsItems.map((item) => (
            <a key={item.title} href="#" className="bg-card rounded-xl p-5 border border-border hover:border-primary/20 hover:shadow-lg transition-all duration-300 group">
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${item.typeColor}`}>
                  <Tag className="inline h-3 w-3 mr-1" />{item.type}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />{item.date}
                </span>
              </div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{item.title}</h3>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{item.excerpt}</p>
            </a>
          ))}
        </div>
        <div className="md:hidden mt-6 text-center">
          <a href="#" className="inline-flex items-center gap-1 text-sm font-medium text-primary">
            View all <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
