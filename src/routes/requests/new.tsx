import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileCheck,
  FileText,
  Paperclip,
  Plus,
  Receipt,
  Search,
  Send,
  ShoppingBag,
  Sparkles,
  Upload,
  User,
  X,
} from "lucide-react";
import { useState, useMemo } from "react";

import { AppShell } from "@/components/kneawork/app-shell";
import { PageHeader } from "@/components/kneawork/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ROUTES_BY_TYPE, TEMPLATES, personById, templateByType } from "@/lib/kneawork/data";
import { submitRequest, useKneaState } from "@/lib/kneawork/store";
import type { RequestType, WorkRequest } from "@/lib/kneawork/types";

const REQUEST_TYPE_META: Record<
  RequestType,
  {
    icon: typeof ShoppingBag;
    category: string;
    sla: string;
    subtitle: string;
    stepsSummary: string[];
    hasThreshold?: boolean;
    thresholdAmount?: number;
  }
> = {
  purchase: {
    icon: ShoppingBag,
    category: "IT & Equipment",
    sla: "Usually ~1 day",
    subtitle: "Buy equipment, software, or supplies with vendor quotation attachment",
    stepsSummary: ["Finance Review", "Manager Approval", "Director Sign-off (> $1k)"],
    hasThreshold: true,
    thresholdAmount: 1000,
  },
  expense: {
    icon: Receipt,
    category: "Finance & Expense",
    sla: "Usually ~4 hours",
    subtitle: "Claim reimbursement for out-of-pocket operational spend or travel",
    stepsSummary: ["Finance Review", "Manager Approval"],
  },
  leave: {
    icon: Calendar,
    category: "HR & Leave",
    sla: "Usually ~2 hours",
    subtitle: "Request annual leave, medical time-off, or work schedule adjustment",
    stepsSummary: ["Manager Approval"],
  },
  contract: {
    icon: FileText,
    category: "Operations & Legal",
    sla: "Usually ~2 days",
    subtitle: "Formal legal review and executive sign-off for vendor retainers and MoUs",
    stepsSummary: ["Finance Review", "Manager Approval", "Director Sign-off (> $1k)"],
    hasThreshold: true,
    thresholdAmount: 1000,
  },
};

export const Route = createFileRoute("/requests/new")({
  validateSearch: (search: Record<string, unknown>): { type?: RequestType } => {
    return {
      type: (search["type"] as RequestType) || undefined,
    };
  },
  component: NewRequestPage,
});

