import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  FileCheck,
  FileText,
  Paperclip,
  Receipt,
  Save,
  Send,
  ShoppingBag,
  Upload,
  X,
} from "lucide-react";
import { useState } from "react";

import { ActionBar } from "@/components/kneawork/action-bar";
import { AppShell } from "@/components/kneawork/app-shell";
import { PageHeader } from "@/components/kneawork/page-header";
import { RoutePreview } from "@/components/kneawork/route-preview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ROUTES_BY_TYPE, TEMPLATES, personById, templateByType } from "@/lib/kneawork/data";
import { submitRequest, useKneaState } from "@/lib/kneawork/store";
import type { RequestType, WorkRequest } from "@/lib/kneawork/types";

const REQUEST_TYPE_META: Record<
  RequestType,
  { icon: typeof ShoppingBag; subtitle: string }
> = {
  purchase: {
    icon: ShoppingBag,
    subtitle: "Buy goods or services · Quotation required > $100",
  },
  expense: {
    icon: Receipt,
    subtitle: "Claim money already spent · Tax receipt required",
  },
  leave: {
    icon: Calendar,
    subtitle: "Request time off · Dates and reason required",
  },
  contract: {
    icon: FileText,
    subtitle: "Approve agreement · Contract PDF required",
  },
};

export const Route = createFileRoute("/requests/new")({
  validateSearch: (search: Record<string, unknown>): { type?: RequestType } => {
    return {
      type: (search["type"] as RequestType) || "purchase",
    };
  },
  component: NewRequestPage,
});

