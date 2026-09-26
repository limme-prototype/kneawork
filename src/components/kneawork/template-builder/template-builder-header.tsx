import { ArrowLeft, Layers, MoreVertical, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ExtendedTemplate } from "@/lib/kneawork/template-types";

interface TemplateBuilderHeaderProps {
  template: ExtendedTemplate;
  isSavingDraft: boolean;
  onCancel: () => void;
  onSaveDraft?: () => void;
  onContinue?: () => void;
  onPublish?: () => void;
  isLastStep?: boolean;
  canPublish?: boolean;
}

export function TemplateBuilderHeader({
  template,
  isSavingDraft,
  onCancel,
  onSaveDraft,
  onPublish,
  canPublish,
}: TemplateBuilderHeaderProps) {
  return (
    <div className="border-b border-border bg-card px-3.5 py-3 sm:px-6 sm:py-4">
      {/* Mobile Top Header Bar (< sm) */}
      <div className="flex sm:hidden items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="size-8 text-muted-foreground hover:text-foreground shrink-0"
            aria-label="Back to templates"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-foreground truncate">
              {template.label.trim() ? template.label : "Create template"}
            </h1>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="font-semibold text-attention">{template.versionStatus}</span>
              <span>·</span>
              <span>v{template.version}</span>
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-foreground shrink-0"
              aria-label="More template options"
            >
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            {onSaveDraft && (
              <DropdownMenuItem onClick={onSaveDraft} disabled={isSavingDraft}>
                <Save className="size-3.5 mr-2" />
                {isSavingDraft ? "Saving..." : "Save draft"}
              </DropdownMenuItem>
            )}
            {onPublish && canPublish && (
              <DropdownMenuItem onClick={onPublish} className="text-success font-semibold">
                Publish template
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onCancel} className="text-danger">
              <X className="size-3.5 mr-2" />
              Cancel & exit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Desktop Header Content (Full studio header with title, draft save, and publish) */}
      <div className="hidden sm:flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
            {template.label.trim() ? `Edit ${template.label}` : "Create request template"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Configure form fields, sequential approval steps, and corporate spend policies.
          </p>
        </div>

        {/* Global Action Group (Cancel, Save draft, and Publish) */}
        <div className="flex items-center gap-2 shrink-0">
          {onSaveDraft && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSaveDraft}
              disabled={isSavingDraft}
              className="text-xs font-semibold h-8.5 gap-1.5"
            >
              <Save className="size-3.5" />
              {isSavingDraft ? "Saving..." : "Save draft"}
            </Button>
          )}

          {onPublish && (
            <Button
              size="sm"
              onClick={onPublish}
              disabled={!canPublish}
              className="bg-primary text-primary-foreground hover:bg-primary-hover text-xs font-bold h-8.5 shadow-2xs"
            >
              Publish template
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground text-xs h-8.5"
          >
            <X className="size-3.5 mr-1" />
            Exit
          </Button>
        </div>
      </div>
    </div>
  );
}
