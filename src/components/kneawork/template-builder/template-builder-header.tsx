import { Layers, Save, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ExtendedTemplate } from "@/lib/kneawork/template-types";

interface TemplateBuilderHeaderProps {
  template: ExtendedTemplate;
  isSavingDraft: boolean;
  onCancel: () => void;
  onSaveDraft: () => void;
  onContinue: () => void;
  isLastStep: boolean;
  canPublish: boolean;
}

export function TemplateBuilderHeader({
  template,
  isSavingDraft,
  onCancel,
  onSaveDraft,
  onContinue,
  isLastStep,
  canPublish,
}: TemplateBuilderHeaderProps) {
  return (
    <div className="border-b border-border bg-card px-4 py-4 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1 flex-wrap">
            <span>Manage</span>
            <span>/</span>
            <span>Templates</span>
            <span>/</span>
            <span className="font-medium text-foreground truncate max-w-[120px] sm:max-w-none">
              {template.label.trim() ? template.label : "New template"}
            </span>
            <span className="rounded bg-attention-soft border border-attention-border px-2 py-0.5 text-xs font-semibold text-attention ml-1 flex items-center gap-1 shrink-0">
              <Layers className="size-3" />v{template.version} · {template.versionStatus}
            </span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-foreground break-words">
            {template.label.trim() ? `Edit ${template.label}` : "Create new request template"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Guided workflow designer for governed request forms, sequential reviewers, and evidence
            rules
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5 mr-1" />
            Cancel
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onSaveDraft}
            disabled={isSavingDraft}
            className="border-attention-border text-attention hover:bg-attention-soft"
          >
            <Save className="size-3.5 mr-1" />
            {isSavingDraft ? "Saving draft..." : "Save draft"}
          </Button>

          <Button
            size="sm"
            onClick={onContinue}
            className="font-semibold gap-1.5"
            disabled={isLastStep && !canPublish}
          >
            {isLastStep ? (
              <>
                <Sparkles className="size-3.5" />
                Publish template
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
