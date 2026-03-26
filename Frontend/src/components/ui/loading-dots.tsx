interface LoadingDotsProps {
  label?: string;
  className?: string;
  dotClassName?: string;
}

export function LoadingDots({
  label = "Loading...",
  className = "",
  dotClassName = "bg-primary/70",
}: LoadingDotsProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`.trim()}>
      <div className="flex items-center gap-1.5" aria-hidden="true">
        <span className={`h-2 w-2 rounded-full animate-bounce [animation-delay:-0.2s] ${dotClassName}`.trim()} />
        <span className={`h-2 w-2 rounded-full animate-bounce [animation-delay:-0.1s] ${dotClassName}`.trim()} />
        <span className={`h-2 w-2 rounded-full animate-bounce ${dotClassName}`.trim()} />
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
