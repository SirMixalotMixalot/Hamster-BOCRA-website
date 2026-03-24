interface FormFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  type?: "text" | "email" | "tel" | "number" | "date" | "textarea";
  placeholder?: string;
  error?: string;
  required?: boolean;
  readOnly?: boolean;
  className?: string;
}

const inputBase =
  "w-full px-5 py-2.5 rounded-full border text-sm focus:outline-none transition-all duration-200";
const inputEnabled =
  `${inputBase} border-[hsl(215_20%_50%/0.25)] bg-[hsl(215_25%_15%/0.06)] text-foreground placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-primary/25 focus:border-primary focus:shadow-[0_0_0_3px_hsl(210_85%_50%/0.1)]`;
const inputDisabled =
  `${inputBase} border-[hsl(215_20%_50%/0.15)] bg-[hsl(215_25%_15%/0.03)] text-foreground/70 cursor-default`;

export default function FormField({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  error,
  required,
  readOnly,
  className = "",
}: FormFieldProps) {
  const cls = readOnly ? inputDisabled : inputEnabled;

  return (
    <div className={className}>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {type === "textarea" ? (
        <textarea
          name={name}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          rows={3}
          className={cls.replace("rounded-full", "rounded-xl")}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          className={cls}
        />
      )}
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}
