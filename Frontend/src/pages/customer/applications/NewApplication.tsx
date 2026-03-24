import ApplicationWizard from "@/components/applications/wizard/ApplicationWizard";

export default function NewApplication() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold text-foreground">New Application</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Apply for a BOCRA licence by completing the form below.
        </p>
      </div>
      <ApplicationWizard />
    </div>
  );
}
