import { createFileRoute } from "@tanstack/react-router";
import {
  Archive,
  ArrowRight,
  Bot,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  Edit2,
  Eye,
  FileCheck,
  FileText,
  Layers,
  LayoutGrid,
  List,
  Lock,
  Plus,
  Receipt,
  ShieldCheck,
  ShoppingBag,
  Users,
  WandSparkles,
  X,
} from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/kneawork/app-shell";
import { PageHeader } from "@/components/kneawork/page-header";
import { ScrollableTabs } from "@/components/kneawork/scrollable-tabs";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  archiveTemplate,
  createBlankTemplate,
  createNewVersionFromPublished,
  publishTemplate,
  useTemplates,
} from "@/lib/kneawork/template-store";
import type { ExtendedTemplate } from "@/lib/kneawork/template-types";
import { cn } from "@/lib/utils";

function getCategoryIcon(category?: string, id?: string, size = "size-5") {
  const cat = (category || "").toLowerCase();
  const templateId = (id || "").toLowerCase();
  if (cat.includes("purchase") || templateId.includes("purchase"))
    return <ShoppingBag className={cn(size, "text-[#003D96]")} />;
  if (cat.includes("expense") || templateId.includes("expense"))
    return <Receipt className={cn(size, "text-[#003D96]")} />;
  if (cat.includes("leave") || templateId.includes("leave"))
    return <Calendar className={cn(size, "text-[#003D96]")} />;
  if (cat.includes("contract") || templateId.includes("contract"))
    return <FileCheck className={cn(size, "text-[#003D96]")} />;
  return <FileText className={cn(size, "text-[#003D96]")} />;
}

/** Pill badge for version+status */
function VersionBadge({ version, status }: { version: string; status: string }) {
  const isDraft = status === "Draft";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-bold whitespace-nowrap",
        isDraft
          ? "bg-amber-50 border-amber-200 text-amber-700"
          : "bg-emerald-50 border-emerald-200 text-emerald-700",
      )}
    >
      v{version} · {status}
    </span>
  );
}

export const Route = createFileRoute("/templates")({
  component: TemplatesPage,
});

