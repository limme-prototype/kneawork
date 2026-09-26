import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock,
  Eye,
  FileCheck,
  FileText,
  Layers,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  UserCheck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveDraftTemplate, validateTemplate } from "@/lib/kneawork/template-store";
import type {
  BuilderStepId,
  ExtendedTemplate,
  TemplateField,
  TemplateRouteStep,
  TemplateRules,
} from "@/lib/kneawork/template-types";
import { ApprovalRouteBuilder } from "./approval-route-builder";
import { PublishTemplateDialog } from "./publish-template-dialog";
import { RuleBuilder } from "./rule-builder";
import { TemplateBasicsForm } from "./template-basics-form";
import { TemplateBuilderHeader } from "./template-builder-header";
import { TemplateFieldBuilder } from "./template-field-builder";
import { TemplatePreviewDialog } from "./template-preview-dialog";
import { TemplateReviewSummary } from "./template-review-summary";
import { TemplateStepNavigation } from "./template-step-navigation";

interface TemplateBuilderProps {
  initialTemplate: ExtendedTemplate;
  onClose: () => void;
  onPublished: (published: ExtendedTemplate) => void;
}

export function TemplateBuilder({ initialTemplate, onClose, onPublished }: TemplateBuilderProps) {
  const [template, setTemplate] = useState<ExtendedTemplate>(initialTemplate);
  const [currentStep, setCurrentStep] = useState<BuilderStepId>(1);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [draftNotice, setDraftNotice] = useState<string | null>(null);

  // Dialogs
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewTab, setPreviewTab] = useState<"form" | "simulator">("form");
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);

  // Dynamic Validation
  const issues = validateTemplate(template);
  const isPublishable = issues.length === 0;

  const handleUpdate = (patch: Partial<ExtendedTemplate>) => {
    setTemplate((prev) => ({ ...prev, ...patch }));
  };

  const handleSaveDraft = () => {
    setIsSavingDraft(true);
    saveDraftTemplate(template);
    setTimeout(() => {
      setIsSavingDraft(false);
      setDraftNotice(`Draft v${template.version} saved successfully.`);
      setTimeout(() => setDraftNotice(null), 4000);
    }, 400);
  };

  const handleContinue = () => {
    if (currentStep < 5) {
      setCurrentStep((prev) => (prev + 1) as BuilderStepId);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      if (isPublishable) {
        setIsPublishDialogOpen(true);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as BuilderStepId);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleConfirmPublish = () => {
    setIsPublishDialogOpen(false);
    onPublished(template);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header Bar */}
      <TemplateBuilderHeader
        template={template}
        isSavingDraft={isSavingDraft}
        onCancel={onClose}
        onSaveDraft={handleSaveDraft}
        onContinue={handleContinue}
        onPublish={() => setIsPublishDialogOpen(true)}
        isLastStep={currentStep === 5}
        canPublish={isPublishable}
      />

      {/* Step Navigation Bar */}
      <TemplateStepNavigation
        currentStep={currentStep}
        onSelectStep={(step) => setCurrentStep(step)}
        issues={issues}
      />

      {/* Draft Notification Banner */}
      {draftNotice ? (
        <div className="bg-attention-soft border-b border-attention-border px-4 py-2.5 text-xs text-attention flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Save className="size-3.5" />
            <span>{draftNotice}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDraftNotice(null)}
            className="h-6 w-6 p-0 text-attention hover:bg-attention-border/30"
          >
            <X className="size-3" />
          </Button>
        </div>
      ) : null}

      {/* Main Workspace (Desktop 2-column, Mobile 1-column) */}
      <div className="flex-1 mx-auto w-full max-w-[1280px] p-3.5 pb-28 sm:p-6 lg:p-8 lg:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Configuration Form (Left 8 cols on desktop) */}
          <div className="lg:col-span-8 bg-card border border-border rounded-lg p-5 sm:p-6 shadow-2xs">
            {currentStep === 1 && (
              <TemplateBasicsForm template={template} onChange={handleUpdate} />
            )}

            {currentStep === 2 && (
              <TemplateFieldBuilder
                template={template}
                onChange={(fields) => handleUpdate({ fields })}
                onOpenPreview={() => setIsPreviewOpen(true)}
              />
            )}

            {currentStep === 3 && (
              <ApprovalRouteBuilder
                template={template}
                onChange={(routeSteps) => handleUpdate({ routeSteps })}
              />
            )}

            {currentStep === 4 && (
              <RuleBuilder template={template} onChange={(rules) => handleUpdate({ rules })} />
            )}

            {currentStep === 5 && (
              <TemplateReviewSummary
                template={template}
                issues={issues}
                onGoToStep={(step) => setCurrentStep(step)}
                onOpenPublishDialog={() => setIsPublishDialogOpen(true)}
                onSaveDraft={handleSaveDraft}
                onOpenSimulation={() => {
                  setPreviewTab("simulator");
                  setIsPreviewOpen(true);
                }}
              />
            )}

            {/* Bottom Form Actions */}
            {currentStep < 5 && (
              <div className="flex items-center justify-between border-t border-border mt-8 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="text-xs"
                >
                  <ArrowLeft className="size-3.5 mr-1" />
                  Back
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSaveDraft}
                    className="text-xs border-attention-border text-attention hover:bg-attention-soft"
                  >
                    Save draft
                  </Button>
                  <Button size="sm" onClick={handleContinue} className="text-xs font-semibold">
                    Continue
                    <ArrowRight className="size-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Live Summary Sidebar: Sticky on Desktop, Collapsible Disclosure on Mobile */}
          <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-6">
            <details className="lg:open group rounded-lg border border-border bg-card p-4 space-y-4 shadow-2xs">
              <summary className="flex items-center justify-between cursor-pointer list-none select-none">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-foreground">Live template summary</h3>
                  <span className="lg:hidden text-xs text-muted-foreground">(Tap to expand)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-muted border border-border px-2 py-0.5 text-xs font-mono text-muted-foreground">
                    Step {currentStep} of 5
                  </span>
                  <ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180 lg:hidden" />
                </div>
              </summary>

              {/* Mini Card Preview */}
              <div className="space-y-2 pt-2 border-t border-border/60">
                <div className="flex items-start justify-between">
                  <h4 className="text-sm font-bold text-foreground">
                    {template.label.trim() ? template.label : "Untitled template"}
                  </h4>
                  <span className="rounded bg-success-soft border border-success-border px-2 py-0.5 text-xs font-semibold text-success">
                    {template.versionStatus}
                  </span>
                </div>
                <p className="text-xs sm:text-[13px] text-muted-foreground line-clamp-2">
                  {template.description.trim()
                    ? template.description
                    : "No description provided yet"}
                </p>
              </div>

              {/* Route Summary */}
              <div className="rounded-md border border-border/60 bg-muted/40 p-3 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <span>Approval route</span>
                  <span>{template.routeSteps.length} step(s)</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded bg-card px-2 py-0.5 border border-border text-xs font-medium text-foreground">
                    Requester
                  </span>
                  {template.routeSteps.map((s) => (
                    <span key={s.id} className="flex items-center gap-1">
                      <span className="text-muted-foreground text-xs">→</span>
                      <span className="rounded bg-card px-2 py-0.5 border border-border text-xs font-medium text-foreground">
                        {s.name || "Step"}
                      </span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Governance & Evidence Summary */}
              <div className="space-y-1.5 text-xs sm:text-[13px] text-muted-foreground bg-muted/20 p-3 rounded border border-border/50">
                <div className="flex items-center justify-between">
                  <span>Form fields:</span>
                  <span className="font-medium text-foreground">
                    {template.fields.length} ({template.fields.filter((f) => f.required).length}{" "}
                    required)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Quotation rule:</span>
                  <span className="font-medium text-foreground">
                    {template.rules.requireQuotation
                      ? `Above $${template.rules.quotationThreshold} USD`
                      : "Optional"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Maximum spend:</span>
                  <span className="font-medium text-foreground">
                    {template.rules.maxAmount ? `$${template.rules.maxAmount} USD` : "None"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Owner:</span>
                  <span className="font-medium text-foreground truncate max-w-[130px]">
                    {template.ownerName}
                  </span>
                </div>
              </div>

              {/* Validation Status Preview */}
              <div className="border-t border-border pt-3">
                <div className="flex items-center justify-between text-xs sm:text-[13px]">
                  <span className="font-medium text-muted-foreground">Validation status:</span>
                  {isPublishable ? (
                    <span className="text-success font-semibold flex items-center gap-1">
                      <CheckCircle2 className="size-3" />
                      Ready to publish
                    </span>
                  ) : (
                    <span className="text-warning font-semibold">
                      {issues.length} check(s) pending
                    </span>
                  )}
                </div>
              </div>

              {/* Preview and Simulator Buttons */}
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPreviewTab("form");
                    setIsPreviewOpen(true);
                  }}
                  className="w-full text-xs font-semibold gap-1.5 h-8"
                >
                  <Eye className="size-3.5" />
                  Preview request form
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPreviewTab("simulator");
                    setIsPreviewOpen(true);
                  }}
                  className="w-full text-xs font-semibold gap-1.5 h-8 border-primary/30 text-primary hover:bg-primary/5"
                >
                  <SlidersHorizontal className="size-3.5" />
                  Simulate approval route
                </Button>
              </div>
            </details>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Action Bar (< sm) */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-30 bg-card/95 backdrop-blur-md border-t border-border px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-lg flex items-center justify-between gap-3">
        {currentStep === 1 ? (
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={isSavingDraft}
            className="h-11 min-h-[44px] px-3.5 text-xs font-semibold border-border text-foreground"
          >
            <Save className="size-4 mr-1.5" />
            {isSavingDraft ? "Saving..." : "Save draft"}
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={handleBack}
            className="h-11 min-h-[44px] px-3.5 text-xs font-semibold border-border text-foreground"
          >
            <ArrowLeft className="size-4 mr-1.5" />
            Back
          </Button>
        )}

        <Button
          onClick={handleContinue}
          disabled={currentStep === 5 && !isPublishable}
          className="h-11 min-h-[44px] flex-1 bg-primary text-primary-foreground hover:bg-primary-hover text-sm font-semibold shadow-2xs gap-1.5"
        >
          {currentStep === 5 ? (
            <>
              <CheckCircle2 className="size-4" />
              Publish template
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </div>

      {/* Modals */}
      <TemplatePreviewDialog
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        template={template}
        initialTab={previewTab}
      />

      <PublishTemplateDialog
        open={isPublishDialogOpen}
        onOpenChange={setIsPublishDialogOpen}
        template={template}
        onConfirmPublish={handleConfirmPublish}
      />
    </div>
  );
}
