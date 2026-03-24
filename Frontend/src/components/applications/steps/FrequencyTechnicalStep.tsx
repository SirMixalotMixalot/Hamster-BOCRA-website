import type { StepProps } from "@/lib/applicationStepConfig";
import StepContainer from "../wizard/StepContainer";
import FormField from "../shared/FormField";
import FormSection from "../shared/FormSection";
import CoordinateInput from "../shared/CoordinateInput";

const TRANSMISSION_TYPES = ["Voice", "Data and Voice", "Data", "Alarm"];
const FREQUENCY_BANDS = [
  { label: "HF", range: "3.000 - 30.000 MHz" },
  { label: "VHF LOW", range: "68.000 - 87.500 MHz" },
  { label: "VHF MID", range: "138.000 - 146.000 MHz" },
  { label: "VHF HIGH", range: "146.000 - 174.000 MHz" },
  { label: "UHF 400-450", range: "400.000 - 450.000 MHz" },
  { label: "UHF 450-470", range: "450.000 - 470.000 MHz" },
];
const OPERATION_METHODS = ["Single Frequency (Simplex)", "Dual Frequency (Duplex)"];
const ANTENNA_TYPES = ["Omni-directional", "Dipole", "Downfire", "Radiating Cable", "Directional (Yagi)", "Other"];