export function NewRequestPage() {
  const { type: initialType = "purchase" } = Route.useSearch();
  const navigate = useNavigate();
  const { currentUserId } = useKneaState();

  const [type, setType] = useState<RequestType>(initialType);
  const [title, setTitle] = useState("");
  const [vendor, setVendor] = useState("");
  const [valueLabel, setValueLabel] = useState("");
  const [reason, setReason] = useState("");
  const [neededBy, setNeededBy] = useState("");

  // Real Upload Simulation State
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>({
    name: "official_quotation_dell_xps.pdf",
    size: "245 KB",
  });
  const [isDragging, setIsDragging] = useState(false);

  // Draft & Submission Confirmation State
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [submittedRecord, setSubmittedRecord] = useState<WorkRequest | null>(null);

  const currentTemplate = templateByType(type) ?? TEMPLATES[0]!;
  const steps = ROUTES_BY_TYPE[type] ?? [];
  const firstRouteStep = steps[0];
  const firstOwner = firstRouteStep ? personById(firstRouteStep.assigneeId) : null;

  const handleSaveDraft = () => {
    setIsDraftSaved(true);
    setTimeout(() => setIsDraftSaved(false), 4000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !valueLabel.trim() || !reason.trim()) return;

    const fullTitle = vendor.trim() ? `${title.trim()} (${vendor.trim()})` : title.trim();

    const req = submitRequest({
      type,
      title: fullTitle,
      valueLabel: type === "leave" ? valueLabel.trim() : `$${valueLabel.replace("$", "").trim()}`,
      reason: reason.trim(),
      neededBy: neededBy.trim(),
      attachmentName: uploadedFile?.name ?? undefined,
    });

    setSubmittedRecord(req);
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

  if (submittedRecord) {
    return (
      <AppShell
        title="Request submitted"
        breadcrumbs={[{ label: "Requests", to: "/requests" }, { label: "Submission confirmation" }]}
      >
        <div className="mx-auto max-w-xl py-8">
          <div className="rounded-lg border border-border bg-card p-6 sm:p-8 text-center shadow-2xs space-y-4">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-success-soft text-success">
              <CheckCircle2 className="size-6" />
            </div>

            <div>
              <span className="font-mono text-xs font-semibold text-muted-foreground">
                {submittedRecord.code}
              </span>
              <h1 className="text-lg font-bold text-foreground mt-1">
                Request successfully submitted
              </h1>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Your request <strong className="text-foreground">{submittedRecord.title}</strong>{" "}
                has entered the governed approval chain. It is currently waiting for{" "}
                <strong className="text-attention">
                  {firstOwner?.name} · {firstRouteStep?.name}
                </strong>
                .
              </p>
            </div>

            <div className="rounded-md border border-border bg-muted/30 p-3.5 text-xs text-foreground text-left space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current step:</span>
                <span className="font-semibold text-foreground">{firstRouteStep?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Assigned reviewer:</span>
                <span className="font-semibold text-foreground">
                  {firstOwner?.name} ({firstOwner?.role})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Target SLA:</span>
                <span className="font-medium text-foreground">Due within 24 hours</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-3">
              <Button asChild variant="outline" size="sm" className="text-xs">
                <Link to="/requests">All requests</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary-hover text-xs font-semibold"
              >
                <Link to="/requests/$requestId" params={{ requestId: submittedRecord.id }}>
                  Track request
                  <ArrowRight className="size-3.5 ml-1.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      breadcrumbs={[
        { label: "Workspace", to: "/" },
        { label: "Requests", to: "/requests" },
        { label: `New ${currentTemplate.label.toLowerCase()}` },
      ]}
    >
      <div className="space-y-6">
        <PageHeader
          eyebrow="Create Request"
          title={`Create ${currentTemplate.label.toLowerCase()}`}
          description="Complete your request details. The preview on the right shows who will review and confirm it."
          status={
            isDraftSaved ? (
              <span className="inline-flex items-center gap-1 rounded bg-success-soft border border-success-border px-2 py-0.5 text-xs font-semibold text-success">
                <CheckCircle2 className="size-3" />
                Draft saved
              </span>
            ) : null
          }
        />

        {/* 1. Purpose-Based Request Type Selector */}
        <div className="rounded-lg border border-border bg-card p-4 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold text-foreground">Select request type</Label>
            <span className="text-[11px] text-muted-foreground">Select by business purpose</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {TEMPLATES.map((t) => {
              const meta = REQUEST_TYPE_META[t.type];
              const Icon = meta.icon;
              const isSelected = type === t.type;
              return (
                <button
                  type="button"
                  key={t.type}
                  onClick={() => setType(t.type)}
                  className={`flex flex-col items-start p-3 text-left rounded-lg border transition-all duration-150 text-left cursor-pointer ${
                    isSelected
                      ? "border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary/30"
                      : "border-border bg-card text-foreground hover:bg-muted/60 hover:border-muted-foreground/30"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1 w-full">
                    <div
                      className={`flex size-6 items-center justify-center rounded-md shrink-0 ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="size-3.5" />
                    </div>
                    <span className="text-sm font-bold text-foreground truncate">
                      {t.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-snug line-clamp-2">
                    {meta.subtitle}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Guided Flow Breadcrumb / Indicator (Details → Evidence → Review route → Submit) */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-lg border border-border overflow-x-auto scrollbar-none whitespace-nowrap">
          <span className="font-semibold text-primary">1. Details</span>
          <span className="text-muted-foreground">→</span>
          <span className="font-semibold text-primary">2. Evidence</span>
          <span className="text-muted-foreground">→</span>
          <span className="font-medium text-foreground">3. Review route</span>
          <span className="text-muted-foreground">→</span>
          <span className="font-medium text-muted-foreground">4. Submit</span>
        </div>

        {/* 2-Column Responsive Layout: Form (Left 7-8 cols) + Route Preview / Summary (Right 4-5 cols) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 min-w-0">
          {/* LEFT: Request Details & Evidence Form */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-5 min-w-0">
            <form id="request-form" onSubmit={handleSubmit} className="space-y-5">
              {/* SECTION: Request Details */}
              <div className="rounded-lg border border-border bg-card p-5 sm:p-6 shadow-2xs space-y-4">
                <div className="border-b border-border pb-3">
                  <h2 className="text-base font-semibold text-foreground">Request details</h2>
                  <p className="text-[13px] text-muted-foreground">
                    Core operational information required for sign-off
                  </p>
                </div>

                {/* Title */}
                <div className="space-y-1.5">
                  <Label htmlFor="title" className="text-sm font-semibold text-foreground">
                    {type === "leave" ? "Leave title / reason *" : "Item or purpose *"}
                  </Label>
                  <Input
                    id="title"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={
                      type === "purchase"
                        ? "e.g. Dell XPS 15 Laptop for Operations"
                        : type === "expense"
                          ? "e.g. Client lunch & intercity transport"
                          : type === "leave"
                            ? "e.g. Annual Family Leave"
                            : "e.g. Office Space Lease Agreement"
                    }
                  />
                </div>

                {/* Vendor / Counterparty (For Purchase & Contract) */}
                {type === "purchase" || type === "contract" ? (
                  <div className="space-y-1.5">
                    <Label htmlFor="vendor" className="text-sm font-semibold text-foreground">
                      Supplier / vendor name
                    </Label>
                    <Input
                      id="vendor"
                      value={vendor}
                      onChange={(e) => setVendor(e.target.value)}
                      placeholder="e.g. Anana Computer Co., Ltd."
                    />
                  </div>
                ) : null}

                {/* Value / Amount & Needed By Date */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="valueLabel" className="text-sm font-semibold text-foreground">
                        {currentTemplate.valueLabel} *
                      </Label>
                      {type !== "leave" ? (
                        <span className="text-xs text-muted-foreground font-medium">
                          USD ($)
                        </span>
                      ) : null}
                    </div>
                    <Input
                      id="valueLabel"
                      required
                      value={valueLabel}
                      onChange={(e) => setValueLabel(e.target.value)}
                      placeholder={currentTemplate.valuePlaceholder}
                    />
                    {/* Policy Hint directly beneath value */}
                    <p className="text-[13px] text-warning bg-warning-soft p-2.5 rounded border border-warning-border leading-relaxed font-medium">
                      {currentTemplate.evidenceRule}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="neededBy" className="text-sm font-semibold text-foreground">
                      {type === "leave" ? "Start date" : "Needed-by date"}
                    </Label>
                    <Input
                      id="neededBy"
                      type="date"
                      value={neededBy}
                      onChange={(e) => setNeededBy(e.target.value)}
                    />
                    <p className="text-[13px] text-muted-foreground">
                      Target review completion within standard turnaround.
                    </p>
                  </div>
                </div>

                {/* Business Justification */}
                <div className="space-y-1.5">
                  <Label htmlFor="reason" className="text-sm font-semibold text-foreground">
                    Business justification & context *
                  </Label>
                  <Textarea
                    id="reason"
                    required
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Provide clear rationale so reviewers have all necessary facts without needing follow-up messages."
                  />
                </div>
              </div>

              {/* SECTION: Supporting Evidence & Attachment */}
              <div className="rounded-lg border border-border bg-card p-5 sm:p-6 shadow-2xs space-y-4">
                <div className="border-b border-border pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-semibold text-foreground">Supporting evidence</h2>
                      <p className="text-[13px] text-muted-foreground">
                        {currentTemplate.requiresAttachment
                          ? "Mandatory documentation"
                          : "Optional supporting documents"}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      PDF, JPG, PNG up to 10MB
                    </span>
                  </div>
                </div>

                {uploadedFile ? (
                  <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3 text-sm gap-2">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <FileCheck className="size-5 text-success shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-foreground truncate">{uploadedFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {uploadedFile.size} · Uploaded and ready
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setUploadedFile(null)}
                      className="size-7 text-muted-foreground hover:text-foreground shrink-0"
                    >
                      <X className="size-4" />
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
                    onClick={() =>
                      setUploadedFile({
                        name: `${type}_evidence_doc.pdf`,
                        size: "280 KB",
                      })
                    }
                    className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
                      isDragging
                        ? "border-primary bg-primary/5"
                        : "border-border bg-muted/20 hover:bg-muted/40 hover:border-muted-foreground/30"
                    }`}
                  >
                    <Upload className="size-6 text-muted-foreground mb-1.5" />
                    <p className="text-sm font-semibold text-foreground">
                      Click to attach {type === "expense" ? "receipt" : "quotation"} or drag file
                      here
                    </p>
                    <p className="text-xs sm:text-[13px] text-muted-foreground mt-0.5">
                      Official tax receipt, supplier quotation, or agreement PDF
                    </p>
                  </div>
                )}
              </div>

            </form>
          </div>

          {/* RIGHT: Compact Read-Only Approval Route Preview (Not an editable form block) */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-4 min-w-0">
            <RoutePreview type={type} collapsible={false} />

            <div className="rounded-lg border border-border bg-card p-4 text-xs text-muted-foreground space-y-2">
              <span className="font-semibold text-foreground block">Workflow integrity</span>
              <article className="prose prose-sm prose-kneawork max-w-none text-xs text-muted-foreground">
                <p className="leading-relaxed">
                  Approval routes are pre-configured by company policy. You do not need to choose
                  reviewers; your request will automatically advance to each designated signer upon
                  approval.
                </p>
              </article>
            </div>
          </div>
        </div>

        {/* Sticky Workflow Action Bar */}
        <ActionBar
          status={
            isDraftSaved
              ? "Draft · Saved just now"
              : "Draft auto-saved locally"
          }
          secondary={
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSaveDraft}
              className="gap-1.5 font-semibold text-xs sm:text-[13px]"
            >
              <Save className="size-3.5" />
              Save draft
            </Button>
          }
          destructive={
            <Button asChild variant="outline" size="sm" className="text-xs sm:text-[13px]">
              <Link to="/requests">Cancel</Link>
            </Button>
          }
          primary={
            <Button
              form="request-form"
              type="submit"
              size="default"
              className="bg-primary text-primary-foreground hover:bg-primary-hover font-semibold gap-1.5 shadow-2xs"
            >
              <Send className="size-3.5" />
              Submit request
            </Button>
          }
        />
      </div>
    </AppShell>
  );
}
