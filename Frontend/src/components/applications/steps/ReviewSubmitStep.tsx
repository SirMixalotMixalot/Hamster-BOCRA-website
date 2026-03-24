import type { StepProps, StepConfig } from "@/lib/applicationStepConfig";
import StepContainer from "../wizard/StepContainer";
import { Check } from "lucide-react";

interface ReviewSubmitStepProps extends StepProps {
  allFormData?: {
    form_data_a: Record<string, any>;
    form_data_b: Record<string, any>;
    form_data_c: Record<string, any>;
    form_data_d: Record<string, any>;
  };
  steps?: StepConfig[];
}

function DataSection({ title, data }: { title: string; data: Record<string, any> }) {
  const entries = Object.entries(data).filter(
    ([, v]) => v !== "" && v !== null && v !== undefined && !(Array.isArray(v) && v.length === 0),
  );

  if (entries.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5">
        {entries.map(([key, value]) => {
          // Skip internal/complex fields
          if (key === "files" || key === "signature") return null;
          if (typeof value === "object" && !Array.isArray(value)) return null;

          const label = key
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase())
            .replace("Physical ", "")
            .replace("Postal ", "");

          return (
            <div key={key} className="flex items-baseline gap-2 py-0.5">
              <span className="text-xs text-muted-foreground shrink-0">{label}:</span>
              <span className="text-sm font-medium text-foreground truncate">
                {Array.isArray(value) ? `${value.length} entries` : String(value)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ReviewSubmitStep({ licenceType, allFormData }: ReviewSubmitStepProps) {
  const fd = allFormData || { form_data_a: {}, form_data_b: {}, form_data_c: {}, form_data_d: {} };

  const hasSignature = !!fd.form_data_d?.signature;
  const fileCount = fd.form_data_d?.files?.length || 0;

  return (
    <StepContainer
      title="Review & Submit"
      description="Please review all details before submitting your application."
    >
      {/* Licence Type Badge */}
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-primary/10 border border-primary/20">
        <span className="text-xs font-medium text-muted-foreground">Licence Type:</span>
        <span className="text-sm font-semibold text-primary">{licenceType}</span>
      </div>

      {/* Form Data Sections */}
      <div className="space-y-6 divide-y divide-white/40">
        <DataSection title="Applicant Particulars" data={fd.form_data_a} />
        <div className="pt-4">
          <DataSection title="Technical Details" data={fd.form_data_b} />
        </div>
        <div className="pt-4">
          <DataSection title="Equipment & Specifications" data={fd.form_data_c} />
        </div>
      </div>

      {/* Documents & Signature Summary */}
      <div className="space-y-3 pt-4 border-t border-white/40">
        <h3 className="text-sm font-semibold text-foreground">Documents & Signature</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/30 border border-white/60">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${fileCount > 0 ? "bg-green-500" : "bg-muted"}`}>
              <Check className={`h-3 w-3 ${fileCount > 0 ? "text-white" : "text-muted-foreground"}`} />
            </div>
            <span className="text-sm">{fileCount} document{fileCount !== 1 ? "s" : ""} uploaded</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/30 border border-white/60">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${hasSignature ? "bg-green-500" : "bg-muted"}`}>
              <Check className={`h-3 w-3 ${hasSignature ? "text-white" : "text-muted-foreground"}`} />
            </div>
            <span className="text-sm">{hasSignature ? "Signature provided" : "No signature"}</span>
          </div>
        </div>
      </div>
    </StepContainer>
  );
}
