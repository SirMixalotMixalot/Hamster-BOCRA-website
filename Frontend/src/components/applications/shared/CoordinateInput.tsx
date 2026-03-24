import FormField from "./FormField";

interface CoordinateInputProps {
  data: Record<string, any>;
  onChange: (name: string, value: string) => void;
  prefix?: string;
  readOnly?: boolean;
}

export default function CoordinateInput({ data, onChange, prefix = "", readOnly }: CoordinateInputProps) {
  const p = prefix ? `${prefix}_` : "";
  const get = (field: string) => data[`${p}${field}`] || "";
  const set = (field: string, value: string) => onChange(`${p}${field}`, value);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField label="Latitude" name={`${p}latitude`} value={get("latitude")} onChange={(_, v) => set("latitude", v)} placeholder="e.g. -24.6282" readOnly={readOnly} />
      <FormField label="Longitude" name={`${p}longitude`} value={get("longitude")} onChange={(_, v) => set("longitude", v)} placeholder="e.g. 25.9231" readOnly={readOnly} />
      <FormField label="Site Altitude (m)" name={`${p}altitude`} value={get("altitude")} onChange={(_, v) => set("altitude", v)} type="number" readOnly={readOnly} />
    </div>
  );
}
