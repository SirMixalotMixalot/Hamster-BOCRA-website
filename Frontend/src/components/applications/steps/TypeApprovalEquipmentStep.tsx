import type { StepProps } from "@/lib/applicationStepConfig";
import StepContainer from "../wizard/StepContainer";
import FormField from "../shared/FormField";
import FormSection from "../shared/FormSection";

const RADIO_EQUIPMENT_TYPES = ["Transmitter", "Receiver", "Transceiver"];
const RADIO_FORM_FACTORS = ["Base", "Mobile", "Portable"];

export default function TypeApprovalEquipmentStep({ data, onChange, readOnly }: StepProps) {
  const update = (name: string, value: string) => onChange({ ...data, [name]: value });

  return (
    <StepContainer
      title="Equipment Description"
      description="Describe the telecommunications terminal equipment or radio equipment for type approval."
    >
      <FormSection title="F. Telecommunications Terminal Equipment">
        <div className="space-y-4">
          <FormField label="Type of equipment (modem, telefax, telephone, etc.)" name="telecom_equipment_type" value={data.telecom_equipment_type || ""} onChange={update} readOnly={readOnly} />
          <FormField label="Brief description of the equipment" name="telecom_description" value={data.telecom_description || ""} onChange={update} type="textarea" readOnly={readOnly} />
          <FormField label="Name of equipment" name="telecom_name" value={data.telecom_name || ""} onChange={update} readOnly={readOnly} />
          <FormField label="Product identification (number, version)" name="telecom_product_id" value={data.telecom_product_id || ""} onChange={update} readOnly={readOnly} />
          <FormField label="Software version (if any)" name="telecom_software_version" value={data.telecom_software_version || ""} onChange={update} readOnly={readOnly} />
        </div>
      </FormSection>

      <FormSection title="Radio Equipment">
        <div className="mb-4">
          <label className="block text-xs font-medium text-muted-foreground mb-2">Equipment Type</label>
          <div className="flex flex-wrap gap-2">
            {RADIO_EQUIPMENT_TYPES.map((t) => (
              <button key={t} type="button" disabled={readOnly} onClick={() => update("radio_equipment_type", t)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${data.radio_equipment_type === t ? "bg-primary text-primary-foreground shadow-sm" : "bg-white/50 text-foreground border border-white/80 hover:bg-white/70"}`}
              >{t}</button>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-xs font-medium text-muted-foreground mb-2">Form Factor</label>
          <div className="flex flex-wrap gap-2">
            {RADIO_FORM_FACTORS.map((t) => (
              <button key={t} type="button" disabled={readOnly} onClick={() => update("radio_form_factor", t)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${data.radio_form_factor === t ? "bg-primary text-primary-foreground shadow-sm" : "bg-white/50 text-foreground border border-white/80 hover:bg-white/70"}`}
              >{t}</button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Frequency/Range/Fixed Frequencies (MHz)" name="radio_frequency" value={data.radio_frequency || ""} onChange={update} readOnly={readOnly} />
          <FormField label="Channel Separation (kHz)" name="channel_separation" value={data.channel_separation || ""} onChange={update} readOnly={readOnly} />
          <FormField label="Name/Type Designation" name="radio_type_designation" value={data.radio_type_designation || ""} onChange={update} readOnly={readOnly} />
        </div>
      </FormSection>

      <FormSection title="G. Additional Information" collapsible defaultOpen={false}>
        <FormField label="Additional information" name="additional_info" value={data.additional_info || ""} onChange={update} type="textarea" readOnly={readOnly} />
      </FormSection>
    </StepContainer>
  );
}
