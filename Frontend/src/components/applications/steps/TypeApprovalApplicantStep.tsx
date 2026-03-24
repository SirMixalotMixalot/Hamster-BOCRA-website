import type { StepProps } from "@/lib/applicationStepConfig";
import StepContainer from "../wizard/StepContainer";
import FormField from "../shared/FormField";
import FormSection from "../shared/FormSection";

export default function TypeApprovalApplicantStep({ data, onChange, readOnly }: StepProps) {
  const update = (name: string, value: string) => onChange({ ...data, [name]: value });

  return (
    <StepContainer
      title="Applicant, Manufacturer & Repair Service"
      description="Provide details about the applicant, equipment manufacturer, and local repair service provider."
    >
      <FormSection title="A. Applicant">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Name" name="applicant_name" value={data.applicant_name || ""} onChange={update} required readOnly={readOnly} />
          <FormField label="Telephone" name="applicant_telephone" value={data.applicant_telephone || ""} onChange={update} type="tel" readOnly={readOnly} />
          <FormField label="Address" name="applicant_address" value={data.applicant_address || ""} onChange={update} readOnly={readOnly} />
          <FormField label="Telefax" name="applicant_fax" value={data.applicant_fax || ""} onChange={update} readOnly={readOnly} />
          <FormField label="Contact Person" name="applicant_contact" value={data.applicant_contact || ""} onChange={update} readOnly={readOnly} />
        </div>
      </FormSection>

      <FormSection title="B. Manufacturer">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Name" name="manufacturer_name" value={data.manufacturer_name || ""} onChange={update} required readOnly={readOnly} />
          <FormField label="Telephone" name="manufacturer_telephone" value={data.manufacturer_telephone || ""} onChange={update} type="tel" readOnly={readOnly} />
          <FormField label="Address" name="manufacturer_address" value={data.manufacturer_address || ""} onChange={update} readOnly={readOnly} />
          <FormField label="Telefax" name="manufacturer_fax" value={data.manufacturer_fax || ""} onChange={update} readOnly={readOnly} />
          <FormField label="Contact Person" name="manufacturer_contact" value={data.manufacturer_contact || ""} onChange={update} readOnly={readOnly} />
        </div>
      </FormSection>

      <FormSection title="C. Repair Service Provider in Botswana">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Name" name="repair_name" value={data.repair_name || ""} onChange={update} readOnly={readOnly} />
          <FormField label="Telephone" name="repair_telephone" value={data.repair_telephone || ""} onChange={update} type="tel" readOnly={readOnly} />
          <FormField label="Address" name="repair_address" value={data.repair_address || ""} onChange={update} readOnly={readOnly} />
          <FormField label="Telefax" name="repair_fax" value={data.repair_fax || ""} onChange={update} readOnly={readOnly} />
          <FormField label="Contact Person" name="repair_contact" value={data.repair_contact || ""} onChange={update} readOnly={readOnly} />
        </div>
      </FormSection>
    </StepContainer>
  );
}
