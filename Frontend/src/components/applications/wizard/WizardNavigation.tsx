import { ArrowLeft, ArrowRight, Save, Send } from "lucide-react";

interface WizardNavigationProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  onSubmit: () => void | Promise<void>;
  isFirstStep: boolean;
  isLastStep: boolean;
  submitting?: boolean;
}

export default function WizardNavigation({
  onBack,
  onNext,
  onSaveDraft,
  onSubmit,
  isFirstStep,
  isLastStep,
  submitting = false,
}: WizardNavigationProps) {
  return (
    <div className="flex items-center justify-between pt-4 border-t border-[hsl(var(--glass-border))]">
      {/* Left side */}
      <div>
        {!isFirstStep && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-subtle text-sm font-medium text-foreground hover:bg-white/60 hover:border-primary/30 transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={submitting}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-primary/20 bg-primary/5 text-sm font-medium text-primary hover:bg-primary/10 hover:border-primary/40 transition-all duration-200"
        >
          <Save className="h-4 w-4" />
          <span className="sm:hidden">Save</span>
          <span className="hidden sm:inline">Save Draft</span>
        </button>

        {isLastStep ? (
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-primary to-[hsl(210_85%_35%)] text-primary-foreground text-sm font-semibold shadow-glow-primary hover:opacity-90 transition-all duration-200"
          >
            <Send className="h-4 w-4" />
            {submitting ? "Submitting..." : <><span className="sm:hidden">Submit</span><span className="hidden sm:inline">Submit Application</span></>}
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-primary to-[hsl(210_85%_35%)] text-primary-foreground text-sm font-semibold shadow-glow-primary hover:opacity-90 transition-all duration-200"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
