import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  collapsible?: boolean;
}

export default function FormSection({
  title,
  description,
  children,
  defaultOpen = true,
  collapsible = false,
}: FormSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="space-y-4">
      <div
        className={`flex items-center justify-between ${collapsible ? "cursor-pointer" : ""}`}
        onClick={collapsible ? () => setOpen(!open) : undefined}
      >
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><span className="w-1 h-4 bg-primary rounded-full shrink-0" />{title}</h3>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
        {collapsible && (
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
          />
        )}
      </div>
      {collapsible ? (
        <div
          className="grid transition-[grid-template-rows] duration-300"
          style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
        >
          <div className="overflow-hidden">
            <div className="space-y-4">{children}</div>
          </div>
        </div>
      ) : (
        <div className="glass-subtle rounded-xl p-4 space-y-4">{children}</div>
      )}
    </div>
  );
}
