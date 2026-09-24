import { createFileRoute } from "@tanstack/react-router";
import {
  Archive,
  ArrowRight,
  CheckCircle2,
  Clock,
  Copy,
  Edit2,
  Eye,
  FileCheck,
  FileText,
  Layers,
  Lock,
  Plus,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/kneawork/app-shell";
import { PageHeader } from "@/components/kneawork/page-header";
import { AiWorkflowGeneratorDialog } from "@/components/kneawork/template-builder/ai-workflow-generator-dialog";
import { TemplateBuilder } from "@/components/kneawork/template-builder/template-builder";
import { TemplatePreviewDialog } from "@/components/kneawork/template-builder/template-preview-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SearchInput } from "@/components/kneawork/search-input";
import {
  archiveTemplate,
  createBlankTemplate,
  createNewVersionFromPublished,
  publishTemplate,
  useTemplates,
} from "@/lib/kneawork/template-store";
import type { ExtendedTemplate } from "@/lib/kneawork/template-types";

export const Route = createFileRoute("/templates")({
  component: TemplatesPage,
});

export function TemplatesPage() {
  const { templates } = useTemplates();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedTemplate, setSelectedTemplate] = useState<ExtendedTemplate | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<ExtendedTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<ExtendedTemplate | null>(null);
  const [versionActionNotice, setVersionActionNotice] = useState<string | null>(null);
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);

  const filtered = templates.filter((t) => {
    const matchesSearch =
      t.label.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.completionOutcome.toLowerCase().includes(search.toLowerCase()) ||
      t.ownerName.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" ||
      (categoryFilter === "drafts" ? t.versionStatus === "Draft" : t.category === categoryFilter);

    return matchesSearch && matchesCategory;
  });

  const handleStartNewTemplate = () => {
    setEditingTemplate(createBlankTemplate());
  };

  const handleCreateNewVersion = () => {
    if (!selectedTemplate) return;
    try {
      const draftCopy = createNewVersionFromPublished(selectedTemplate.id);
      setSelectedTemplate(null);
      setEditingTemplate(draftCopy);
      setVersionActionNotice(
        `Draft v${draftCopy.version} created. Existing requests remain pinned to published v${selectedTemplate.version}.`,
      );
      setTimeout(() => setVersionActionNotice(null), 6000);
    } catch {
      // Fallback
    }
  };

  const handleArchive = () => {
    if (!selectedTemplate) return;
    archiveTemplate(selectedTemplate.id);
    setSelectedTemplate(null);
    setVersionActionNotice(`Template "${selectedTemplate.label}" has been archived.`);
    setTimeout(() => setVersionActionNotice(null), 5000);
  };

  const handleTemplatePublished = (published: ExtendedTemplate) => {
    publishTemplate(published);
    setEditingTemplate(null);
    setVersionActionNotice(
      `Template "${published.label}" published successfully. New requests will now use version ${published.version}.`,
    );
    setTimeout(() => setVersionActionNotice(null), 6000);
  };

  // If in builder mode, show full-page guided builder
  if (editingTemplate) {
    return (
      <TemplateBuilder
        initialTemplate={editingTemplate}
        onClose={() => setEditingTemplate(null)}
        onPublished={handleTemplatePublished}
      />
    );
  }

  return (
    <AppShell
      title="Templates"
      subtitle="Standard request and approval processes"
      breadcrumbs={[{ label: "Manage" }, { label: "Templates" }]}
    >
      <div className="space-y-6">
        {/* Notice Banner */}
        {versionActionNotice ? (
          <div className="rounded-lg border border-attention-border bg-attention-soft p-3.5 text-xs text-attention flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-attention shrink-0" />
              <span>{versionActionNotice}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setVersionActionNotice(null)}
              className="h-6 w-6 p-0 text-attention hover:bg-attention-border/30"
            >
              <X className="size-3.5" />
            </Button>
          </div>
        ) : null}

        {/* Standard PageHeader */}
        <PageHeader
          eyebrow="Manage"
          title="Templates"
          description="Reusable request and approval processes that ensure requests reach designated signers and audit checkpoints."
          actions={
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <div className="flex-1 sm:w-64">
                <SearchInput
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search templates or policies..."
                />
              </div>

              <Button
                variant="outline"
                size="default"
                onClick={() => setIsAiDialogOpen(true)}
                className="gap-1.5 font-semibold border-primary/40 text-primary hover:bg-primary/10 shrink-0"
              >
                <Sparkles className="size-4" />
                Generate with AI
              </Button>

              <Button
                size="default"
                onClick={handleStartNewTemplate}
                className="gap-1.5 font-semibold bg-primary text-primary-foreground hover:bg-primary-hover shrink-0 shadow-2xs"
              >
                <Plus className="size-4" />
                New template
              </Button>
            </div>
          }
        />

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 border-b border-border/60 pb-3 overflow-x-auto scrollbar-none">
          {[
            { id: "all", label: "All templates" },
            { id: "purchase", label: "Purchase" },
            { id: "expense", label: "Expense" },
            { id: "leave", label: "Leave" },
            { id: "contract", label: "Contract" },
            { id: "drafts", label: "Drafts" },
          ].map((cat) => {
            const isActive = categoryFilter === cat.id;
            return (
              <Button
                key={cat.id}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryFilter(cat.id)}
                className={`h-7 text-xs shrink-0 ${
                  isActive ? "font-semibold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat.label}
              </Button>
            );
          })}
        </div>

        {/* Template Cards Grid */}
        {filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-12 text-center space-y-3">
            <Layers className="size-8 text-muted-foreground mx-auto" />
            <h3 className="text-sm font-bold text-foreground">No templates match your filter</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {search
                ? `No templates found matching "${search}". Clear search to view all.`
                : "Create your first request template to give employees a consistent way to submit work."}
            </p>
            {search ? (
              <Button variant="outline" size="sm" onClick={() => setSearch("")} className="text-xs">
                Clear search
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleStartNewTemplate}
                className="text-xs font-semibold gap-1.5"
              >
                <Plus className="size-3.5" />
                Create template
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filtered.map((t) => {
              const routeSteps = t.routeSteps;
              const isDraft = t.versionStatus === "Draft";

              return (
                <div
                  key={t.id}
                  className="rounded-lg border border-border bg-card p-5 shadow-2xs space-y-4 hover:border-border/80 transition-colors flex flex-col justify-between"
                >
                  <div className="space-y-3.5">
                    {/* Title & Status */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-semibold text-foreground">{t.label}</h2>
                          <span
                            className={`rounded border px-2 py-0.5 text-xs font-semibold ${
                              isDraft
                                ? "bg-warning-soft border-warning-border text-warning"
                                : "bg-success-soft border-success-border text-success"
                            }`}
                          >
                            {t.versionStatus}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                          {t.description}
                        </p>
                      </div>
                    </div>

                    {/* Sequential Ordered Route (Spec: Approval route · 3 steps) */}
                    <div className="rounded-md border border-border/60 bg-muted/40 p-3 space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                        <span>Approval route · {routeSteps.length} steps</span>
                        <span className="text-xs text-muted-foreground font-normal">
                          sequential
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 text-foreground font-medium">
                        <span className="rounded bg-card px-2.5 py-0.5 border border-border text-foreground text-sm font-medium">
                          Requester
                        </span>
                        {routeSteps.map((step) => (
                          <span key={step.id} className="flex items-center gap-1.5">
                            <span className="text-muted-foreground text-xs">→</span>
                            <span className="rounded bg-card px-2.5 py-0.5 border border-border text-foreground text-sm font-medium">
                              {step.name}
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Policy & Governance (Spec: Policy 14px, stronger than owner 13px) */}
                    <div className="space-y-1.5 text-[13px] text-muted-foreground bg-muted/30 p-3 rounded border border-border/50">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Policy:</span>
                        <span className="font-medium text-sm text-foreground">
                          {t.rules.requireQuotation
                            ? `Quotation required above USD ${t.rules.quotationThreshold}`
                            : "Standard documentation"}
                          {t.rules.maxAmount
                            ? ` · Maximum amount USD ${t.rules.maxAmount.toLocaleString()}`
                            : ""}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Version:</span>
                        <span className="font-mono text-foreground text-[13px]">
                          Version {t.version} · Updated {t.updatedDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Footer (Owner 13px, Open template button 14px) */}
                  <div className="flex items-center justify-between text-[13px] text-muted-foreground border-t border-border/60 pt-3 mt-2">
                    <div className="space-y-0.5">
                      <div className="text-[13px] text-foreground font-medium">Owner: {t.ownerName}</div>
                      <div className="text-xs text-muted-foreground">
                        Used {t.usageCount} times · Last used {t.lastUsed}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isDraft ? (
                        <Button
                          size="sm"
                          onClick={() => setEditingTemplate(t)}
                          className="font-semibold gap-1"
                        >
                          <Edit2 className="size-3.5" />
                          Edit draft
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedTemplate(t)}
                          className="font-semibold"
                        >
                          Open template
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Template Detail Modal (Spec requirement: Detail view with immutability notice and new version creation) */}
      {selectedTemplate ? (
        <Dialog open onOpenChange={(open) => !open && setSelectedTemplate(null)}>
          <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                    {selectedTemplate.label}
                    <span className="rounded bg-success-soft border border-success-border px-2 py-0.5 text-xs font-semibold text-success">
                      v{selectedTemplate.version} · {selectedTemplate.versionStatus}
                    </span>
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                    Governed workflow specification and approval integrity rules
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Description & Completion Outcome */}
              <div className="space-y-2">
                <span className="font-semibold text-foreground text-xs uppercase tracking-wider block">
                  Purpose & completion outcome
                </span>
                <div className="bg-muted/40 p-3 rounded-lg border border-border space-y-2">
                  <p className="text-sm text-foreground leading-relaxed">{selectedTemplate.description}</p>
                  <div className="border-t border-border/60 pt-2 text-xs sm:text-[13px] text-muted-foreground">
                    <strong className="text-foreground">Successful completion deliverable:</strong>{" "}
                    {selectedTemplate.completionOutcome}
                  </div>
                </div>
              </div>

              {/* Sequential Steps with Named Approvers */}
              <div className="space-y-2">
                <span className="font-semibold text-foreground text-xs uppercase tracking-wider block">
                  Sequential approval route ({selectedTemplate.routeSteps.length} steps)
                </span>
                <div className="divide-y divide-border/60 rounded-md border border-border bg-card">
                  {selectedTemplate.routeSteps.map((step, idx) => (
                    <div key={step.id} className="flex items-center justify-between p-3 text-sm">
                      <div className="flex items-center gap-2.5">
                        <span className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-bold text-foreground">
                          {idx + 1}
                        </span>
                        <div>
                          <span className="font-semibold text-foreground">{step.name}</span>
                          <span className="block text-[13px] text-muted-foreground">
                            {step.roleName} · {step.assigneeName ?? "Workspace member"}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs sm:text-[13px] font-medium text-muted-foreground">
                        Due in {step.dueDays}d
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Evidence Rules */}
              <div className="space-y-1.5 bg-muted/20 p-3.5 rounded-lg border border-border/60">
                <span className="font-semibold text-foreground text-xs uppercase tracking-wider block">
                  Evidence & policy rules
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-[13px] text-muted-foreground pt-1">
                  <div>
                    Quotation:{" "}
                    <strong className="text-foreground">
                      {selectedTemplate.rules.requireQuotation
                        ? `Above $${selectedTemplate.rules.quotationThreshold} USD`
                        : "Optional"}
                    </strong>
                  </div>
                  <div>
                    Max spend:{" "}
                    <strong className="text-foreground">
                      {selectedTemplate.rules.maxAmount
                        ? `$${selectedTemplate.rules.maxAmount.toLocaleString()} USD`
                        : "None"}
                    </strong>
                  </div>
                  <div>
                    Allowed formats:{" "}
                    <strong className="text-foreground font-mono">
                      {selectedTemplate.rules.allowedFileTypes.join(", ")}
                    </strong>
                  </div>
                  <div>
                    Missing evidence:{" "}
                    <strong className="text-foreground capitalize">
                      {selectedTemplate.rules.onMissingEvidence === "prevent"
                        ? "Prevent submission"
                        : "Allow changes later"}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Version Immutability Notice (Spec requirement) */}
              <div className="rounded-md border border-border bg-muted/40 p-3 text-xs sm:text-[13px] text-muted-foreground flex items-start gap-2">
                <Lock className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                <span>
                  <strong>Version immutability:</strong> Published workflow versions cannot be
                  modified directly. Editing this workflow creates a new draft version. Requests
                  already submitted under v{selectedTemplate.version} remain strictly anchored to
                  their original schema for audit validity.
                </span>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:justify-between border-t border-border/60 pt-3">
              <Button
                variant="outline"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={handleArchive}
              >
                <Archive className="size-3 mr-1" />
                Archive
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setPreviewTemplate(selectedTemplate);
                  }}
                  className="text-xs"
                >
                  <Eye className="size-3 mr-1" />
                  Preview request
                </Button>

                <Button
                  size="sm"
                  onClick={handleCreateNewVersion}
                  className="text-xs font-semibold gap-1 bg-primary text-primary-foreground hover:bg-primary-hover"
                >
                  <Copy className="size-3" />
                  Create new version (Draft v
                  {(parseFloat(selectedTemplate.version) + 0.1).toFixed(1)})
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}

      {/* Live Preview Dialog */}
      {previewTemplate ? (
        <TemplatePreviewDialog
          open={Boolean(previewTemplate)}
          onOpenChange={(open) => !open && setPreviewTemplate(null)}
          template={previewTemplate}
        />
      ) : null}

      {/* AI Workflow Draft Generator Modal */}
      <AiWorkflowGeneratorDialog
        open={isAiDialogOpen}
        onOpenChange={setIsAiDialogOpen}
        onReviewDraft={(draft) => setEditingTemplate(draft)}
      />
    </AppShell>
  );
}
