import type { StepProps } from "@/lib/applicationStepConfig";
import StepContainer from "../wizard/StepContainer";
import FormField from "../shared/FormField";
import FormSection from "../shared/FormSection";
import AddressFields from "../shared/AddressFields";
import PostalAddressFields from "../shared/PostalAddressFields";

const CLIENT_TYPES = ["Company", "Person", "Gov/Parastatal", "Other"] as const;

export default function ApplicantParticularsStep({ data, onChange, readOnly }: StepProps) {
  const update = (name: string, value: string) => {
    onChange({ ...data, [name]: value });
  };

  const clientType = data.client_type || "";

  return (
    <StepContainer
      title="Applicant Particulars"
      description="Provide your personal or business details as the licence applicant."
    >
      {/* Client Type Toggle */}
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-2">Client Type</label>
        <div className="flex flex-wrap gap-2">
          {CLIENT_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              disabled={readOnly}
              onClick={() => update("client_type", type)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                clientType === type
                  ? "bg-gradient-to-r from-primary to-[hsl(210_85%_35%)] text-primary-foreground shadow-glow-primary"
                  : "bg-[hsl(var(--input-bg))] text-foreground border border-[hsl(var(--input-border))] hover:bg-primary/5 hover:border-primary/30 hover:text-primary"
              } ${readOnly ? "cursor-default" : ""}`}
            >
              {type}
            </button>
          ))}
        </div>
        {clientType === "Other" && (
          <FormField
            label="Specify"
            name="client_type_other"
            value={data.client_type_other || ""}
            onChange={update}
            readOnly={readOnly}
            className="mt-3 max-w-xs"
          />
        )}
      </div>

      {/* Basic Details */}
      <FormSection title="Basic Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Name" name="name" value={data.name || ""} onChange={update} required readOnly={readOnly} />
          <FormField label="VAT Number" name="vat_number" value={data.vat_number || ""} onChange={update} readOnly={readOnly} />
          <FormField label="Nationality" name="nationality" value={data.nationality || ""} onChange={update} readOnly={readOnly} />
          <FormField label="Customer No." name="customer_no" value={data.customer_no || ""} onChange={update} readOnly={readOnly} />
          <FormField label="Company Reg. Number" name="company_reg_number" value={data.company_reg_number || ""} onChange={update} readOnly={readOnly} />
          <FormField label="Contact Person" name="contact_person" value={data.contact_person || ""} onChange={update} readOnly={readOnly} />
        </div>
      </FormSection>

      {/* Physical Address */}
      <FormSection title="Physical Address">
        <AddressFields prefix="physical" data={data} onChange={update} readOnly={readOnly} />
      </FormSection>

      {/* Postal Address */}
      <FormSection title="Postal Address" collapsible defaultOpen={false}>
        <PostalAddressFields data={data} onChange={update} readOnly={readOnly} />
      </FormSection>
    </StepContainer>
  );
}
