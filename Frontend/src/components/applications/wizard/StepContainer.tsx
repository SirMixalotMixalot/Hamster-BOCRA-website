interface StepContainerProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export default function StepContainer({ title, description, children }: StepContainerProps) {
  return (
    <div className="glass rounded-2xl p-6 space-y-6">
      <div>
        <h2 className="text-lg font-heading font-bold text-foreground">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}
