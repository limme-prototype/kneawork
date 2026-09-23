import { AlertCircle, FileCheck, Info, Shield, ShieldAlert } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import type { ExtendedTemplate, TemplateRules } from "@/lib/kneawork/template-types";

interface RuleBuilderProps {
  template: ExtendedTemplate;
  onChange: (rules: TemplateRules) => void;
}

export function RuleBuilder({ template, onChange }: RuleBuilderProps) {
  const rules = template.rules;

  const update = (patch: Partial<TemplateRules>) => {
    onChange({ ...rules, ...patch });
  };

  const toggleFileType = (ext: string) => {
    const current = rules.allowedFileTypes;
    if (current.includes(ext)) {
      if (current.length > 1) {
        update({ allowedFileTypes: current.filter((f) => f !== ext) });
      }
    } else {
      update({ allowedFileTypes: [...current, ext] });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-foreground">Rules & evidence</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Establish clear operational guardrails, mandatory supporting proof, and plain-language
          conditions.
        </p>
      </div>

      <div className="space-y-6">
        {/* Expenditure Limits */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <Shield className="size-4 text-foreground" />
            <h3 className="text-xs font-bold text-foreground">Monetary boundaries</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="rule-min" className="text-xs font-semibold">
                Minimum amount (USD)
              </Label>
              <Input
                id="rule-min"
                type="number"
                min={0}
                value={rules.minAmount ?? 0}
                onChange={(e) => update({ minAmount: parseFloat(e.target.value) || 0 })}
                placeholder="0 (No minimum)"
                className="text-xs bg-card h-9"
              />
              <p className="text-[11px] text-muted-foreground">
                Requests below this cannot be submitted.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rule-max" className="text-xs font-semibold">
                Maximum amount (USD)
              </Label>
              <Input
                id="rule-max"
                type="number"
                min={0}
                value={rules.maxAmount ?? 10000}
                onChange={(e) => update({ maxAmount: parseFloat(e.target.value) || 0 })}
                placeholder="10000"
                className="text-xs bg-card h-9"
              />
              <p className="text-[11px] text-muted-foreground">
                Caps the maximum allowable spend under this policy.
              </p>
            </div>
          </div>
        </div>

        {/* Evidence Requirements */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <FileCheck className="size-4 text-foreground" />
            <h3 className="text-xs font-bold text-foreground">
              Mandatory evidence & documentation
            </h3>
          </div>

          <div className="space-y-3.5">
            {/* Quotation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-border p-3 bg-muted/20">
              <div className="flex items-start gap-2.5">
                <Switch
                  id="req-quotation"
                  checked={rules.requireQuotation}
                  onCheckedChange={(val) => update({ requireQuotation: val })}
                  className="mt-0.5"
                />
                <div>
                  <Label htmlFor="req-quotation" className="text-xs font-semibold cursor-pointer">
                    Require supplier quotation
                  </Label>
                  <p className="text-[11px] text-muted-foreground">
                    Requester must attach an official price quotation or proposal
                  </p>
                </div>
              </div>

              {rules.requireQuotation ? (
                <div className="flex items-center gap-2 text-xs self-end sm:self-center">
                  <span className="text-muted-foreground text-[11px]">When amount is above:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground font-mono">$</span>
                    <Input
                      type="number"
                      min={0}
                      value={rules.quotationThreshold ?? 100}
                      onChange={(e) =>
                        update({ quotationThreshold: parseFloat(e.target.value) || 0 })
                      }
                      className="text-xs bg-card h-8 w-24"
                    />
                    <span className="text-[11px] text-muted-foreground">USD</span>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Receipt */}
            <div className="flex items-center justify-between rounded-lg border border-border p-3 bg-muted/20">
              <div>
                <Label htmlFor="req-receipt" className="text-xs font-semibold cursor-pointer">
                  Require official receipt or tax invoice
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Essential for reimbursement claims and tax accounting validation
                </p>
              </div>
              <Switch
                id="req-receipt"
                checked={rules.requireReceipt}
                onCheckedChange={(val) => update({ requireReceipt: val })}
              />
            </div>

            {/* Manager Note */}
            <div className="flex items-center justify-between rounded-lg border border-border p-3 bg-muted/20">
              <div>
                <Label htmlFor="req-note" className="text-xs font-semibold cursor-pointer">
                  Require department lead endorsement note
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Mandates an explicit rationale commentary before forwarding to finance
                </p>
              </div>
              <Switch
                id="req-note"
                checked={rules.requireManagerNote}
                onCheckedChange={(val) => update({ requireManagerNote: val })}
              />
            </div>

            {/* Legal Assessment */}
            <div className="flex items-center justify-between rounded-lg border border-border p-3 bg-muted/20">
              <div>
                <Label htmlFor="req-legal" className="text-xs font-semibold cursor-pointer">
                  Require legal risk assessment
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Recommended for commercial leases, non-disclosure agreements, and high-liability
                  contracts
                </p>
              </div>
              <Switch
                id="req-legal"
                checked={rules.requireLegalAssessment}
                onCheckedChange={(val) => update({ requireLegalAssessment: val })}
              />
            </div>
          </div>
        </div>

        {/* File Format & Size Limits */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-4">
          <h3 className="text-xs font-bold text-foreground">File upload specifications</h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Allowed file formats</Label>
              <div className="flex items-center gap-3">
                {["PDF", "JPG", "PNG", "DOCX", "XLSX"].map((ext) => {
                  const isChecked = rules.allowedFileTypes.includes(ext);
                  return (
                    <label
                      key={ext}
                      className="flex items-center gap-1.5 text-xs text-foreground cursor-pointer"
                    >
                      <Checkbox checked={isChecked} onCheckedChange={() => toggleFileType(ext)} />
                      <span className="font-mono text-[11px]">{ext}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="max-size" className="text-xs font-semibold">
                Maximum file size
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="max-size"
                  type="number"
                  min={1}
                  max={50}
                  value={rules.maxFileSizeMb}
                  onChange={(e) => update({ maxFileSizeMb: parseInt(e.target.value) || 10 })}
                  className="text-xs bg-card h-9 w-24"
                />
                <span className="text-xs text-muted-foreground">MB per file</span>
              </div>
            </div>
          </div>
        </div>

        {/* Plain-Language Conditional Rule */}
        <div className="rounded-lg border border-attention-border bg-attention-soft/30 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="size-4 text-attention" />
              <h3 className="text-xs font-bold text-foreground">
                Plain-language escalation condition
              </h3>
            </div>
            <Switch
              checked={Boolean(rules.conditionalDirectorAbove)}
              onCheckedChange={(checked) =>
                update({ conditionalDirectorAbove: checked ? 10000 : undefined })
              }
            />
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Automatically routes high-value requests to the Managing Director without requiring
            complex logic formulas.
          </p>

          {rules.conditionalDirectorAbove ? (
            <div className="rounded-md border border-attention-border/60 bg-card p-3 text-xs flex flex-wrap items-center gap-2">
              <span className="font-semibold text-foreground">If total amount is greater than</span>
              <div className="flex items-center gap-1">
                <span className="font-mono text-muted-foreground">$</span>
                <Input
                  type="number"
                  min={100}
                  value={rules.conditionalDirectorAbove}
                  onChange={(e) =>
                    update({ conditionalDirectorAbove: parseFloat(e.target.value) || 10000 })
                  }
                  className="text-xs bg-card h-8 w-28"
                />
                <span className="font-medium text-foreground">USD,</span>
              </div>
              <span className="font-semibold text-attention">
                then automatically append Executive Director Confirmation.
              </span>
            </div>
          ) : null}
        </div>

        {/* Missing Evidence Policy */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <h3 className="text-xs font-bold text-foreground">Exception enforcement behavior</h3>
          <p className="text-xs text-muted-foreground">
            What happens if the employee attempts to submit without mandatory evidence?
          </p>

          <RadioGroup
            value={rules.onMissingEvidence}
            onValueChange={(val: "prevent" | "allow_changes_later") =>
              update({ onMissingEvidence: val })
            }
            className="space-y-2"
          >
            <label className="flex items-start gap-3 rounded-lg border border-border p-3 bg-muted/20 cursor-pointer hover:bg-muted/40">
              <RadioGroupItem value="prevent" id="me-prevent" className="mt-0.5" />
              <div>
                <span className="text-xs font-semibold text-foreground block">
                  Prevent submission (Recommended)
                </span>
                <span className="text-[11px] text-muted-foreground leading-relaxed block mt-0.5">
                  The employee cannot click submit until valid quotation or receipt files are
                  attached. Prevents back-and-forth email/Telegram chasing.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 rounded-lg border border-border p-3 bg-muted/20 cursor-pointer hover:bg-muted/40">
              <RadioGroupItem value="allow_changes_later" id="me-allow" className="mt-0.5" />
              <div>
                <span className="text-xs font-semibold text-foreground block">
                  Allow submission and request changes later
                </span>
                <span className="text-[11px] text-muted-foreground leading-relaxed block mt-0.5">
                  Allows submission with a warning; approvers can pause the request and request
                  additional proof.
                </span>
              </div>
            </label>
          </RadioGroup>
        </div>
      </div>
    </div>
  );
}
