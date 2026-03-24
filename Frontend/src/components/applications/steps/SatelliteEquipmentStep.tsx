import type { StepProps } from "@/lib/applicationStepConfig";
import StepContainer from "../wizard/StepContainer";
import FormField from "../shared/FormField";
import FormSection from "../shared/FormSection";

export default function SatelliteEquipmentStep({ data, onChange, readOnly }: StepProps) {
  const update = (name: string, value: string) => onChange({ ...data, [name]: value });

  return (
    <StepContainer
      title="Equipment & Antenna"
      description="Provide satellite equipment and antenna specifications."
    >
      <FormSection title="Equipment">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Make" name="make" value={data.make || ""} onChange={update} required readOnly={readOnly} />
          <FormField label="Model" name="model" value={data.model || ""} onChange={update} required readOnly={readOnly} />
          <FormField label="Equipment Serial Number" name="serial_number" value={data.serial_number || ""} onChange={update} required readOnly={readOnly} />
          <FormField label="Power to Antenna" name="power_to_antenna" value={data.power_to_antenna || ""} onChange={update} required readOnly={readOnly} />
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">Power Unit</label>
            <div className="flex gap-2">
              {["Watts", "dBm"].map((u) => (
                <button key={u} type="button" disabled={readOnly} onClick={() => update("power_unit", u)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${data.power_unit === u ? "bg-primary text-primary-foreground shadow-sm" : "bg-white/50 text-foreground border border-white/80 hover:bg-white/70"}`}
                >{u}</button>
              ))}
            </div>
          </div>
        </div>
      </FormSection>

      <FormSection title="Antenna">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Antenna Make" name="antenna_make" value={data.antenna_make || ""} onChange={update} required readOnly={readOnly} />
          <FormField label="Antenna Model" name="antenna_model" value={data.antenna_model || ""} onChange={update} required readOnly={readOnly} />
          <FormField label="Antenna Gain (dB)" name="antenna_gain" value={data.antenna_gain || ""} onChange={update} required readOnly={readOnly} />
          <FormField label="Polarization" name="polarization" value={data.polarization || ""} onChange={update} required readOnly={readOnly} />
          <FormField label="Antenna Height (m)" name="antenna_height" value={data.antenna_height || ""} onChange={update} required readOnly={readOnly} />
          <FormField label="Main Lobe Azimuth (deg)" name="main_lobe_azimuth" value={data.main_lobe_azimuth || ""} onChange={update} required readOnly={readOnly} />
          <FormField label="Beam Width Horizontal (deg)" name="beam_width_h" value={data.beam_width_h || ""} onChange={update} required readOnly={readOnly} />
          <FormField label="Beam Width Vertical (deg)" name="beam_width_v" value={data.beam_width_v || ""} onChange={update} required readOnly={readOnly} />
          <FormField label="Antenna Diameter (m)" name="antenna_diameter" value={data.antenna_diameter || ""} onChange={update} required readOnly={readOnly} />
        </div>
      </FormSection>
    </StepContainer>
  );
}
