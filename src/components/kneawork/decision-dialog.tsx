import { useState } from "react";
import { CheckCircle2, RotateCcw, XCircle, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { personById } from "@/lib/kneawork/data";
import { currentStep } from "@/lib/kneawork/store";
import type { Decision, WorkRequest } from "@/lib/kneawork/types";

const COPY: Record<Decision, { title: string; cta: string; icon: typeof CheckCircle2 }> = {
  approve: { title: "Approve this request?", cta: "Confirm approval", icon: CheckCircle2 },
  changes: { title: "Request changes", cta: "Send back to requester", icon: RotateCcw },
  reject: { title: "Reject request?", cta: "Reject request", icon: XCircle },
};

const CHANGE_REASONS = [
  "Missing quotation",
  "Incorrect amount",
  "Clarification needed on purpose",
  "Need alternative vendor option",
];

export function DecisionDialog({
  request,
  decision,
  onClose,
  onConfirm,
}: {
  request: WorkRequest;
  decision: Decision | null;
  onClose: () => void;
  onConfirm: (decision: Decision, note: string) => void;
}) {
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  if (!decision) return null;

  const step = currentStep(request);
  const index = step ? request.steps.indexOf(step) : -1;
  const next = index >= 0 ? request.steps[index + 1] : undefined;
  const requester = personById(request.requesterId);
  const copy = COPY[decision];
  const noteRequired = decision !== "approve";

  const consequence =
    decision === "approve"
      ? next
        ? `This request will be sent to ${personById(next.assigneeId).name} for ${next.name}.`
        : "The request will be fully approved, recorded, and closed."
      : decision === "changes"
        ? `The request will return to ${requester.name} for correction. Once re-submitted, it will return to your queue.`
        : `This ends the approval process immediately and notifies ${requester.name}. Remaining steps will be cancelled. This action cannot be undone.`;

  const handleChipClick = (reason: string) => {
    setNote((prev) => (prev ? `${prev}; ${reason}` : reason));
    if (error) setError("");
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) {
          setNote("");
          setError("");
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <copy.icon
              className={`size-5 ${
                decision === "approve"
                  ? "text-success"
                  : decision === "changes"
                    ? "text-warning"
                    : "text-danger"
              }`}
              aria-hidden="true"
            />
            {copy.title}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {request.code} · <strong className="text-foreground">{request.title}</strong> ·{" "}
            {request.valueLabel}
          </DialogDescription>
        </DialogHeader>

        {/* Action Consequence Banner */}
        <div
          className={`rounded-md p-3 text-xs leading-relaxed border ${
            decision === "approve"
              ? "border-success-border bg-success-soft text-success"
              : decision === "changes"
                ? "border-warning-border bg-warning-soft text-warning"
                : "border-danger-border bg-danger-soft text-danger"
          }`}
        >
          <div className="font-semibold mb-0.5">
            {decision === "approve"
              ? "After approval:"
              : decision === "changes"
                ? "Next step:"
                : "Finality notice:"}
          </div>
          <p>{consequence}</p>
        </div>

        {/* Change Reasons Quick Chips */}
        {decision === "changes" ? (
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-muted-foreground">Quick reasons:</span>
            <div className="flex flex-wrap gap-1.5">
              {CHANGE_REASONS.map((r) => (
                <Button
                  key={r}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleChipClick(r)}
                  className="h-6 rounded-md px-2 py-0 text-xs font-normal bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border-border"
                >
                  + {r}
                </Button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="decision-note" className="text-xs font-semibold text-foreground">
            {noteRequired ? "Reason (required)" : "Comment (optional)"}
          </Label>
          <Textarea
            id="decision-note"
            value={note}
            onChange={(e) => {
              setNote(e.target.value);
              if (error) setError("");
            }}
            placeholder={
              decision === "changes"
                ? "Tell the requester exactly what needs to be fixed before re-submitting..."
                : decision === "reject"
                  ? "Explain why this expenditure or request is declined..."
                  : "Add an optional remark for the permanent audit trail..."
            }
            rows={3}
            className="text-xs"
          />
          {error ? (
            <p role="alert" className="text-xs font-medium text-danger flex items-center gap-1">
              <AlertCircle className="size-3.5" />
              {error}
            </p>
          ) : null}
        </div>

        <DialogFooter className="gap-2 sm:justify-end">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Cancel
          </Button>
          <Button
            size="sm"
            variant={decision === "reject" ? "destructive" : "default"}
            className={`text-xs font-semibold ${
              decision === "approve" ? "bg-success hover:bg-success/90 text-white" : ""
            }`}
            onClick={() => {
              if (noteRequired && note.trim().length < 3) {
                setError(
                  decision === "changes"
                    ? "Please provide a reason so the requester knows what to correct."
                    : "A rejection reason is required for compliance audit.",
                );
                return;
              }
              onConfirm(decision, note.trim());
              setNote("");
            }}
          >
            {copy.cta}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
