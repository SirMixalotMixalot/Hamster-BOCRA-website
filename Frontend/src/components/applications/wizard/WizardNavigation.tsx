import { ArrowLeft, ArrowRight, Save, Send } from "lucide-react";

interface WizardNavigationProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  onSubmit: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export default function WizardNavigation({
  onBack,
  onNext,
  onSaveDraft,
  onSubmit,
  isFirstStep,
  isLastStep,
}: WizardNavigationProps) {
  return (
    <div className="flex items-center justify-between pt-4 border-t border-white/40">
      {/* Left side */}
      <div>
        {!isFirstStep && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/80 bg-white/30 text-sm font-medium text-foreground hover:bg-white/50 transition-colors"
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
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-primary/30 text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
        >
          <Save className="h-4 w-4" />
          Save Draft
        </button>

        {isLastStep ? (
          <button
            type="button"
            onClick={onSubmit}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 shadow-md transition-colors"
          >
            <Send className="h-4 w-4" />
            Submit Application
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 shadow-md transition-colors"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
