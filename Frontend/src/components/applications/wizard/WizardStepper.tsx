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
        <div className="glass rounded-2xl p-4 sticky top-24">
          <ol className="space-y-1">
            {steps.map((step, i) => {
              const isActive = i === currentStep;
              const isCompleted = completedSteps.has(i);
              const isPast = i < currentStep;

              return (
                <li key={step.id} className={`flex items-start gap-3 py-2 px-2 rounded-xl transition-all duration-200 ${isActive ? "bg-primary/5" : ""}`}>
                  {/* Step indicator */}
                  <div
                    className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-glow-primary ring-2 ring-primary/20"
                        : isCompleted || isPast
                          ? "bg-bocra-teal/20 text-bocra-teal"
                          : "bg-[hsl(var(--input-bg))] text-muted-foreground border border-[hsl(var(--input-border))]"
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
                        isActive ? "text-primary font-semibold" : isPast || isCompleted ? "text-foreground" : "text-muted-foreground"
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
        <div className="glass rounded-2xl px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </p>
            <p className="text-xs font-semibold text-primary">{steps[currentStep]?.label}</p>
          </div>
          {/* Progress bar */}
          <div className="h-2 bg-[hsl(var(--input-bg))] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-bocra-teal rounded-full transition-all duration-500 shadow-glow-primary"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
