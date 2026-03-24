import type { StepProps } from "@/lib/applicationStepConfig";
import StepContainer from "../wizard/StepContainer";
import FormField from "../shared/FormField";
import FormSection from "../shared/FormSection";
import RepeatableTable from "../shared/RepeatableTable";

export default function NetworkEquipmentStep({ data, onChange, licenceType, readOnly }: StepProps) {
  const update = (name: string, value: string) => onChange({ ...data, [name]: value });
  const isP2P = licenceType === "Point-to-Point Licence";
  const isP2MP = licenceType === "Point-to-Multipoint Licence";
  const isCellular = licenceType === "Cellular Licence";

  return (
    <StepContainer
      title="Equipment, Antenna & Links"
      description="Provide equipment specifications and link details."
    >
      {/* Equipment Details */}
      <FormSection title="Equipment">
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
          {(isP2P || isP2MP) && (
            <>
              <FormField label="Capacity (Mbs/sec)" name="capacity" value={data.capacity || ""} onChange={update} readOnly={readOnly} />
              <FormField label="Rx Selectivity" name="rx_selectivity" value={data.rx_selectivity || ""} onChange={update} readOnly={readOnly} />
              <FormField label="Thresh (dBm) -3" name="thresh_3" value={data.thresh_3 || ""} onChange={update} readOnly={readOnly} />
              <FormField label="Thresh (dBm) -6" name="thresh_6" value={data.thresh_6 || ""} onChange={update} readOnly={readOnly} />
            </>
          )}
          {isCellular && (
            <>
              <FormField label="Rx Sensitivity (dBm)" name="rx_sensitivity" value={data.rx_sensitivity || ""} onChange={update} readOnly={readOnly} />
              <FormField label="Rx Selectivity" name="rx_selectivity" value={data.rx_selectivity || ""} onChange={update} readOnly={readOnly} />
            </>
          )}
        </div>
      </FormSection>

      {/* Antenna Details */}
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

      {/* Point-to-Point / Multipoint Links Table */}
      {(isP2P || isP2MP || isCellular) && (
        <FormSection title={isP2P ? "Microwave Link Details" : "Point-to-Point Links"}>
          <RepeatableTable
            columns={[
              { key: "transmit_station", label: "Transmit Station" },
              { key: "receive_station", label: "Receive Station" },
              { key: "preferred_band", label: "Preferred Band (MHz)" },
              { key: "hop_length", label: "Hop Length" },
              { key: "azimuth", label: "Azimuth" },
            ]}
            rows={data.links || []}
            onChange={(rows) => onChange({ ...data, links: rows })}
            readOnly={readOnly}
            addLabel="Add Link"
          />
        </FormSection>
      )}
    </StepContainer>
  );
}
