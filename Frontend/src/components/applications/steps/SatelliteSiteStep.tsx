import type { StepProps } from "@/lib/applicationStepConfig";
import StepContainer from "../wizard/StepContainer";
import FormField from "../shared/FormField";
import FormSection from "../shared/FormSection";
import CoordinateInput from "../shared/CoordinateInput";

const SATELLITE_TYPES = ["INTELSAT", "VSAT", "INMARSAT A", "SNG", "INMARSAT B LAND", "SATELLITE LINK", "INMARSAT C", "INMARSAT M LAND", "Other"];
const SITE_CATEGORIES = ["Host", "Repeater", "Transmit"];

export default function SatelliteSiteStep({ data, onChange, readOnly }: StepProps) {
  const update = (name: string, value: string) => onChange({ ...data, [name]: value });

  return (
    <StepContainer
      title="Satellite Site Details"
      description="Provide details about the satellite earth station and service type."
    >
      {/* Satellite Site Type */}
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-2">Satellite Site Type</label>
        <div className="flex flex-wrap gap-2">
          {SATELLITE_TYPES.map((t) => (
            <button key={t} type="button" disabled={readOnly} onClick={() => update("satellite_type", t)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${data.satellite_type === t ? "bg-gradient-to-r from-primary to-[hsl(210_85%_35%)] text-primary-foreground shadow-glow-primary" : "bg-[hsl(var(--input-bg))] text-foreground border border-[hsl(var(--input-border))] hover:bg-primary/5 hover:border-primary/30 hover:text-primary"}`}
            >{t}</button>
          ))}
        </div>
      </div>

      {/* Site Category */}
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-2">Site Category</label>
        <div className="flex flex-wrap gap-2">
          {SITE_CATEGORIES.map((t) => (
            <button key={t} type="button" disabled={readOnly} onClick={() => update("site_category", t)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${data.site_category === t ? "bg-gradient-to-r from-primary to-[hsl(210_85%_35%)] text-primary-foreground shadow-glow-primary" : "bg-[hsl(var(--input-bg))] text-foreground border border-[hsl(var(--input-border))] hover:bg-primary/5 hover:border-primary/30 hover:text-primary"}`}
            >{t}</button>
          ))}
        </div>
      </div>

      <FormSection title="Site Location">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Site Location" name="site_location" value={data.site_location || ""} onChange={update} readOnly={readOnly} />
          <FormField label="Street" name="station_street" value={data.station_street || ""} onChange={update} readOnly={readOnly} />
          <FormField label="Township" name="township" value={data.township || ""} onChange={update} readOnly={readOnly} />
          <FormField label="City/Town" name="station_city" value={data.station_city || ""} onChange={update} required readOnly={readOnly} />
          <FormField label="District" name="district" value={data.district || ""} onChange={update} required readOnly={readOnly} />
          <FormField label="Country" name="station_country" value={data.station_country || ""} onChange={update} required readOnly={readOnly} placeholder="Botswana" />
        </div>
        <CoordinateInput data={data} onChange={update} prefix="station" readOnly={readOnly} />
      </FormSection>

      <FormSection title="Frequencies">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Uplink Frequency (MHz)" name="uplink_frequency" value={data.uplink_frequency || ""} onChange={update} required readOnly={readOnly} />
          <FormField label="Downlink Frequency (MHz)" name="downlink_frequency" value={data.downlink_frequency || ""} onChange={update} readOnly={readOnly} />
          <FormField label="Operational Date" name="operational_date" value={data.operational_date || ""} onChange={update} type="date" readOnly={readOnly} />
        </div>
      </FormSection>
    </StepContainer>
  );
}
