import type { StepProps } from "@/lib/applicationStepConfig";
import StepContainer from "../wizard/StepContainer";
import FormField from "../shared/FormField";
import FormSection from "../shared/FormSection";
import CoordinateInput from "../shared/CoordinateInput";
import RepeatableTable from "../shared/RepeatableTable";

const STATION_TYPES_AMATEUR = ["Fixed/Base", "Mobile", "Portable"];
const EQUIPMENT_TYPES = ["Transceiver", "Transmitter", "Receiver"];

export default function RadioStationDetailsStep({ data, onChange, licenceType, readOnly }: StepProps) {
  const update = (name: string, value: string) => onChange({ ...data, [name]: value });
  const isAircraft = licenceType === "Aircraft Radio Licence";
  const isAmateur = licenceType === "Amateur Radio License";
  const isCitizenBand = licenceType === "Citizen Band Radio Licence";
  const isPrivateRadio = licenceType === "Private Radio Communication Licence";

  return (
    <StepContainer
      title={isAircraft ? "Base Station & Aircraft Details" : "Station Details"}
      description="Provide details about the station location, service class, and operational parameters."
    >
      {/* Station type for Amateur / CB */}
      {(isAmateur || isCitizenBand) && (
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-2">Station Type</label>
          <div className="flex flex-wrap gap-2">
            {STATION_TYPES_AMATEUR.map((t) => (
              <button
                key={t}
                type="button"
                disabled={readOnly}
                onClick={() => update("station_type", t)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  data.station_type === t
                    ? "bg-gradient-to-r from-primary to-[hsl(210_85%_35%)] text-primary-foreground shadow-glow-primary"
                    : "bg-[hsl(var(--input-bg))] text-foreground border border-[hsl(var(--input-border))] hover:bg-primary/5 hover:border-primary/30 hover:text-primary"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Base Station Details */}
      <FormSection title="Station Location">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Station Name" name="station_name" value={data.station_name || ""} onChange={update} readOnly={readOnly} />
          {isAircraft && <FormField label="Aircraft Type" name="aircraft_type" value={data.aircraft_type || ""} onChange={update} readOnly={readOnly} />}
          <FormField label="Street" name="station_street" value={data.station_street || ""} onChange={update} readOnly={readOnly} />
          <FormField label="Ward" name="station_ward" value={data.station_ward || ""} onChange={update} readOnly={readOnly} />
          <FormField label="City" name="station_city" value={data.station_city || ""} onChange={update} readOnly={readOnly} />
          <FormField label="Region" name="station_region" value={data.station_region || ""} onChange={update} readOnly={readOnly} />
          <FormField label="Country" name="station_country" value={data.station_country || ""} onChange={update} readOnly={readOnly} placeholder="Botswana" />
          {isCitizenBand && <FormField label="Number of Sites" name="number_of_sites" value={data.number_of_sites || ""} onChange={update} type="number" readOnly={readOnly} />}
        </div>
        <CoordinateInput data={data} onChange={update} prefix="station" readOnly={readOnly} />
      </FormSection>

      {/* Service Details */}
      <FormSection title="Service Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Service Class" name="service_class" value={data.service_class || ""} onChange={update} readOnly={readOnly} />
          <FormField label="Station Class" name="station_class" value={data.station_class || ""} onChange={update} readOnly={readOnly} />
          <FormField label="Contact Person at Site" name="site_contact_person" value={data.site_contact_person || ""} onChange={update} readOnly={readOnly} />
          {isAmateur && <FormField label="BARS Cert. No." name="bars_cert_no" value={data.bars_cert_no || ""} onChange={update} readOnly={readOnly} />}
        </div>
      </FormSection>

      {/* CB Purpose */}
      {isCitizenBand && (
        <FormSection title="Purpose">
          <FormField
            label="What this station will be used for"
            name="purpose"
            value={data.purpose || ""}
            onChange={update}
            type="textarea"
            readOnly={readOnly}
          />
        </FormSection>
      )}

      {/* Aircraft-specific station details */}
      {isAircraft && (
        <FormSection title="Aircraft Station Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Registration Marks" name="registration_marks" value={data.registration_marks || ""} onChange={update} readOnly={readOnly} />
            <FormField label="Area of Operation" name="area_of_operation" value={data.area_of_operation || ""} onChange={update} readOnly={readOnly} />
            <FormField label="Callsign" name="aircraft_callsign" value={data.aircraft_callsign || ""} onChange={update} readOnly={readOnly} />
            <FormField label="Date of Purchase" name="date_of_purchase" value={data.date_of_purchase || ""} onChange={update} type="date" readOnly={readOnly} />
          </div>
        </FormSection>
      )}

      {/* Private Radio — Annexure tables */}
      {isPrivateRadio && (
        <>
          <FormSection title="Purpose of Communication">
            <FormField label="Purpose" name="purpose" value={data.purpose || ""} onChange={update} type="textarea" readOnly={readOnly} />
            <FormField label="Applicant's Radio Dealer" name="radio_dealer" value={data.radio_dealer || ""} onChange={update} readOnly={readOnly} className="mt-4" />
          </FormSection>

          <FormSection title="Repeater Stations" collapsible defaultOpen={false}>
            <RepeatableTable
              columns={[
                { key: "coordinates", label: "Coordinates" },
                { key: "location", label: "Location (Plot)" },
                { key: "make", label: "Make" },
                { key: "model", label: "Model" },
                { key: "serial", label: "Serial No." },
                { key: "tx_freq", label: "TX Freq (MHz)" },
                { key: "rx_freq", label: "RX Freq (MHz)" },
              ]}
              rows={data.repeater_stations || []}
              onChange={(rows) => onChange({ ...data, repeater_stations: rows })}
              readOnly={readOnly}
              addLabel="Add Repeater Station"
            />
          </FormSection>

          <FormSection title="Fixed/Base Stations" collapsible defaultOpen={false}>
            <RepeatableTable
              columns={[
                { key: "coordinates", label: "Coordinates" },
                { key: "location", label: "Location (Plot)" },
                { key: "make", label: "Make" },
                { key: "model", label: "Model" },
                { key: "serial", label: "Serial No." },
                { key: "tx_freq", label: "TX Freq (MHz)" },
                { key: "rx_freq", label: "RX Freq (MHz)" },
              ]}
              rows={data.base_stations || []}
              onChange={(rows) => onChange({ ...data, base_stations: rows })}
              readOnly={readOnly}
              addLabel="Add Base Station"
            />
          </FormSection>

          <FormSection title="Portable/Mobile Stations" collapsible defaultOpen={false}>
            <RepeatableTable
              columns={[
                { key: "coordinates", label: "Coordinates" },
                { key: "location", label: "Location (Plot)" },
                { key: "make", label: "Make" },
                { key: "model", label: "Model" },
                { key: "serial", label: "Serial No." },
                { key: "tx_freq", label: "TX Freq (MHz)" },
                { key: "rx_freq", label: "RX Freq (MHz)" },
              ]}
              rows={data.mobile_stations || []}
              onChange={(rows) => onChange({ ...data, mobile_stations: rows })}
              readOnly={readOnly}
              addLabel="Add Mobile Station"
            />
          </FormSection>
        </>
      )}
    </StepContainer>
  );
}
