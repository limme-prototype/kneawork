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
  return (
    <nav
      aria-label="Template builder progress"
      className="border-b border-border bg-card/60 px-4 py-2 sm:px-6 overflow-x-auto"
    >
      <ol className="flex items-center justify-between min-w-[640px] gap-2">
        {STEPS.map((step, idx) => {
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
                  "group flex w-full items-center gap-3 rounded-md p-2 text-left transition-colors cursor-pointer",
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
                        "text-xs font-semibold truncate",
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
                  <span className="block text-[11px] text-muted-foreground truncate">
                    {step.subtitle}
                  </span>
                </div>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
