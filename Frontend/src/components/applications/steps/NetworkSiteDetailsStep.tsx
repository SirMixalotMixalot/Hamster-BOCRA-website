import type { StepProps } from "@/lib/applicationStepConfig";
import StepContainer from "../wizard/StepContainer";
import FormField from "../shared/FormField";
import FormSection from "../shared/FormSection";
import CoordinateInput from "../shared/CoordinateInput";

export default function NetworkSiteDetailsStep({ data, onChange, licenceType, readOnly }: StepProps) {
  const update = (name: string, value: string) => onChange({ ...data, [name]: value });

  return (
    <StepContainer
      title="Operational Site Details"
      description="Provide details about the operational site. You may need to consult your supplier."
    >
      <FormSection title="Site Location">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(licenceType === "Point-to-Point Licence" || licenceType === "Point-to-Multipoint Licence") && (
            <FormField label="Network" name="network" value={data.network || ""} onChange={update} readOnly={readOnly} />
          )}
          <FormField label="Station Name" name="station_name" value={data.station_name || ""} onChange={update} readOnly={readOnly} />
          <FormField label="Street" name="station_street" value={data.station_street || ""} onChange={update} readOnly={readOnly} />
          <FormField label="Ward" name="station_ward" value={data.station_ward || ""} onChange={update} readOnly={readOnly} />
          <FormField label="City" name="station_city" value={data.station_city || ""} onChange={update} readOnly={readOnly} />
          <FormField label="Region" name="station_region" value={data.station_region || ""} onChange={update} readOnly={readOnly} />
          <FormField label="Country" name="station_country" value={data.station_country || ""} onChange={update} readOnly={readOnly} placeholder="Botswana" />
        </div>
        <CoordinateInput data={data} onChange={update} prefix="station" readOnly={readOnly} />
      </FormSection>

      <FormSection title="Service Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Contact Person at Site" name="site_contact_person" value={data.site_contact_person || ""} onChange={update} readOnly={readOnly} />
          <FormField label="Service Class" name="service_class" value={data.service_class || ""} onChange={update} readOnly={readOnly} />
          <FormField label="Station Class" name="station_class" value={data.station_class || ""} onChange={update} readOnly={readOnly} />
          <FormField label="Site Tel. No." name="site_tel" value={data.site_tel || ""} onChange={update} type="tel" readOnly={readOnly} />
          <FormField label="Site Fax No." name="site_fax" value={data.site_fax || ""} onChange={update} readOnly={readOnly} />
        </div>
      </FormSection>
    </StepContainer>
  );
}
