import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Info,
  PlayCircle,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  UploadCloud,
  XCircle,
} from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ExtendedTemplate } from "@/lib/kneawork/template-types";

interface TemplatePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: ExtendedTemplate;
  initialTab?: "form" | "simulator";
}

export function TemplatePreviewDialog({
  open,
  onOpenChange,
  template,
  initialTab = "form",
}: TemplatePreviewDialogProps) {
  const [activeTab, setActiveTab] = useState<"form" | "simulator">(initialTab);

  // Simulator State
  const [simAmount, setSimAmount] = useState<number>(850);
  const [simDepartment, setSimDepartment] = useState<string>("Operations");
  const [simHasQuotation, setSimHasQuotation] = useState<boolean>(true);
  const [simHasReceipt, setSimHasReceipt] = useState<boolean>(true);

  // Thresholds from template rules
  const quotationThreshold = template.rules.quotationThreshold ?? 100;
  const directorThreshold = template.rules.conditionalDirectorAbove ?? 1000;
  const maxAmount = template.rules.maxAmount;

  // Simulator Evaluations
  const quotationRequired = template.rules.requireQuotation && simAmount > quotationThreshold;
  const quotationMissing = quotationRequired && !simHasQuotation;

  const ceilingExceeded = maxAmount ? simAmount > maxAmount : false;

  // Determine active steps dynamically
  const evaluatedSteps = template.routeSteps.map((step) => {
    const isDirectorStep =
      step.name.toLowerCase().includes("director") ||
      step.roleName.toLowerCase().includes("director");

    if (isDirectorStep) {
      const isTriggered = simAmount >= directorThreshold;
      return {
        ...step,
        triggered: isTriggered,
        reason: isTriggered
          ? `Triggered — amount ($${simAmount.toLocaleString()}) reaches threshold (≥ $${directorThreshold.toLocaleString()})`
          : `Bypassed — not required for spend under $${directorThreshold.toLocaleString()}`,
      };
    }

    return {
      ...step,
      triggered: true,
      reason: "Standard policy step",
    };
  });

  const activeSteps = evaluatedSteps.filter((s) => s.triggered);
  const totalSlaDays = activeSteps.reduce((sum, s) => sum + s.dueDays, 0);

  const hasPolicyViolation = quotationMissing || ceilingExceeded;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="border-b border-border pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="rounded bg-attention-soft border border-attention-border px-2 py-0.5 text-xs font-semibold text-attention flex items-center gap-1">
                {activeTab === "form" ? (
                  <>
                    <Eye className="size-3.5" />
                    Live employee preview
                  </>
                ) : (
                  <>
                    <SlidersHorizontal className="size-3.5" />
                    Workflow route simulator
                  </>
                )}
              </span>
              <span className="text-xs text-muted-foreground font-mono">v{template.version}</span>
            </div>
          </div>
          <DialogTitle className="text-base sm:text-lg font-bold text-foreground mt-1">
            {template.label || "Untitled Template"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {template.description || "No description provided"}
          </DialogDescription>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-2 pt-2">
            <Button
              type="button"
              size="sm"
              variant={activeTab === "form" ? "default" : "outline"}
              onClick={() => setActiveTab("form")}
              className="text-xs h-7 gap-1"
            >
              <Eye className="size-3" />
              Employee form preview
            </Button>
            <Button
              type="button"
              size="sm"
              variant={activeTab === "simulator" ? "default" : "outline"}
              onClick={() => setActiveTab("simulator")}
              className="text-xs h-7 gap-1"
            >
              <SlidersHorizontal className="size-3" />
              Test route simulation
            </Button>
          </div>
        </DialogHeader>

        {activeTab === "form" ? (
          /* FORM PREVIEW TAB */
          <div className="space-y-4 py-2">
            {/* Informational Guidance Callout */}
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground flex items-start gap-2">
              <Info className="size-4 text-foreground shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                This preview renders the live submission experience employees will see when
                submitting under this workflow. Typical turnaround:{" "}
                <strong className="text-foreground">{template.typicalCompletionTime}</strong>.
              </div>
            </div>

            {/* Dynamic Simulated Form */}
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 border-b border-border pb-1.5">
              <FileText className="size-4 text-foreground" />
              Request details
            </h3>

            <div className="space-y-3.5">
              {template.fields.map((f) => (
                <div key={f.id} className="space-y-1.5">
                  <Label className="text-sm font-semibold text-foreground flex items-center gap-1">
                    {f.label}
                    {f.required ? <span className="text-danger">*</span> : null}
                  </Label>
                  {f.type === "textarea" ? (
                    <Textarea
                      disabled
                      placeholder={f.helpText || "Enter details..."}
                      className="bg-muted/40 min-h-[64px] resize-none"
                    />
                  ) : f.type === "file" ? (
                    <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4 text-center">
                      <UploadCloud className="size-5 text-muted-foreground mx-auto mb-1" />
                      <span className="text-sm font-medium text-foreground block">
                        Click to browse or drop {template.rules.allowedFileTypes.join(", ")}
                      </span>
                      <span className="text-xs text-muted-foreground block mt-0.5">
                        Maximum file size {template.rules.maxFileSizeMb} MB
                      </span>
                    </div>
                  ) : (
                    <Input
                      disabled
                      placeholder={f.helpText || "Enter value..."}
                      className="bg-muted/40"
                    />
                  )}
                  {f.helpText && f.type !== "file" ? (
                    <p className="text-xs text-muted-foreground">{f.helpText}</p>
                  ) : null}
                </div>
              ))}
            </div>

            {/* Sequential Route Preview */}
            <div className="space-y-2 border-t border-border pt-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-foreground" />
                Who reviews this request? ({template.routeSteps.length} approval steps)
              </h3>
              <div className="divide-y divide-border rounded-lg border border-border bg-card">
                {template.routeSteps.map((step, idx) => (
                  <div key={step.id} className="flex items-center justify-between p-3 text-sm">
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-bold text-foreground">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="font-semibold text-foreground">{step.name}</span>
                        <span className="block text-[13px] text-muted-foreground">
                          {step.roleName} · {step.assigneeName ?? "Role member"}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs sm:text-[13px] text-muted-foreground flex items-center gap-1">
                      <Clock className="size-3.5" />~{step.dueDays}d
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* WORKFLOW ROUTE SIMULATOR TAB */
          <div className="space-y-5 py-2">
            {/* Guidance banner */}
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3.5 text-xs text-foreground flex items-start gap-2.5">
              <SlidersHorizontal className="size-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-foreground">Test Before Publish Simulation</p>
                <p className="text-muted-foreground mt-0.5 leading-relaxed">
                  Test draft conditions before activating. Change request values to verify which
                  approval route triggers and ensure company policies prevent unverified spend.
                </p>
              </div>
            </div>

            {/* Simulator Inputs */}
            <div className="rounded-lg border border-border bg-card p-4 space-y-4 shadow-2xs">
              <h4 className="text-sm font-bold text-foreground">1. Test Parameters</h4>

              {/* Amount Input & Preset Scenarios */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="sim-amount" className="text-xs font-semibold text-foreground">
                    Test Request Amount (USD)
                  </Label>
                  <span className="text-[11px] text-muted-foreground">Preset scenarios</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-muted-foreground">$</span>
                  <Input
                    id="sim-amount"
                    type="number"
                    min={0}
                    value={simAmount}
                    onChange={(e) => setSimAmount(Number(e.target.value) || 0)}
                    className="h-9 font-semibold text-sm max-w-[200px]"
                  />
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSimAmount(85)}
                      className={`text-xs h-8 px-2.5 ${simAmount === 85 ? "border-primary bg-primary/10 text-primary font-bold" : ""}`}
                    >
                      $85 (Small)
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSimAmount(850)}
                      className={`text-xs h-8 px-2.5 ${simAmount === 850 ? "border-primary bg-primary/10 text-primary font-bold" : ""}`}
                    >
                      $850 (Standard)
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSimAmount(12000)}
                      className={`text-xs h-8 px-2.5 ${simAmount === 12000 ? "border-primary bg-primary/10 text-primary font-bold" : ""}`}
                    >
                      $12,000 (Major)
                    </Button>
                  </div>
                </div>
              </div>

              {/* Evidence Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-border">
                <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={simHasQuotation}
                    onChange={(e) => setSimHasQuotation(e.target.checked)}
                    className="size-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span>Supplier quotation attached</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={simHasReceipt}
                    onChange={(e) => setSimHasReceipt(e.target.checked)}
                    className="size-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span>Fiscal tax receipt attached</span>
                </label>
              </div>
            </div>

            {/* Simulation Evaluation Result Banner */}
            <div
              className={`rounded-lg border p-4 shadow-2xs space-y-2 ${
                hasPolicyViolation
                  ? "border-warning-border bg-warning-soft/30"
                  : "border-success-border bg-success-soft/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {hasPolicyViolation ? (
                    <AlertTriangle className="size-4 text-warning" />
                  ) : (
                    <CheckCircle2 className="size-4 text-success" />
                  )}
                  <h4 className="text-sm font-bold text-foreground">
                    {hasPolicyViolation
                      ? "Policy Flagged · Action Required"
                      : "Route Validated · Ready"}
                  </h4>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded border bg-card text-foreground">
                  Estimated SLA: ~{totalSlaDays} days
                </span>
              </div>

              <div className="text-xs text-foreground space-y-1">
                {ceilingExceeded && (
                  <p className="text-danger font-semibold">
                    • Maximum Spend Violation: Amount (${simAmount.toLocaleString()}) exceeds the
                    template spend ceiling of ${maxAmount?.toLocaleString()}.
                  </p>
                )}
                {quotationMissing && (
                  <p className="text-warning font-semibold">
                    • Missing Evidence: Company policy requires an official quotation for spend
                    exceeding ${quotationThreshold}. Under strict enforcement, submission is
                    prevented.
                  </p>
                )}
                {!hasPolicyViolation && (
                  <p className="text-muted-foreground">
                    All required policy conditions are satisfied. Request will execute sequentially
                    across {activeSteps.length} designated approval checkpoint(s).
                  </p>
                )}
              </div>
            </div>

            {/* Dynamic Step-by-Step Chain */}
            <div className="space-y-2 border-t border-border pt-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-foreground" />
                  Simulated Route Execution ({activeSteps.length} of {template.routeSteps.length}{" "}
                  steps active)
                </h4>
                <span className="text-xs text-muted-foreground">Sequential order</span>
              </div>

              <div className="divide-y divide-border rounded-lg border border-border bg-card overflow-hidden">
                {evaluatedSteps.map((step, idx) => (
                  <div
                    key={step.id}
                    className={`p-3 text-sm flex items-start justify-between gap-3 ${
                      step.triggered ? "bg-card" : "bg-muted/30 opacity-60"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span
                        className={`flex size-6 items-center justify-center rounded-full text-xs font-bold shrink-0 mt-0.5 ${
                          step.triggered
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-semibold ${step.triggered ? "text-foreground" : "text-muted-foreground line-through"}`}
                          >
                            {step.name}
                          </span>
                          <span
                            className={`rounded px-1.5 py-0.2 text-[10px] font-bold border ${
                              step.triggered
                                ? "bg-success-soft border-success-border text-success"
                                : "bg-muted border-border text-muted-foreground"
                            }`}
                          >
                            {step.triggered ? "ACTIVE" : "BYPASSED"}
                          </span>
                        </div>
                        <span className="block text-xs text-muted-foreground mt-0.5">
                          {step.roleName} · {step.assigneeName ?? "Designated role owner"}
                        </span>
                        <p className="text-[11px] text-muted-foreground/90 mt-1 font-mono">
                          {step.reason}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                        <Clock className="size-3" />
                        {step.triggered ? `~${step.dueDays}d` : "—"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="border-t border-border pt-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {activeTab === "form" ? "Employee submission view" : "Admin route simulation engine"}
          </span>
          <Button size="sm" onClick={() => onOpenChange(false)} className="font-semibold">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
