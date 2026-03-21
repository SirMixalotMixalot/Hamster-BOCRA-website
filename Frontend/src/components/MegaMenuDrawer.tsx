import { useEffect, useRef } from "react";
import { HelpCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type NavSection = {
  title: string;
  items: { icon: LucideIcon; label: string; description: string; action?: string }[];
};

type NavItem = {
  label: string;
  id: string;
  sections: NavSection[];
};

interface MegaMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeItem: NavItem | null;
}

const MegaMenuDrawer = ({ isOpen, onClose, activeItem }: MegaMenuDrawerProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !activeItem) return null;

  return (
    <div className="fixed inset-x-0 top-[72px] z-40 hidden lg:block">
      <div className="absolute inset-0 bg-foreground/10 backdrop-blur-sm" />
      <div ref={ref} className="relative bg-card border-b border-border shadow-xl animate-fade-in">
        <div className="container py-8">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
            {activeItem.sections.map((section) => (
              <div key={section.title}>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">{section.title}</h3>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <a
                      key={item.label}
                      href="#"
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/60 transition-colors group"
                      onClick={(e) => {
                        e.preventDefault();
                        onClose();
                        if (item.action) {
                          window.dispatchEvent(new CustomEvent(item.action));
                        }
                      }}
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{item.label}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{item.description}</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {/* Need Help? */}
          <div className="mt-6 pt-6 border-t border-border flex items-center justify-between bg-muted/40 -mx-8 px-8 -mb-8 py-4 rounded-b-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <HelpCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">Need Help?</div>
                <div className="text-xs text-muted-foreground">Our support team is here to assist you with any questions.</div>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                window.dispatchEvent(new CustomEvent("toggle-contact-modal"));
              }}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MegaMenuDrawer;
