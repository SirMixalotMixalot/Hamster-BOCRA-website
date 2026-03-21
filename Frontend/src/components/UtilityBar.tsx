import { ChevronRight } from "lucide-react";

const newsItems = [
  "BOCRA Launches New Consumer Protection Framework",
  "Public Consultation on 5G Spectrum Allocation Now Open",
  "New Postal Licensing Requirements Effective March 2026",
  "BOCRA Annual Report 2025 Now Available for Download",
  "Upcoming Stakeholder Workshop on Digital Inclusion",
];

const UtilityBar = () => {
  return (
    <div className="bg-bocra-navy text-white/90">
      <div className="container flex items-center justify-between py-1.5 text-xs font-body">
        {/* News ticker on the left */}
        <div className="flex items-center gap-2 overflow-hidden flex-1 mr-4">
          <span className="shrink-0 bg-white/15 text-white text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded tracking-wider">News</span>
          <div className="overflow-hidden relative flex-1">
            <div className="flex animate-marquee whitespace-nowrap gap-8">
              {newsItems.map((item, i) => (
                <a key={i} href="#" className="inline-flex items-center gap-1 hover:text-bocra-gold transition-colors">
                  <ChevronRight className="h-3 w-3 text-bocra-gold shrink-0" />
                  <span>{item}</span>
                </a>
              ))}
              {/* Duplicate for seamless scroll */}
              {newsItems.map((item, i) => (
                <a key={`dup-${i}`} href="#" className="inline-flex items-center gap-1 hover:text-bocra-gold transition-colors">
                  <ChevronRight className="h-3 w-3 text-bocra-gold shrink-0" />
                  <span>{item}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UtilityBar;
