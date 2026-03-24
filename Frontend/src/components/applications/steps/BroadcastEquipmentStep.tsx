import type { StepProps } from "@/lib/applicationStepConfig";
import StepContainer from "../wizard/StepContainer";
import FormField from "../shared/FormField";
import FormSection from "../shared/FormSection";

const EQUIPMENT_TYPES = ["Transceiver", "Transmitter", "Receiver"];

export default function BroadcastEquipmentStep({ data, onChange, readOnly }: StepProps) {
  const update = (name: string, value: string) => onChange({ ...data, [name]: value });

  return (
    <StepContainer
      title="Equipment & Antenna"
      description="Provide details about the broadcasting equipment and antenna."
    >
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-2">Equipment Type</label>
        <div className="flex flex-wrap gap-2">
          {EQUIPMENT_TYPES.map((t) => (
            <button key={t} type="button" disabled={readOnly} onClick={() => update("equipment_type", t)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${data.equipment_type === t ? "bg-gradient-to-r from-primary to-[hsl(210_85%_35%)] text-primary-foreground shadow-glow-primary" : "bg-[hsl(var(--input-bg))] text-foreground border border-[hsl(var(--input-border))] hover:bg-primary/5 hover:border-primary/30 hover:text-primary"}`}
            >{t}</button>
          ))}
        </div>
      </div>

      <FormSection title="Equipment Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Callsign" name="callsign" value={data.callsign || ""} onChange={update} readOnly={readOnly} />
          <FormField label="Approval Number" name="approval_number" value={data.approval_number || ""} onChange={update} readOnly={readOnly} />
          <FormField label="Make" name="make" value={data.make || ""} onChange={update} readOnly={readOnly} />
          <FormField label="Model" name="model" value={data.model || ""} onChange={update} readOnly={readOnly} />
          <FormField label="Serial Number" name="serial_number" value={data.serial_number || ""} onChange={update} readOnly={readOnly} />
          <FormField label="Frequency Range" name="frequency_range" value={data.frequency_range || ""} onChange={update} readOnly={readOnly} />
          <FormField label="Bandwidth (KHz)" name="bandwidth" value={data.bandwidth || ""} onChange={update} readOnly={readOnly} />
          <FormField label="Preferred Frequency Band" name="preferred_frequency_band" value={data.preferred_frequency_band || ""} onChange={update} readOnly={readOnly} />
          <FormField label="Output Power" name="output_power" value={data.output_power || ""} onChange={update} readOnly={readOnly} />
          <FormField label="Total Preset Channels" name="total_preset_channels" value={data.total_preset_channels || ""} onChange={update} type="number" readOnly={readOnly} />
          <FormField label="Channel Width (MHz)" name="channel_width" value={data.channel_width || ""} onChange={update} readOnly={readOnly} />
          <FormField label="Emission Class" name="emission_class" value={data.emission_class || ""} onChange={update} readOnly={readOnly} />
          <FormField label="Modulation Type" name="modulation_type" value={data.modulation_type || ""} onChange={update} readOnly={readOnly} />
          <FormField label="Rx Sensitivity (dBm)" name="rx_sensitivity" value={data.rx_sensitivity || ""} onChange={update} readOnly={readOnly} />
          <FormField label="Rx Selectivity" name="rx_selectivity" value={data.rx_selectivity || ""} onChange={update} readOnly={readOnly} />
        </div>
      </FormSection>

      <FormSection title="Antenna">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Antenna Type" name="antenna_type" value={data.antenna_type || ""} onChange={update} readOnly={readOnly} />
          <FormField label="Antenna Gain (dB)" name="antenna_gain" value={data.antenna_gain || ""} onChange={update} readOnly={readOnly} />
          <FormField label="Polarization" name="polarization" value={data.polarization || ""} onChange={update} readOnly={readOnly} />
          <FormField label="Antenna Height (m)" name="antenna_height" value={data.antenna_height || ""} onChange={update} readOnly={readOnly} />
          <FormField label="Main Lobe Azimuth (deg)" name="main_lobe_azimuth" value={data.main_lobe_azimuth || ""} onChange={update} readOnly={readOnly} />
          <FormField label="Beam Width (deg)" name="beam_width" value={data.beam_width || ""} onChange={update} readOnly={readOnly} />
          <FormField label="Feed Type" name="feed_type" value={data.feed_type || ""} onChange={update} readOnly={readOnly} />
          <FormField label="Feed Length (m)" name="feed_length" value={data.feed_length || ""} onChange={update} readOnly={readOnly} />
        </div>
      </FormSection>
    </StepContainer>
  );
}
