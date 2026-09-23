import { Clock, Eye, FileText, Info, ShieldCheck, UploadCloud, X } from "lucide-react";
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
}

export function TemplatePreviewDialog({
  open,
  onOpenChange,
  template,
}: TemplatePreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="border-b border-border pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="rounded bg-attention-soft border border-attention-border px-2 py-0.5 text-xs font-semibold text-attention flex items-center gap-1">
                <Eye className="size-3.5" />
                Live employee preview
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
        </DialogHeader>

        {/* Informational Guidance Callout */}
        <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground flex items-start gap-2">
          <Info className="size-4 text-foreground shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            This preview renders the live submission experience employees will see when submitting
            under this workflow. Typical turnaround:{" "}
            <strong className="text-foreground">{template.typicalCompletionTime}</strong>.
          </div>
        </div>

        {/* Dynamic Simulated Form */}
        <div className="space-y-4 py-2">
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

        <DialogFooter className="border-t border-border pt-3">
          <Button size="sm" onClick={() => onOpenChange(false)} className="font-semibold">
            Close preview
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
