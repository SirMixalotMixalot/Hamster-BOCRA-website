import { Plus, Trash2 } from "lucide-react";

export interface TableColumn {
  key: string;
  label: string;
  type?: "text" | "number";
  placeholder?: string;
  width?: string;
}

interface RepeatableTableProps {
  columns: TableColumn[];
  rows: Record<string, string>[];
  onChange: (rows: Record<string, string>[]) => void;
  readOnly?: boolean;
  addLabel?: string;
}

export default function RepeatableTable({
  columns,
  rows,
  onChange,
  readOnly,
  addLabel = "Add Row",
}: RepeatableTableProps) {
  const addRow = () => {
    const empty: Record<string, string> = {};
    columns.forEach((c) => (empty[c.key] = ""));
    onChange([...rows, empty]);
  };

  const removeRow = (index: number) => {
    onChange(rows.filter((_, i) => i !== index));
  };

  const updateCell = (index: number, key: string, value: string) => {
    const updated = rows.map((row, i) => (i === index ? { ...row, [key]: value } : row));
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl glass-subtle">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-primary/5">
              {columns.map((col) => (
                <th key={col.key} className="px-3 py-2 text-left text-xs font-medium text-muted-foreground" style={{ width: col.width }}>
                  {col.label}
                </th>
              ))}
              {!readOnly && <th className="w-10" />}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length + (readOnly ? 0 : 1)} className="px-3 py-4 text-center text-xs text-muted-foreground/60">
                  No entries yet
                </td>
              </tr>
            )}
            {rows.map((row, i) => (
              <tr key={i} className="border-t border-[hsl(var(--glass-border))]">
                {columns.map((col) => (
                  <td key={col.key} className="px-2 py-1.5">
                    <input
                      type={col.type || "text"}
                      value={row[col.key] || ""}
                      onChange={(e) => updateCell(i, col.key, e.target.value)}
                      readOnly={readOnly}
                      placeholder={col.placeholder}
                      className="w-full px-3 py-1.5 rounded-lg border border-[hsl(var(--input-border))] bg-[hsl(var(--input-bg))] text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary"
                    />
                  </td>
                ))}
                {!readOnly && (
                  <td className="px-2 py-1.5">
                    <button type="button" onClick={() => removeRow(i)} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!readOnly && (
        <button
          type="button"
          onClick={addRow}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-dashed border-primary/40 text-xs font-medium text-primary hover:bg-primary/5 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          {addLabel}
        </button>
      )}
    </div>
  );
}
