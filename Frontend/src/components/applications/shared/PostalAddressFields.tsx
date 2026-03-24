import FormField from "./FormField";

interface PostalAddressFieldsProps {
  data: Record<string, any>;
  onChange: (name: string, value: string) => void;
  readOnly?: boolean;
}

export default function PostalAddressFields({ data, onChange, readOnly }: PostalAddressFieldsProps) {
  const get = (field: string) => data[`postal_${field}`] || "";
  const set = (field: string, value: string) => onChange(`postal_${field}`, value);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField label="P.O. Box" name="postal_po_box" value={get("po_box")} onChange={(_, v) => set("po_box", v)} readOnly={readOnly} />
      <FormField label="Private Bag" name="postal_private_bag" value={get("private_bag")} onChange={(_, v) => set("private_bag", v)} readOnly={readOnly} />
      <FormField label="City" name="postal_city" value={get("city")} onChange={(_, v) => set("city", v)} readOnly={readOnly} />
      <FormField label="Ward" name="postal_ward" value={get("ward")} onChange={(_, v) => set("ward", v)} readOnly={readOnly} />
      <FormField label="Tel. No." name="postal_tel" value={get("tel")} onChange={(_, v) => set("tel", v)} type="tel" readOnly={readOnly} />
      <FormField label="Mobile No." name="postal_mobile" value={get("mobile")} onChange={(_, v) => set("mobile", v)} type="tel" readOnly={readOnly} />
    </div>
  );
}
