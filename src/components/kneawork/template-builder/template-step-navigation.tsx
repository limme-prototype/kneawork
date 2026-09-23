import { AlertTriangle, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BuilderStepId, ValidationIssue } from "@/lib/kneawork/template-types";

interface StepItem {
  id: BuilderStepId;
  title: string;
  subtitle: string;
}

const STEPS: StepItem[] = [
  { id: 1, title: "Basics", subtitle: "Name & outcome" },
  { id: 2, title: "Request form", subtitle: "Fields & inputs" },
  { id: 3, title: "Approval route", subtitle: "Sequential reviewers" },
  { id: 4, title: "Rules & evidence", subtitle: "Policies & uploads" },
  { id: 5, title: "Review & publish", subtitle: "Verification & go-live" },
];

interface TemplateStepNavigationProps {
  currentStep: BuilderStepId;
  onSelectStep: (step: BuilderStepId) => void;
  issues: ValidationIssue[];
}

export function TemplateStepNavigation({
  currentStep,
  onSelectStep,
  issues,
}: TemplateStepNavigationProps) {
  const currentStepObj = STEPS.find((s) => s.id === currentStep) ?? (STEPS[0] as StepItem);

  return (
    <>
      {/* Mobile Step Header (< sm) */}
      <div className="sm:hidden px-3.5 py-2.5 space-y-2 border-b border-border bg-card/60">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-primary">
                Step {currentStep} of {STEPS.length}
              </span>
              <span className="text-muted-foreground text-xs">·</span>
              <span className="text-sm font-bold text-foreground truncate">
                {currentStepObj.title}
              </span>
            </div>
            <p className="text-xs text-muted-foreground truncate">{currentStepObj.subtitle}</p>
          </div>
          {/* Quick step pill buttons */}
          <div className="flex items-center gap-1 shrink-0 ml-2">
            {STEPS.map((step) => {
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => onSelectStep(step.id)}
                  aria-label={`Go to step ${step.id}: ${step.title}`}
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full text-xs font-bold transition-all cursor-pointer",
                    isActive
                      ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                      : isCompleted
                        ? "bg-success text-success-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80",
                  )}
                >
                  {isCompleted ? <Check className="size-3 stroke-[2.5]" /> : step.id}
                </button>
              );
            })}
          </div>
        </div>

        {/* Linear progress bar */}
        <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-300"
            style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop/Tablet Step Bar (>= sm) */}
      <nav
        aria-label="Template builder progress"
        className="hidden sm:block border-b border-border bg-card/60 px-4 py-2 sm:px-6 overflow-x-auto scrollbar-none"
      >
        <ol className="flex items-center justify-between gap-1.5 md:gap-2">
          {STEPS.map((step) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            const stepIssues = issues.filter((issue) => issue.step === step.id);
            const hasIssues = stepIssues.length > 0;

            return (
              <li key={step.id} className="flex-1">
                <button
                  type="button"
                  onClick={() => onSelectStep(step.id)}
                  className={cn(
                    "group flex w-full items-center gap-2 lg:gap-3 rounded-md p-2 text-left transition-colors cursor-pointer",
                    isActive
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-muted/60 border border-transparent",
                  )}
                  aria-current={isActive ? "step" : undefined}
                >
                  {/* Step badge */}
                  <span
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
                      hasIssues && !isActive
                        ? "bg-warning-soft text-warning border border-warning-border"
                        : isCompleted
                          ? "bg-success text-success-foreground"
                          : isActive
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground",
                    )}
                  >
                    {hasIssues && !isActive ? (
                      <AlertTriangle className="size-3.5" />
                    ) : isCompleted ? (
                      <Check className="size-3.5 stroke-[2.5]" />
                    ) : (
                      step.id
                    )}
                  </span>

                  {/* Step labels */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "text-xs sm:text-[13px] font-semibold truncate",
                          isActive
                            ? "text-primary"
                            : isCompleted
                              ? "text-foreground"
                              : "text-muted-foreground",
                        )}
                      >
                        {step.id}. {step.title}
                      </span>
                      {hasIssues ? (
                        <span className="inline-block size-1.5 rounded-full bg-warning" />
                      ) : null}
                    </div>
                    <span className="block text-xs text-muted-foreground truncate hidden md:block">
                      {step.subtitle}
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
