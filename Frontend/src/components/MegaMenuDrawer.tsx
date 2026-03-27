import { useEffect, useRef } from "react";
import type { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (target?.closest("[data-mega-menu-trigger='true']")) {
        return;
      }

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
                          if (item.action.startsWith("navigate:")) {
                            navigate(item.action.replace("navigate:", ""));
                          } else if (item.action.startsWith("open-url:")) {
                            window.open(item.action.replace("open-url:", ""), "_blank", "noopener,noreferrer");
                          } else {
                            window.dispatchEvent(new CustomEvent(item.action));
                          }
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
        </div>
      </div>
    </div>
  );
};

export default MegaMenuDrawer;