function NewRequestPage() {
  const { type: searchType } = Route.useSearch();
  const navigate = useNavigate();
  const { currentUserId } = useKneaState();

  // Selected template state
  const [selectedType, setSelectedType] = useState<RequestType | null>(searchType ?? null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [vendor, setVendor] = useState("");
  const [valueLabel, setValueLabel] = useState("");
  const [reason, setReason] = useState("");
  const [neededBy, setNeededBy] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Catalog search & category filter
  const [catalogSearch, setCatalogSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // File Upload Simulation
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>({
    name: "official_quotation_vendor.pdf",
    size: "245 KB",
  });
  const [isDragging, setIsDragging] = useState(false);

  // Submission State
  const [submittedRecord, setSubmittedRecord] = useState<WorkRequest | null>(null);

  // Parse numeric amount for dynamic route condition illumination
  const numericAmount = useMemo(() => {
    const raw = valueLabel.replace(/[^0-9.]/g, "");
    return parseFloat(raw) || 0;
  }, [valueLabel]);

  // Categories list with counts
  const categories = useMemo(() => {
    const counts: Record<string, number> = {
      all: TEMPLATES.length,
      "IT & Equipment": 0,
      "Finance & Expense": 0,
      "HR & Leave": 0,
      "Operations & Legal": 0,
    };
    TEMPLATES.forEach((t) => {
      const cat = REQUEST_TYPE_META[t.type].category;
      if (cat in counts) counts[cat] += 1;
    });
    return [
      { id: "all", label: "All Templates", count: counts.all },
      { id: "IT & Equipment", label: "IT & Equipment", count: counts["IT & Equipment"] },
      { id: "Finance & Expense", label: "Finance & Expense", count: counts["Finance & Expense"] },
      { id: "HR & Leave", label: "HR & Leave", count: counts["HR & Leave"] },
      { id: "Operations & Legal", label: "Operations & Legal", count: counts["Operations & Legal"] },
    ];
  }, []);

  // Filtered catalog templates
  const filteredTemplates = useMemo(() => {
    return TEMPLATES.filter((t) => {
      const meta = REQUEST_TYPE_META[t.type];
      const matchesCategory = categoryFilter === "all" || meta.category === categoryFilter;
      const q = catalogSearch.trim().toLowerCase();
      const matchesSearch =
        !q ||
        t.label.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        meta.subtitle.toLowerCase().includes(q) ||
        meta.category.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [catalogSearch, categoryFilter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType || !title.trim() || !valueLabel.trim() || !reason.trim()) return;

    setIsSubmitting(true);
    const fullTitle = vendor.trim() ? `${title.trim()} (${vendor.trim()})` : title.trim();

    setTimeout(() => {
      const req = submitRequest({
        type: selectedType,
        title: fullTitle,
        valueLabel:
          selectedType === "leave" ? valueLabel.trim() : `$${valueLabel.replace("$", "").trim()}`,
        reason: reason.trim(),
        neededBy: neededBy.trim(),
        attachmentName: uploadedFile?.name ?? undefined,
      });

      setIsSubmitting(false);
      setSubmittedRecord(req);
    }, 400);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedFile({
        name: file.name,
        size: `${(file.size / 1024).toFixed(0)} KB`,
      });
    }
  };

  // SUCCESS CONFIRMATION VIEW
  if (submittedRecord) {
    const firstStep = submittedRecord.steps[0];
    const firstOwner = firstStep ? personById(firstStep.assigneeId) : null;

    return (
      <AppShell
        title="Request submitted"
        breadcrumbs={[{ label: "Requests", to: "/requests" }, { label: "Submission Confirmation" }]}
      >
        <div className="mx-auto max-w-xl py-10">
          <div className="rounded-xl border border-border bg-card p-6 sm:p-8 text-center shadow-sm space-y-5">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-success-soft text-success shadow-2xs">
              <CheckCircle2 className="size-7" />
            </div>

            <div>
              <span className="font-mono text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {submittedRecord.code}
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground mt-1">
                Request Successfully Submitted
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-md mx-auto leading-relaxed">
                Your request <strong className="text-foreground">{submittedRecord.title}</strong>{" "}
                has entered the sequential approval chain. It is currently waiting for{" "}
                <strong className="text-primary font-semibold">
                  {firstOwner?.name} · {firstStep?.name}
                </strong>
                .
              </p>
            </div>

            <div className="rounded-xl border border-border bg-muted/20 p-4 text-xs text-foreground text-left space-y-2 max-w-md mx-auto">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Current Step:</span>
                <span className="font-bold text-foreground">{firstStep?.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Assigned Reviewer:</span>
                <span className="font-semibold text-foreground">
                  {firstOwner?.name} ({firstOwner?.role})
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Expected SLA:</span>
                <span className="font-medium text-success">Due within 24 hours</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-3">
              <Button asChild variant="outline" size="sm" className="text-xs h-9">
                <Link to="/requests">All Requests</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary-hover text-xs font-bold h-9 shadow-2xs"
              >
                <Link to="/requests/$requestId" params={{ requestId: submittedRecord.id }}>
                  Track Request
                  <ArrowRight className="size-3.5 ml-1.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  // VIEW 1: SERVICE CATALOG (Default when no template is selected)
  if (!selectedType) {
    return (
      <AppShell
        title="Service Catalog"
        breadcrumbs={[{ label: "Workspace", to: "/" }, { label: "Service Catalog" }]}
      >
        <div className="space-y-6">
          <PageHeader
            eyebrow="New Request"
            title="What do you need?"
            description="Choose a request template below or search across operational and financial categories."
            actions={
              <div className="w-full sm:w-72">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    placeholder="Search templates (e.g. laptop, leave)..."
                    className="pl-9 h-9 text-xs"
                  />
                </div>
              </div>
            }
          />

          {/* Quick-Access Row for Frequent Templates */}
          {!catalogSearch && (
            <div className="space-y-2.5">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Recently Used Templates
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {TEMPLATES.slice(0, 3).map((t) => {
                  const meta = REQUEST_TYPE_META[t.type];
                  const Icon = meta.icon;
                  return (
                    <div
                      key={t.type}
                      onClick={() => setSelectedType(t.type)}
                      className="group rounded-xl border border-border bg-card p-4 hover:border-primary hover:bg-accent/40 cursor-pointer transition-all duration-150 shadow-2xs flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <Icon className="size-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-foreground group-hover:text-primary truncate">
                            {t.label}
                          </h3>
                          <span className="text-[11px] text-muted-foreground">{meta.category}</span>
                        </div>
                      </div>
                      <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Catalog Layout: Left Category Rail (Desktop) + Right Templates Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Category Rail */}
            <div className="lg:col-span-3 space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block px-2 mb-2">
                Categories
              </span>
              <div className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
                {categories.map((c) => {
                  const isSelected = categoryFilter === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCategoryFilter(c.id)}
                      className={`flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium transition-colors shrink-0 text-left cursor-pointer ${
                        isSelected
                          ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                      }`}
                    >
                      <span>{c.label}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ml-2 ${
                          isSelected
                            ? "bg-white/20 text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {c.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Templates Grid */}
            <div className="lg:col-span-9">
              {filteredTemplates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredTemplates.map((t) => {
                    const meta = REQUEST_TYPE_META[t.type];
                    const Icon = meta.icon;

                    return (
                      <div
                        key={t.type}
                        onClick={() => setSelectedType(t.type)}
                        className="group rounded-xl border border-border bg-card p-5 hover:border-primary hover:shadow-md cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex size-11 items-center justify-center rounded-xl bg-accent text-primary border border-attention-border group-hover:scale-105 transition-transform shrink-0">
                              <Icon className="size-5.5" />
                            </div>
                            <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                              {meta.sla}
                            </span>
                          </div>

                          <div>
                            <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                              {t.label}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                              {meta.subtitle}
                            </p>
                          </div>
                        </div>

                        {/* Approval Route Strip */}
                        <div className="pt-3 border-t border-border/70 space-y-2">
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground flex-wrap">
                            <span className="font-semibold text-foreground">Route:</span>
                            {meta.stepsSummary.map((step, idx) => (
                              <span key={step} className="inline-flex items-center gap-1">
                                {idx > 0 && <span className="text-muted-foreground/60">→</span>}
                                <span className="bg-muted/70 px-1.5 py-0.5 rounded text-[10px] font-medium text-foreground">
                                  {step}
                                </span>
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[11px] font-medium text-muted-foreground">
                              {meta.category}
                            </span>
                            <span className="text-xs font-bold text-primary group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                              Start Request <ArrowRight className="size-3.5" />
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center shadow-2xs">
                  <Search className="size-8 mx-auto text-muted-foreground/60 mb-2" />
                  <h3 className="text-sm font-semibold text-foreground">No matching templates</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Try adjusting your search keywords or select "All Templates".
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  // VIEW 2: DEDICATED REQUEST FORM (When template is selected)
  const currentTemplate = templateByType(selectedType) ?? TEMPLATES[0]!;
  const meta = REQUEST_TYPE_META[selectedType];
  const Icon = meta.icon;
  const steps = ROUTES_BY_TYPE[selectedType] ?? [];
  const exceedsThreshold = meta.hasThreshold && numericAmount > (meta.thresholdAmount ?? 1000);

  return (
    <AppShell
      hideMobileNav
      breadcrumbs={[
        { label: "Workspace", to: "/" },
        { label: "Service Catalog", onClick: () => setSelectedType(null) },
        { label: currentTemplate.label },
      ]}
    >
      <div className="space-y-6">
        {/* Back Link to Catalog */}
        <button
          type="button"
          onClick={() => setSelectedType(null)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-3.5" />
          Back to Service Catalog
        </button>

        {/* Page Header with Template Glyph */}
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-2xs">
          <div className="flex size-12 items-center justify-center rounded-xl bg-accent text-primary border border-attention-border shrink-0 shadow-2xs">
            <Icon className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-muted-foreground uppercase">
                {meta.category}
              </span>
              <span className="rounded-full bg-success-soft text-success text-[10px] font-bold px-2 py-0.2 border border-success-border">
                {meta.sla}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground mt-0.5">
              {currentTemplate.label}
            </h1>
            <p className="text-xs sm:text-[13px] text-muted-foreground mt-0.5">{meta.subtitle}</p>
          </div>
        </div>

        {/* 2-Column Responsive Layout: Form (Left 7-8 cols) + Sticky Route Preview (Right 4-5 cols) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 min-w-0 items-start">
          {/* LEFT: Request Details & Evidence Form */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-5 min-w-0">
            <form id="request-form" onSubmit={handleSubmit} className="space-y-5">
              {/* Form Input Card */}
              <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-2xs space-y-4">
                <div className="border-b border-border pb-3">
                  <h2 className="text-base font-bold text-foreground">Request Details</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Provide complete operational context for reviewing managers.
                  </p>
                </div>

                {/* Title */}
                <div className="space-y-1.5">
                  <Label htmlFor="title" className="text-xs font-semibold text-foreground">
                    {selectedType === "leave" ? "Leave Reason / Summary *" : "Item or Purpose *"}
                  </Label>
                  <Input
                    id="title"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={
                      selectedType === "purchase"
                        ? "e.g. MacBook Pro M3 for UI Designer"
                        : selectedType === "expense"
                          ? "e.g. Client Dinner & Intercity Transport"
                          : selectedType === "leave"
                            ? "e.g. Annual Family Leave"
                            : "e.g. Cloud Service Provider Agreement"
                    }
                    className="text-xs sm:text-sm h-9"
                  />
                </div>

                {/* Amount & Date Row */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="value" className="text-xs font-semibold text-foreground">
                      {selectedType === "leave" ? "Total Days *" : "Total Amount ($ USD) *"}
                    </Label>
                    <div className="relative">
                      {selectedType !== "leave" && (
                        <span className="absolute left-3 top-2.5 text-xs font-bold text-muted-foreground">
                          $
                        </span>
                      )}
                      <Input
                        id="value"
                        required
                        value={valueLabel}
                        onChange={(e) => setValueLabel(e.target.value)}
                        placeholder={
                          selectedType === "leave"
                            ? "e.g. 3 days"
                            : selectedType === "purchase"
                              ? "1850.00"
                              : "85.00"
                        }
                        className={`text-xs sm:text-sm h-9 font-mono ${selectedType !== "leave" ? "pl-7" : ""}`}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="needed" className="text-xs font-semibold text-foreground">
                      {selectedType === "leave" ? "Leave Start Date" : "Needed by Date"}
                    </Label>
                    <Input
                      id="needed"
                      type="date"
                      value={neededBy}
                      onChange={(e) => setNeededBy(e.target.value)}
                      className="text-xs sm:text-sm h-9"
                    />
                  </div>
                </div>

                {/* Vendor / Supplier (if applicable) */}
                {selectedType === "purchase" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="vendor" className="text-xs font-semibold text-foreground">
                      Preferred Supplier / Vendor
                    </Label>
                    <Input
                      id="vendor"
                      value={vendor}
                      onChange={(e) => setVendor(e.target.value)}
                      placeholder="e.g. iOne Cambodia / Official Apple Reseller"
                      className="text-xs sm:text-sm h-9"
                    />
                  </div>
                )}

                {/* Justification Textarea */}
                <div className="space-y-1.5">
                  <Label htmlFor="reason" className="text-xs font-semibold text-foreground">
                    Business Justification & Context *
                  </Label>
                  <Textarea
                    id="reason"
                    required
                    rows={4}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Explain why this request is required for operational execution..."
                    className="text-xs sm:text-sm resize-none"
                  />
                </div>
              </div>

              {/* Quotation & Attachment Dropzone */}
              <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-2xs space-y-4">
                <div className="border-b border-border pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-foreground">
                      Supporting Quotation / Evidence
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      PDF, invoices, or receipts for compliance verification.
                    </p>
                  </div>
                  <span className="text-[11px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    Max 10 MB
                  </span>
                </div>

                {uploadedFile ? (
                  <div className="flex items-center justify-between p-3.5 rounded-lg border border-border bg-muted/20">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                        <FileText className="size-4.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">
                          {uploadedFile.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground">{uploadedFile.size}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setUploadedFile(null)}
                      className="text-xs text-danger hover:text-danger hover:bg-danger-soft h-7 px-2"
                    >
                      <X className="size-3.5 mr-1" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleFileDrop}
                    className={`rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
                      isDragging
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Upload className="size-8 mx-auto text-muted-foreground/60 mb-2" />
                    <p className="text-xs font-semibold text-foreground">
                      Drop vendor quotation PDF here, or{" "}
                      <label className="text-primary hover:underline cursor-pointer">
                        browse files
                        <input
                          type="file"
                          className="sr-only"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setUploadedFile({
                                name: e.target.files[0].name,
                                size: `${(e.target.files[0].size / 1024).toFixed(0)} KB`,
                              });
                            }
                          }}
                        />
                      </label>
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Supports PDF, PNG, JPG up to 10 MB
                    </p>
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* RIGHT: Live Interactive Approval Process Stepper */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-4 lg:sticky lg:top-[84px]">
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
              <div>
                <h2 className="text-base font-bold text-foreground">Approval Route Preview</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Live workflow routing based on your request input.
                </p>
              </div>

              {/* Connected Stepper */}
              <div className="space-y-0 relative pt-1">
                {steps.map((s, idx) => {
                  const owner = personById(s.assigneeId);
                  const isDirectorStep = s.name.includes("Director");
                  const isHighlighted = isDirectorStep && exceedsThreshold;

                  return (
                    <div key={s.name} className="relative flex gap-3 pb-5 last:pb-1">
                      {/* Vertical Connecting Line */}
                      {idx < steps.length - 1 && (
                        <span
                          aria-hidden="true"
                          className="absolute top-8 bottom-0 left-[15px] border-l-2 border-dashed border-border"
                        />
                      )}

                      {/* Number Node */}
                      <span
                        className={`relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                          isHighlighted
                            ? "bg-warning text-white ring-4 ring-warning/20 shadow-xs"
                            : "bg-primary/10 text-primary border border-primary/30"
                        }`}
                      >
                        {idx + 1}
                      </span>

                      {/* Step Details */}
                      <div className="min-w-0 pt-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-foreground">{s.name}</span>
                          {isDirectorStep && (
                            <span
                              className={`rounded text-[10px] font-bold px-1.5 py-0.2 ${
                                exceedsThreshold
                                  ? "bg-warning-soft text-warning border border-warning-border"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              Applies if &gt; $1,000
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                          <User className="size-3 text-muted-foreground" />
                          <span>
                            {owner.name} ({owner.role})
                          </span>
                        </p>
                      </div>
                    </div>
                  );
                })}

                {/* Final Completion Seal */}
                <div className="relative flex gap-3 pt-2">
                  <span className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-success-soft text-success border border-success-border font-bold">
                    ✓
                  </span>
                  <div className="min-w-0 pt-1.5">
                    <span className="text-xs font-bold text-success block">
                      All Sign-offs Complete
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Request archived & dispatches for execution
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic Notification regarding Threshold */}
              {exceedsThreshold && (
                <div className="rounded-lg border border-warning-border bg-warning-soft/40 p-3 text-xs text-warning flex items-start gap-2">
                  <Clock className="size-4 shrink-0 mt-0.5 text-warning" />
                  <p className="text-[11px] leading-relaxed">
                    Amount exceeds $1,000.00. Automatic governance policy assigns Director sign-off
                    checkpoint.
                  </p>
                </div>
              )}

              {/* Full Width Submit Button */}
              <Button
                form="request-form"
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary-hover font-bold text-sm shadow-2xs gap-2"
              >
                {!isSubmitting && <Send className="size-4" />}
                {isSubmitting ? "Submitting Request..." : "Submit Request"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
