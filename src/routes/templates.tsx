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
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/kneawork/app-shell";
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
import { Input } from "@/components/ui/input";
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

        {/* Header Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
          <div>
            <h1 className="text-base font-bold text-foreground">
              Standard request & approval workflows
            </h1>
            <p className="text-xs text-muted-foreground">
              Governed sequential routes that ensure requests reach designated signers and audit
              checkpoints
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search templates or policies..."
                className="h-8 rounded-md pl-8 text-xs bg-card"
              />
            </div>

            <Button
              size="sm"
              onClick={handleStartNewTemplate}
              className="h-8 gap-1.5 text-xs font-semibold shrink-0"
            >
              <Plus className="size-3.5" />
              New template
            </Button>
          </div>
        </div>

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
                  <div className="space-y-3">
                    {/* Title & Status */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-sm font-bold text-foreground">{t.label}</h2>
                          <span
                            className={`rounded border px-2 py-0.2 text-[10px] font-semibold ${
                              isDraft
                                ? "bg-warning-soft border-warning-border text-warning"
                                : "bg-success-soft border-success-border text-success"
                            }`}
                          >
                            {t.versionStatus}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                          {t.description}
                        </p>
                      </div>
                    </div>

                    {/* Sequential Ordered Route (Spec requirement: Approval route · 3 steps) */}
                    <div className="rounded-md border border-border/60 bg-muted/40 p-3 text-xs space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        <span>Approval route · {routeSteps.length} steps</span>
                        <span className="text-[10px] text-muted-foreground lowercase font-normal">
                          sequential
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 text-foreground font-medium">
                        <span className="rounded bg-card px-2 py-0.5 border border-border text-foreground text-[11px]">
                          Requester
                        </span>
                        {routeSteps.map((step) => (
                          <span key={step.id} className="flex items-center gap-1.5">
                            <span className="text-muted-foreground text-xs">→</span>
                            <span className="rounded bg-card px-2 py-0.5 border border-border text-foreground text-[11px]">
                              {step.name}
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Policy & Governance (Spec requirement: Clean readable policy) */}
                    <div className="space-y-1 text-[11px] text-muted-foreground bg-muted/30 p-2.5 rounded border border-border/50">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Policy:</span>
                        <span className="font-medium text-foreground">
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
                        <span className="font-mono text-foreground">
                          Version {t.version} · Updated {t.updatedDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Footer (Spec requirement: Owner, usage count, Open template) */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/60 pt-3 mt-2">
                    <div className="space-y-0.5">
                      <div className="text-[11px] text-muted-foreground">Owner: {t.ownerName}</div>
                      <div className="text-[10px] text-muted-foreground/80">
                        Used {t.usageCount} times · Last used {t.lastUsed}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isDraft ? (
                        <Button
                          size="sm"
                          onClick={() => setEditingTemplate(t)}
                          className="h-7 text-xs font-semibold gap-1"
                        >
                          <Edit2 className="size-3" />
                          Edit draft
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedTemplate(t)}
                          className="h-7 text-xs font-semibold"
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
                  <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                    {selectedTemplate.label}
                    <span className="rounded bg-success-soft border border-success-border px-2 py-0.2 text-[10px] font-semibold text-success">
                      v{selectedTemplate.version} · {selectedTemplate.versionStatus}
                    </span>
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    Governed workflow specification and approval integrity rules
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 text-xs py-2">
              {/* Description & Completion Outcome */}
              <div className="space-y-2">
                <span className="font-semibold text-foreground text-[11px] block">
                  Purpose & completion outcome
                </span>
                <div className="bg-muted/40 p-3 rounded-lg border border-border space-y-1.5">
                  <p className="text-foreground leading-relaxed">{selectedTemplate.description}</p>
                  <div className="border-t border-border/60 pt-1.5 text-[11px] text-muted-foreground">
                    <strong className="text-foreground">Successful completion deliverable:</strong>{" "}
                    {selectedTemplate.completionOutcome}
                  </div>
                </div>
              </div>

              {/* Sequential Steps with Named Approvers */}
              <div className="space-y-1.5">
                <span className="font-semibold text-foreground text-[11px] block">
                  Sequential approval route ({selectedTemplate.routeSteps.length} steps)
                </span>
                <div className="divide-y divide-border/60 rounded-md border border-border bg-card">
                  {selectedTemplate.routeSteps.map((step, idx) => (
                    <div key={step.id} className="flex items-center justify-between p-2.5">
                      <div className="flex items-center gap-2">
                        <span className="flex size-5 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-foreground">
                          {idx + 1}
                        </span>
                        <div>
                          <span className="font-semibold text-foreground">{step.name}</span>
                          <span className="block text-[11px] text-muted-foreground">
                            {step.roleName} · {step.assigneeName ?? "Workspace member"}
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] font-medium text-muted-foreground">
                        Due in {step.dueDays}d
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Evidence Rules */}
              <div className="space-y-1 bg-muted/20 p-3 rounded-lg border border-border/60">
                <span className="font-semibold text-foreground text-[11px] block">
                  Evidence & policy rules
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-muted-foreground pt-1">
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
              <div className="rounded-md border border-border bg-muted/40 p-3 text-[11px] text-muted-foreground flex items-start gap-2">
                <Lock className="size-3.5 text-muted-foreground mt-0.5 shrink-0" />
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
    </AppShell>
  );
}
