import { Check } from "lucide-react";
import type { StepConfig } from "@/lib/applicationStepConfig";

interface WizardStepperProps {
  steps: StepConfig[];
  currentStep: number;
  completedSteps: Set<number>;
}

export default function WizardStepper({ steps, currentStep, completedSteps }: WizardStepperProps) {
  return (
    <>
      {/* Desktop vertical stepper */}
      <nav className="hidden lg:block w-64 shrink-0">
        <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-white/60 shadow-lg p-4 sticky top-24">
          <ol className="space-y-1">
            {steps.map((step, i) => {
              const isActive = i === currentStep;
              const isCompleted = completedSteps.has(i);
              const isPast = i < currentStep;

              return (
                <li key={step.id} className="flex items-start gap-3 py-2 px-2 rounded-xl transition-colors">
                  {/* Step indicator */}
                  <div
                    className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md"
                        : isCompleted || isPast
                          ? "bg-primary/20 text-primary"
                          : "bg-white/50 text-muted-foreground border border-white/80"
                    }`}
                  >
                    {isCompleted || isPast ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      i + 1
                    )}
                  </div>

                  {/* Label */}
                  <div className="min-w-0 pt-0.5">
                    <p
                      className={`text-sm font-medium truncate ${
                        isActive ? "text-primary" : isPast || isCompleted ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </nav>

      {/* Mobile horizontal stepper */}
      <div className="lg:hidden mb-4">
        <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-white/60 shadow-lg px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </p>
            <p className="text-xs font-semibold text-primary">{steps[currentStep]?.label}</p>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 bg-white/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