export default function FrequencyTechnicalStep({ data, onChange, readOnly }: StepProps) {
  const update = (name: string, value: string) => onChange({ ...data, [name]: value });

  return (
    <StepContainer
      title="Technical Characteristics"
      description="Provide technical details about the radio frequency usage."
    >
      {/* Business Description */}
      <FormSection title="Business Activities">
        <FormField
          label="Describe the nature of your business activities (what the radios will be used for)"
          name="business_description"
          value={data.business_description || ""}
          onChange={update}
          type="textarea"
          readOnly={readOnly}
        />
      </FormSection>

      {/* Transmission Type */}
      <FormSection title="Transmission Type">
        <div className="flex flex-wrap gap-2">
          {TRANSMISSION_TYPES.map((t) => (
            <button key={t} type="button" disabled={readOnly} onClick={() => update("transmission_type", t)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${data.transmission_type === t ? "bg-gradient-to-r from-primary to-[hsl(210_85%_35%)] text-primary-foreground shadow-glow-primary" : "bg-[hsl(var(--input-bg))] text-foreground border border-[hsl(var(--input-border))] hover:bg-primary/5 hover:border-primary/30 hover:text-primary"}`}
            >{t}</button>
          ))}
        </div>
      </FormSection>

      {/* Radio Counts */}
      <FormSection title="Total Number of Radios">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <FormField label="Base Stations" name="radio_count_base" value={data.radio_count_base || ""} onChange={update} type="number" readOnly={readOnly} />
          <FormField label="Repeaters" name="radio_count_repeaters" value={data.radio_count_repeaters || ""} onChange={update} type="number" readOnly={readOnly} />
          <FormField label="Mobile (Vehicle)" name="radio_count_mobile" value={data.radio_count_mobile || ""} onChange={update} type="number" readOnly={readOnly} />
          <FormField label="Mobile (Portable)" name="radio_count_portable" value={data.radio_count_portable || ""} onChange={update} type="number" readOnly={readOnly} />
        </div>
      </FormSection>

      {/* Frequency Band */}
      <FormSection title="Preferred Frequency Band">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {FREQUENCY_BANDS.map((b) => (
            <button key={b.label} type="button" disabled={readOnly} onClick={() => update("preferred_band", b.label)}
              className={`text-left px-4 py-2.5 rounded-xl border transition-colors ${data.preferred_band === b.label ? "border-primary bg-primary/10 text-primary" : "border-white/60 bg-white/20 text-foreground hover:bg-white/40"}`}
            >
              <span className="text-sm font-semibold">{b.label}</span>
              <span className="text-xs text-muted-foreground ml-2">{b.range}</span>
            </button>
          ))}
        </div>
      </FormSection>

      {/* Operation Method */}
      <FormSection title="Method of Operation">
        <div className="flex flex-wrap gap-2">
          {OPERATION_METHODS.map((m) => (
            <button key={m} type="button" disabled={readOnly} onClick={() => update("operation_method", m)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${data.operation_method === m ? "bg-gradient-to-r from-primary to-[hsl(210_85%_35%)] text-primary-foreground shadow-glow-primary" : "bg-[hsl(var(--input-bg))] text-foreground border border-[hsl(var(--input-border))] hover:bg-primary/5 hover:border-primary/30 hover:text-primary"}`}
            >{m}</button>
          ))}
        </div>
      </FormSection>

      {/* Existing licence takeover */}
      <FormSection title="Existing Licence">
        <div className="flex gap-2 mb-3">
          {["Yes", "No"].map((v) => (
            <button key={v} type="button" disabled={readOnly} onClick={() => update("taking_over_licence", v)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${data.taking_over_licence === v ? "bg-gradient-to-r from-primary to-[hsl(210_85%_35%)] text-primary-foreground shadow-glow-primary" : "bg-[hsl(var(--input-bg))] text-foreground border border-[hsl(var(--input-border))] hover:bg-primary/5 hover:border-primary/30 hover:text-primary"}`}
            >{v}</button>
          ))}
        </div>
        {data.taking_over_licence === "No" && (
          <FormField label="What changes have been made?" name="licence_changes" value={data.licence_changes || ""} onChange={update} type="textarea" readOnly={readOnly} />
        )}
      </FormSection>

      {/* Base Station */}
      <FormSection title="Base Station">
        <div className="flex gap-2 mb-4">
          {["Yes", "No - operational area only"].map((v) => (
            <button key={v} type="button" disabled={readOnly} onClick={() => update("has_base_station", v)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${data.has_base_station === v ? "bg-gradient-to-r from-primary to-[hsl(210_85%_35%)] text-primary-foreground shadow-glow-primary" : "bg-[hsl(var(--input-bg))] text-foreground border border-[hsl(var(--input-border))] hover:bg-primary/5 hover:border-primary/30 hover:text-primary"}`}
            >{v}</button>
          ))}
        </div>
        {data.has_base_station === "Yes" && (
          <>
            <FormField label="Physical Address" name="base_address" value={data.base_address || ""} onChange={update} readOnly={readOnly} className="mb-4" />
            <CoordinateInput data={data} onChange={update} prefix="base" readOnly={readOnly} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <FormField label="Contact Person at Location" name="base_contact" value={data.base_contact || ""} onChange={update} readOnly={readOnly} />
              <FormField label="Telephone" name="base_telephone" value={data.base_telephone || ""} onChange={update} type="tel" readOnly={readOnly} />
              <FormField label="Antenna Height (m)" name="antenna_height" value={data.antenna_height || ""} onChange={update} readOnly={readOnly} />
              <FormField label="Antenna Gain (dB)" name="antenna_gain" value={data.antenna_gain || ""} onChange={update} readOnly={readOnly} />
            </div>
            <div className="mt-4">
              <label className="block text-xs font-medium text-muted-foreground mb-2">Antenna Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ANTENNA_TYPES.map((t) => (
                  <button key={t} type="button" disabled={readOnly} onClick={() => update("antenna_type", t)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${data.antenna_type === t ? "bg-gradient-to-r from-primary to-[hsl(210_85%_35%)] text-primary-foreground shadow-glow-primary" : "bg-[hsl(var(--input-bg))] text-foreground border border-[hsl(var(--input-border))] hover:bg-primary/5 hover:border-primary/30 hover:text-primary"}`}
                  >{t}</button>
                ))}
              </div>
            </div>
          </>
        )}
      </FormSection>

      {/* Radio Dealer */}
      <FormSection title="Radio Dealer Details" collapsible defaultOpen={false}>
        <p className="text-xs text-muted-foreground mb-3">
          Provide your radio supplier's details if you'd like them to receive a copy of your licence.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Radio Dealer" name="radio_dealer_name" value={data.radio_dealer_name || ""} onChange={update} readOnly={readOnly} />
          <FormField label="Postal Address" name="radio_dealer_address" value={data.radio_dealer_address || ""} onChange={update} readOnly={readOnly} />
          <FormField label="Telephone" name="radio_dealer_tel" value={data.radio_dealer_tel || ""} onChange={update} type="tel" readOnly={readOnly} />
          <FormField label="Fax" name="radio_dealer_fax" value={data.radio_dealer_fax || ""} onChange={update} readOnly={readOnly} />
        </div>
      </FormSection>
    </StepContainer>
  );
}
