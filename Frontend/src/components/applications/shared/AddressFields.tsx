import FormField from "./FormField";

interface AddressFieldsProps {
  prefix: string;
  data: Record<string, any>;
  onChange: (name: string, value: string) => void;
  readOnly?: boolean;
}

export default function AddressFields({ prefix, data, onChange, readOnly }: AddressFieldsProps) {
  const get = (field: string) => data[`${prefix}_${field}`] || "";
  const set = (field: string, value: string) => onChange(`${prefix}_${field}`, value);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField label="Street" name={`${prefix}_street`} value={get("street")} onChange={(_, v) => set("street", v)} readOnly={readOnly} />
      <FormField label="Plot No." name={`${prefix}_plot_no`} value={get("plot_no")} onChange={(_, v) => set("plot_no", v)} readOnly={readOnly} />
      <FormField label="Ward" name={`${prefix}_ward`} value={get("ward")} onChange={(_, v) => set("ward", v)} readOnly={readOnly} />
      <FormField label="City" name={`${prefix}_city`} value={get("city")} onChange={(_, v) => set("city", v)} readOnly={readOnly} />
      <FormField label="Region" name={`${prefix}_region`} value={get("region")} onChange={(_, v) => set("region", v)} readOnly={readOnly} />
      <FormField label="Tel. No." name={`${prefix}_tel`} value={get("tel")} onChange={(_, v) => set("tel", v)} type="tel" readOnly={readOnly} />
      <FormField label="Email Address" name={`${prefix}_email`} value={get("email")} onChange={(_, v) => set("email", v)} type="email" readOnly={readOnly} />
      <FormField label="Mobile No." name={`${prefix}_mobile`} value={get("mobile")} onChange={(_, v) => set("mobile", v)} type="tel" readOnly={readOnly} />
      <FormField label="Fax No." name={`${prefix}_fax`} value={get("fax")} onChange={(_, v) => set("fax", v)} readOnly={readOnly} />
      <FormField label="Nature of Business" name={`${prefix}_nature_of_business`} value={get("nature_of_business")} onChange={(_, v) => set("nature_of_business", v)} readOnly={readOnly} />
    </div>
  );
}
