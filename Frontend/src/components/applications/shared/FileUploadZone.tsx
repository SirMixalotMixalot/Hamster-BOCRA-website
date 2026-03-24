import { Upload, X, FileText } from "lucide-react";
import { useRef } from "react";

interface UploadedFile {
  name: string;
  size: number;
  type: string;
}

interface FileUploadZoneProps {
  files: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
  readOnly?: boolean;
  accept?: string;
  maxSizeMB?: number;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileUploadZone({
  files,
  onChange,
  readOnly,
  accept = ".pdf,.jpg,.jpeg,.png",
  maxSizeMB = 10,
}: FileUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (fileList: FileList) => {
    const newFiles: UploadedFile[] = Array.from(fileList)
      .filter((f) => f.size <= maxSizeMB * 1024 * 1024)
      .map((f) => ({ name: f.name, size: f.size, type: f.type }));
    onChange([...files, ...newFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!readOnly && e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {!readOnly && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-primary/30 rounded-2xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
        >
          <Upload className="h-8 w-8 text-primary/40 mx-auto mb-2" />
          <p className="text-sm font-medium text-foreground">
            Drop files here or <span className="text-primary">browse</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            PDF, JPG, PNG up to {maxSizeMB}MB
          </p>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={accept}
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            className="hidden"
          />
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/30 border border-white/60">
              <FileText className="h-4 w-4 text-primary/60 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
              </div>
              {!readOnly && (
                <button type="button" onClick={() => removeFile(i)} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