function TemplatesPage() {
  const { templates } = useTemplates();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
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
            <div className="hidden sm:flex items-center gap-2.5">
              <div className="w-56 lg:w-64">
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
                className="gap-1.5 font-semibold border-border text-foreground hover:bg-muted shrink-0 text-xs sm:text-sm"
              >
                <Bot className="size-4 text-primary" aria-hidden="true" />
                Generate with AI
              </Button>

              <Button
                size="default"
                onClick={handleStartNewTemplate}
                className="gap-1.5 font-semibold bg-primary text-primary-foreground hover:bg-primary-hover shrink-0 shadow-2xs text-xs sm:text-sm"
              >
                <Plus className="size-4" />
                New template
              </Button>
            </div>
          }
        />

        {/* Mobile Dedicated Search & Action Row (< sm) */}
        <div className="sm:hidden space-y-3">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates..."
          />

          <div className="flex items-center gap-2">
            <Button
              size="default"
              onClick={handleStartNewTemplate}
              className="h-11 min-h-[44px] flex-1 font-semibold bg-primary text-primary-foreground hover:bg-primary-hover shadow-2xs text-sm gap-1.5"
            >
              <Plus className="size-4" />
              New template
            </Button>
            <Button
              variant="outline"
              size="default"
              onClick={() => setIsAiDialogOpen(true)}
              className="h-11 min-h-[44px] px-3.5 border-border text-foreground hover:bg-muted font-semibold text-xs gap-1.5 shrink-0"
              title="Generate workflow draft with AI"
            >
              <Bot className="size-4 text-primary" />
              <span>AI Draft</span>
            </Button>
          </div>
        </div>

        {/* Category Filters with ScrollableTabs & View Switcher */}
        <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-2">
          <div className="overflow-x-auto scrollbar-none flex-1 min-w-0">
            <ScrollableTabs
              tabs={[
                { id: "all", label: "All", count: templates.length },
                { id: "purchase", label: "Purchase" },
                { id: "expense", label: "Expense" },
                { id: "leave", label: "Leave" },
                { id: "contract", label: "Contract" },
                { id: "drafts", label: "Drafts" },
              ]}
              activeTab={categoryFilter}
              onTabChange={(id) => setCategoryFilter(id)}
              ariaLabel="Template categories"
            />
          </div>
          {/* View mode switcher */}
          <div className="flex items-center gap-1 shrink-0 bg-muted/60 p-0.5 rounded-lg border border-border/50">
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors",
                viewMode === "cards"
                  ? "bg-card text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-label="Cards view"
              title="Cards view"
            >
              <LayoutGrid className="size-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors",
                viewMode === "table"
                  ? "bg-card text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-label="Table view"
              title="Table view"
            >
              <List className="size-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>
        </div>

        {/* Template Content (Cards or Table) */}
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center space-y-4">
            <div className="size-12 rounded-xl bg-muted flex items-center justify-center mx-auto">
              <Layers className="size-6 text-muted-foreground" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-foreground">No templates found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                {search
                  ? `No templates matching "${search}". Clear the search to see all templates.`
                  : "Create your first request template to give employees a consistent way to submit work."}
              </p>
            </div>
            {search ? (
              <Button variant="outline" size="sm" onClick={() => setSearch("")} className="text-xs">
                Clear search
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleStartNewTemplate}
                className="text-xs font-semibold gap-1.5 bg-[#003D96] hover:bg-[#002D70] text-white"
              >
                <Plus className="size-3.5" />
                Create template
              </Button>
            )}
          </div>
        ) : viewMode === "cards" ? (
          /* ── CARDS VIEW ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((t) => {
              const routeSteps = t.routeSteps;
              const isDraft = t.versionStatus === "Draft";

              return (
                <div
                  key={t.id}
                  role="article"
                  className="group rounded-xl border border-border bg-card shadow-2xs hover:shadow-md hover:border-[#003D96]/30 transition-all duration-200 flex flex-col"
                >
                  {/* Card Header */}
                  <div className="p-5 flex items-start gap-3.5 border-b border-border/60">
                    <div className="size-11 rounded-xl bg-[#F2F7FF] border border-[#003D96]/15 flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
                      {getCategoryIcon(t.category, t.id)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h2 className="text-sm font-bold text-foreground leading-snug group-hover:text-[#003D96] transition-colors">
                          {t.label}
                        </h2>
                        <VersionBadge version={t.version} status={t.versionStatus} />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {t.description}
                      </p>
                    </div>
                  </div>

                  {/* Approval Route — inline arrow chain */}
                  <div className="px-5 py-3 border-b border-border/60 bg-muted/20">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Approval route · {routeSteps.length} step{routeSteps.length !== 1 ? "s" : ""}
                    </p>
                    <div className="flex flex-wrap items-center gap-1 text-xs">
                      <span className="text-muted-foreground font-medium">Requester</span>
                      {routeSteps.map((step) => (
                        <span key={step.id} className="inline-flex items-center gap-1">
                          <ArrowRight className="size-3 text-muted-foreground/60 shrink-0" />
                          <span className="font-semibold text-foreground bg-[#F2F7FF] border border-[#003D96]/15 px-1.5 py-0.5 rounded-md whitespace-nowrap">
                            {step.name}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Meta row: policy pill + owner */}
                  <div className="px-5 py-3 flex items-center justify-between gap-3 flex-wrap text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="size-3.5 text-muted-foreground/70 shrink-0" />
                      {t.rules.requireQuotation
                        ? `Quotation > $${t.rules.quotationThreshold}`
                        : "Standard policy"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="size-3 text-muted-foreground/70 shrink-0" />
                      {t.ownerName}
                    </span>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="px-5 pb-4 pt-1 mt-auto flex items-center justify-between gap-3 border-t border-border/60">
                    <span className="text-[11px] text-muted-foreground">
                      {t.usageCount} uses · {t.lastUsed}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {isDraft ? (
                        <Button
                          size="sm"
                          onClick={() => setEditingTemplate(t)}
                          className="font-semibold gap-1 h-8 text-xs bg-[#003D96] hover:bg-[#002D70] text-white"
                        >
                          <Edit2 className="size-3.5" />
                          Edit draft
                        </Button>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setPreviewTemplate(t);
                            }}
                            className="h-8 text-xs px-2.5 text-muted-foreground hover:text-foreground"
                            title="Preview employee form"
                          >
                            <Eye className="size-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedTemplate(t)}
                            className="font-semibold h-8 text-xs hover:bg-[#F2F7FF] hover:text-[#003D96] hover:border-[#003D96]/30"
                          >
                            Open
                            <ArrowRight className="size-3 ml-1" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ── TABLE VIEW ── */
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xs">
            {/* Horizontally scrollable on mobile */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider pl-4 whitespace-nowrap">
                      Template
                    </TableHead>
                    <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                      Status
                    </TableHead>
                    <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider whitespace-nowrap hidden md:table-cell">
                      Approval Route
                    </TableHead>
                    <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">
                      Policy
                    </TableHead>
                    <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider whitespace-nowrap hidden sm:table-cell">
                      Usage
                    </TableHead>
                    <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider text-right pr-4 whitespace-nowrap">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((t) => {
                    const isDraft = t.versionStatus === "Draft";
                    return (
                      <TableRow key={t.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="pl-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="size-9 rounded-lg bg-[#F2F7FF] border border-[#003D96]/15 flex items-center justify-center shrink-0">
                              {getCategoryIcon(t.category, t.id, "size-4")}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-sm text-foreground truncate max-w-[180px] sm:max-w-[240px]">
                                {t.label}
                              </div>
                              <div className="text-xs text-muted-foreground line-clamp-1 max-w-[180px] sm:max-w-[240px]">
                                {t.description}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3">
                          <VersionBadge version={t.version} status={t.versionStatus} />
                        </TableCell>
                        <TableCell className="py-3 hidden md:table-cell">
                          <div className="text-xs font-medium text-foreground">
                            {t.routeSteps.length} steps
                          </div>
                          <div className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                            {t.routeSteps.map((s) => s.name).join(" → ")}
                          </div>
                        </TableCell>
                        <TableCell className="py-3 hidden lg:table-cell">
                          <div className="text-xs text-foreground font-medium">
                            {t.rules.requireQuotation
                              ? `Quotation > $${t.rules.quotationThreshold}`
                              : "Standard"}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {t.rules.maxAmount ? `Max: $${t.rules.maxAmount.toLocaleString()}` : "No ceiling"}
                          </div>
                        </TableCell>
                        <TableCell className="py-3 hidden sm:table-cell">
                          <div className="text-xs text-foreground font-medium">{t.usageCount} uses</div>
                          <div className="text-[11px] text-muted-foreground">Last: {t.lastUsed}</div>
                        </TableCell>
                        <TableCell className="text-right pr-4 py-3">
                          <div className="flex items-center justify-end gap-1.5">
                            {isDraft ? (
                              <Button
                                size="sm"
                                onClick={() => setEditingTemplate(t)}
                                className="h-8 text-xs font-semibold gap-1 bg-[#003D96] hover:bg-[#002D70] text-white"
                              >
                                <Edit2 className="size-3" />
                                Edit
                              </Button>
                            ) : (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setPreviewTemplate(t)}
                                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                  title="Preview form"
                                >
                                  <Eye className="size-3.5" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedTemplate(t)}
                                  className="h-8 text-xs font-semibold hover:bg-[#F2F7FF] hover:text-[#003D96]"
                                >
                                  Open
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            {/* Table status bar */}
            <div className="flex items-center justify-end gap-6 border-t border-border bg-muted/40 px-4 py-1.5 text-[11px] font-medium text-muted-foreground tabular-nums">
              <span>
                Showing:{" "}
                <strong className="font-semibold text-foreground">{filtered.length}</strong> of{" "}
                <strong className="font-semibold text-foreground">{templates.length}</strong>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Template Detail Modal ── */}
      {selectedTemplate ? (
        <Dialog open onOpenChange={(open) => !open && setSelectedTemplate(null)}>
          <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-0">
            {/* Gradient header with icon */}
            <div className="bg-gradient-to-br from-[#F2F7FF] to-[#e8f0fd] border-b border-[#003D96]/15 p-5 rounded-t-lg">
              <div className="flex items-start gap-4">
                <div className="size-12 rounded-xl bg-white border border-[#003D96]/20 flex items-center justify-center shrink-0 shadow-sm">
                  {getCategoryIcon(selectedTemplate.category, selectedTemplate.id, "size-6")}
                </div>
                <div className="min-w-0 flex-1">
                  <DialogHeader className="p-0 gap-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <DialogTitle className="text-base font-bold text-foreground leading-snug">
                        {selectedTemplate.label}
                      </DialogTitle>
                      <VersionBadge version={selectedTemplate.version} status={selectedTemplate.versionStatus} />
                    </div>
                    <DialogDescription className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {selectedTemplate.description}
                    </DialogDescription>
                  </DialogHeader>
                </div>
              </div>
            </div>

            <div className="space-y-5 p-5">
              {/* Completion Outcome */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Governed deliverable
                </p>
                <div className="bg-muted/40 rounded-lg border border-border px-3.5 py-2.5 text-sm text-foreground leading-relaxed">
                  {selectedTemplate.completionOutcome}
                </div>
              </div>

              {/* Sequential Approval Route — timeline style */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Sequential approval route · {selectedTemplate.routeSteps.length} steps
                </p>
                <div className="relative">
                  {/* Vertical connector line */}
                  <div
                    className="absolute left-[19px] top-8 bottom-4 w-px bg-border"
                    aria-hidden="true"
                  />
                  <div className="space-y-0">
                    {/* Requester node */}
                    <div className="flex items-center gap-3 pb-3">
                      <div className="size-10 rounded-full bg-muted border border-border flex items-center justify-center shrink-0 z-10">
                        <Users className="size-4 text-muted-foreground" />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-foreground">Requester</span>
                        <span className="block text-xs text-muted-foreground">Submits the request</span>
                      </div>
                    </div>

                    {selectedTemplate.routeSteps.map((step, idx) => (
                      <div key={step.id} className="flex items-start gap-3 pb-3">
                        <div className="size-10 rounded-full bg-[#003D96] flex items-center justify-center shrink-0 z-10">
                          <span className="text-white text-xs font-bold">{idx + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0 pt-1.5">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-foreground">{step.name}</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                              <Clock className="size-3" />
                              Due in {step.dueDays}d
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {step.roleName} · {step.assigneeName ?? "Workspace member"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Evidence & Policy Rules — 2-col grid */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Evidence & policy rules
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      label: "Quotation",
                      value: selectedTemplate.rules.requireQuotation
                        ? `Above $${selectedTemplate.rules.quotationThreshold} USD`
                        : "Optional",
                    },
                    {
                      label: "Max spend",
                      value: selectedTemplate.rules.maxAmount
                        ? `$${selectedTemplate.rules.maxAmount.toLocaleString()} USD`
                        : "None",
                    },
                    {
                      label: "File formats",
                      value: selectedTemplate.rules.allowedFileTypes.join(", "),
                    },
                    {
                      label: "Missing evidence",
                      value:
                        selectedTemplate.rules.onMissingEvidence === "prevent"
                          ? "Prevent submission"
                          : "Allow later",
                    },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="rounded-lg bg-muted/30 border border-border/60 px-3 py-2.5"
                    >
                      <p className="text-[10px] text-muted-foreground font-medium mb-0.5">{label}</p>
                      <p className="text-xs font-semibold text-foreground leading-snug">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Version Immutability Notice */}
              <div className="rounded-lg border border-border bg-muted/30 p-3.5 text-xs text-muted-foreground flex items-start gap-2.5">
                <Lock className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                <span className="leading-relaxed">
                  <strong className="text-foreground">Version immutability:</strong> Published workflow
                  versions cannot be modified directly. Editing creates a new draft version. Requests
                  submitted under v{selectedTemplate.version} remain anchored to their original schema.
                </span>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:justify-between border-t border-border/60 p-4 pt-3">
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
                  className="text-xs gap-1"
                >
                  <Eye className="size-3" />
                  Preview form
                </Button>

                <Button
                  size="sm"
                  onClick={handleCreateNewVersion}
                  className="text-xs font-semibold gap-1 bg-primary text-primary-foreground hover:bg-primary-hover"
                >
                  <Copy className="size-3" />
                  New version (Draft v
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
