import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCheck,
  FileText,
  Layers,
  Lock,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  BuilderStepId,
  ExtendedTemplate,
  ValidationIssue,
} from "@/lib/kneawork/template-types";

interface TemplateReviewSummaryProps {
  template: ExtendedTemplate;
  issues: ValidationIssue[];
  onGoToStep: (step: BuilderStepId) => void;
  onOpenPublishDialog: () => void;
  onSaveDraft: () => void;
}

export function TemplateReviewSummary({
  template,
  issues,
  onGoToStep,
  onOpenPublishDialog,
  onSaveDraft,
}: TemplateReviewSummaryProps) {
  const isPublishable = issues.length === 0;

  const requiredFields = template.fields.filter((f) => f.required);
  const fileFields = template.fields.filter((f) => f.type === "file");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-foreground">Review & publish</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Verify the complete workflow definition, policy rules, and role readiness before
          publishing.
        </p>
      </div>

      {/* Validation Checklist Panel (Spec requirement) */}
      <div
        className={`rounded-lg border p-4 shadow-2xs space-y-3 ${
          isPublishable
            ? "border-success-border bg-success-soft/30"
            : "border-warning-border bg-warning-soft/30"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isPublishable ? (
              <CheckCircle2 className="size-4 text-success" />
            ) : (
              <AlertTriangle className="size-4 text-warning" />
            )}
            <h3 className="text-sm sm:text-base font-bold text-foreground">
              {isPublishable
                ? "Ready to publish"
                : `Cannot publish yet · ${issues.length} issue(s) need attention`}
            </h3>
          </div>
          <span
            className={`rounded px-2.5 py-0.5 text-xs font-semibold border ${
              isPublishable
                ? "bg-success-soft border-success-border text-success"
                : "bg-warning-soft border-warning-border text-warning"
            }`}
          >
            {isPublishable ? "All checks passed" : "Validation required"}
          </span>
        </div>

        {/* Checklist items */}
        <div className="space-y-2 text-sm">
          <CheckItem
            passed={template.label.trim().length >= 3 && template.description.trim().length >= 10}
            label="Template name and description defined"
            step={1}
            onFix={onGoToStep}
          />
          <CheckItem
            passed={Boolean(template.completionOutcome.trim())}
            label="Clear completion outcome specified"
            step={1}
            onFix={onGoToStep}
          />
          <CheckItem
            passed={requiredFields.length > 0}
            label={`Request form contains essential fields (${requiredFields.length} required)`}
            step={2}
            onFix={onGoToStep}
          />
          <CheckItem
            passed={
              template.routeSteps.length > 0 &&
              template.routeSteps.every((s) => Boolean(s.name.trim()))
            }
            label={`Every approval checkpoint has a step name (${template.routeSteps.length} steps)`}
            step={3}
            onFix={onGoToStep}
          />
          <CheckItem
            passed={template.routeSteps.every((s) => Boolean(s.responsibility.trim()))}
            label="Every approval step has explicit pass/fail responsibility defined"
            step={3}
            onFix={onGoToStep}
          />
          <CheckItem
            passed={template.routeSteps.every((s) => Boolean(s.assigneeId))}
            label="Every assigned role has an active member in the workspace"
            step={3}
            onFix={onGoToStep}
          />
          <CheckItem
            passed={
              !template.rules.requireQuotation ||
              (template.rules.quotationThreshold !== undefined &&
                template.rules.quotationThreshold >= 0)
            }
            label="Evidence and expenditure thresholds are properly bounded"
            step={4}
            onFix={onGoToStep}
          />
        </div>

        {/* Direct Issue Fix Links */}
        {!isPublishable ? (
          <div className="mt-3 divide-y divide-warning-border/40 rounded-md border border-warning-border bg-card p-2 text-sm">
            {issues.map((issue, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 px-1">
                <div className="flex items-center gap-2">
                  <span className="text-warning font-bold">!</span>
                  <span className="text-foreground">{issue.message}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onGoToStep(issue.step)}
                  className="h-7 px-2.5 text-xs font-semibold text-attention border-attention-border hover:bg-attention-soft"
                >
                  {issue.fixLabel}
                </Button>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* Comprehensive Workflow Summary Card */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-5 shadow-2xs">
        {/* Template Overview */}
        <div className="border-b border-border pb-4 space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground">
              {template.label || "Untitled Template"}
            </h3>
            <span className="rounded bg-muted border border-border px-2 py-0.5 text-xs font-mono font-medium text-foreground">
              v{template.version} · {template.versionStatus}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {template.description || "No description provided"}
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-[13px] text-muted-foreground pt-1">
            <span>
              Category: <strong className="text-foreground capitalize">{template.category}</strong>
            </span>
            <span>·</span>
            <span>
              Scope: <strong className="text-foreground">{template.departmentScope}</strong>
            </span>
            <span>·</span>
            <span>
              Owner: <strong className="text-foreground">{template.ownerName}</strong>
            </span>
          </div>
          <div className="rounded bg-muted/30 border border-border p-3 mt-2 text-xs sm:text-[13px] text-muted-foreground">
            <strong className="text-foreground">Completion outcome:</strong>{" "}
            {template.completionOutcome || "Not defined"}
          </div>
        </div>

        {/* Request Form Summary */}
        <div className="border-b border-border pb-4 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <FileText className="size-4 text-foreground" />
              Request form
            </h4>
            <span className="text-xs sm:text-[13px] text-muted-foreground">
              {template.fields.length} total fields · {requiredFields.length} required ·{" "}
              {fileFields.length} attachment(s)
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {template.fields.map((f) => (
              <span
                key={f.id}
                className="rounded bg-muted border border-border px-2.5 py-1 text-xs text-foreground flex items-center gap-1 font-medium"
              >
                {f.label}
                {f.required ? <span className="text-attention text-xs font-bold">*</span> : null}
              </span>
            ))}
          </div>
        </div>

        {/* Approval Route Summary */}
        <div className="border-b border-border pb-4 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <UserCheck className="size-4 text-foreground" />
              Approval route ({template.routeSteps.length} steps)
            </h4>
            <span className="text-xs text-muted-foreground">Sequential progression</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded bg-muted px-2.5 py-1 text-foreground border border-border font-medium text-xs">
              Requester
            </span>
            {template.routeSteps.map((step) => (
              <span key={step.id} className="flex items-center gap-1.5">
                <ArrowRight className="size-3.5 text-muted-foreground" />
                <span className="rounded bg-card px-2.5 py-1 text-foreground border border-border font-medium text-xs flex items-center gap-1">
                  {step.name}
                  <span className="text-muted-foreground text-xs">
                    ({step.assigneeName ?? "No assignee"})
                  </span>
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* Policy & Rules Summary */}
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <ShieldCheck className="size-4 text-foreground" />
            Rules & evidence policy
          </h4>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-xs sm:text-[13px] text-muted-foreground">
            <div>
              Quotation required:{" "}
              <strong className="text-foreground">
                {template.rules.requireQuotation
                  ? `Above $${template.rules.quotationThreshold} USD`
                  : "None"}
              </strong>
            </div>
            <div>
              Spend ceiling:{" "}
              <strong className="text-foreground">
                {template.rules.maxAmount ? `$${template.rules.maxAmount} USD` : "None"}
              </strong>
            </div>
            <div>
              Allowed files:{" "}
              <strong className="text-foreground font-mono">
                {template.rules.allowedFileTypes.join(", ")} (Max {template.rules.maxFileSizeMb}MB)
              </strong>
            </div>
            <div>
              Missing proof policy:{" "}
              <strong className="text-foreground capitalize">
                {template.rules.onMissingEvidence === "prevent"
                  ? "Prevent submission"
                  : "Allow changes later"}
              </strong>
            </div>
          </div>
        </div>

        {/* Version Immutability Notice */}
        <div className="rounded-md border border-border bg-muted/40 p-3 text-xs sm:text-[13px] text-muted-foreground flex items-start gap-2">
          <Lock className="size-4 text-muted-foreground mt-0.5 shrink-0" />
          <span>
            <strong>Version immutability notice:</strong> Once published, this workflow version
            becomes locked. Future requests will strictly execute according to version{" "}
            {template.version}. Subsequent modifications will generate a new version (e.g. v
            {(parseFloat(template.version) + 0.1).toFixed(1)}).
          </span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between border-t border-border pt-4">
        <Button variant="outline" size="sm" onClick={() => onGoToStep(1)}>
          Back to edit
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onSaveDraft}
            className="border-attention-border text-attention hover:bg-attention-soft"
          >
            Save draft
          </Button>

          <Button
            size="sm"
            onClick={onOpenPublishDialog}
            disabled={!isPublishable}
            className="font-semibold gap-1.5"
          >
            <Check className="size-3.5" />
            Publish template
          </Button>
        </div>
      </div>
    </div>
  );
}

function CheckItem({
  passed,
  label,
  step,
  onFix,
}: {
  passed: boolean;
  label: string;
  step: BuilderStepId;
  onFix: (step: BuilderStepId) => void;
}) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <div className="flex items-center gap-2">
        <span
          className={`flex size-5 items-center justify-center rounded-full text-xs font-bold ${
            passed ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"
          }`}
        >
          {passed ? "✓" : "!"}
        </span>
        <span className={passed ? "text-foreground" : "text-muted-foreground"}>{label}</span>
      </div>
      {!passed ? (
        <button
          type="button"
          onClick={() => onFix(step)}
          className="text-xs font-semibold text-attention hover:underline cursor-pointer"
        >
          Fix
        </button>
      ) : null}
    </div>
  );
}
