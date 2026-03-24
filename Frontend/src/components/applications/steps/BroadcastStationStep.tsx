import type { StepProps } from "@/lib/applicationStepConfig";
import StepContainer from "../wizard/StepContainer";
import FormField from "../shared/FormField";
import FormSection from "../shared/FormSection";
import CoordinateInput from "../shared/CoordinateInput";

const BROADCAST_TYPES = ["Broadcasting", "Fixed Station", "Mobile Station"];

export default function BroadcastStationStep({ data, onChange, readOnly }: StepProps) {
  const update = (name: string, value: string) => onChange({ ...data, [name]: value });

  return (
    <StepContainer
      title="Station & Site Details"
      description="Provide details about the broadcasting station and operational site."
    >
      {/* Station Type */}
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-2">Station Type</label>
        <div className="flex flex-wrap gap-2">
          {BROADCAST_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              disabled={readOnly}
              onClick={() => update("broadcast_type", t)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                data.broadcast_type === t
                  ? "bg-gradient-to-r from-primary to-[hsl(210_85%_35%)] text-primary-foreground shadow-glow-primary"
                  : "bg-[hsl(var(--input-bg))] text-foreground border border-[hsl(var(--input-border))] hover:bg-primary/5 hover:border-primary/30 hover:text-primary"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <FormSection title="Site Location">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Station Name" name="station_name" value={data.station_name || ""} onChange={update} readOnly={readOnly} />
          <FormField label="Site Category" name="site_category" value={data.site_category || ""} onChange={update} readOnly={readOnly} />
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
          <FormField label="Purpose" name="purpose" value={data.purpose || ""} onChange={update} readOnly={readOnly} />
          <FormField label="Number of Sites" name="number_of_sites" value={data.number_of_sites || ""} onChange={update} type="number" readOnly={readOnly} />
        </div>
      </FormSection>
    </StepContainer>
  );
}
