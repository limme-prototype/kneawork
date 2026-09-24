import { useState } from "react";
import { CheckCircle2, RotateCcw, XCircle, AlertCircle, ArrowRight } from "lucide-react";

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

const COPY: Record<
  Decision,
  {
    title: string;
    description: string;
    cta: string;
    icon: typeof CheckCircle2;
  }
> = {
  approve: {
    title: "Approve request",
    description: "Confirm sign-off and advance this workflow.",
    cta: "Approve request",
    icon: CheckCircle2,
  },
  changes: {
    title: "Request changes",
    description: "Return this request to the requester for correction.",
    cta: "Request changes",
    icon: RotateCcw,
  },
  reject: {
    title: "Reject request",
    description: "Decline this request and end the approval process.",
    cta: "Reject request",
    icon: XCircle,
  },
};

const CHANGE_REASONS = [
  "Missing quotation",
  "Clarification on purpose",
  "Incorrect amount",
  "Alternative vendor needed",
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
      <DialogContent className="sm:max-w-md p-5 sm:p-6">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <copy.icon
              className={`size-5 shrink-0 ${
                decision === "approve"
                  ? "text-success"
                  : decision === "changes"
                    ? "text-warning"
                    : "text-danger"
              }`}
              aria-hidden="true"
            />
            <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
              {copy.title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs sm:text-[13px] text-muted-foreground">
            {request.title} <span className="font-mono">({request.code})</span> · {request.valueLabel}
          </DialogDescription>
        </DialogHeader>

        {/* Workflow Impact Summary Card */}
        <div className="rounded-lg border border-border/80 bg-muted/30 p-3.5 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Requester</span>
            <span className="font-medium text-foreground">
              {requester.name} ({request.department})
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">
              {decision === "approve"
                ? "Next step"
                : decision === "changes"
                  ? "Action"
                  : "Outcome"}
            </span>
            <span className="font-semibold text-foreground text-right max-w-[220px] truncate">
              {decision === "approve"
                ? next
                  ? `${personById(next.assigneeId).name} (${next.name})`
                  : "Final sign-off · Request completed"
                : decision === "changes"
                  ? `Returned to ${requester.name} for revision`
                  : "Declined · Workflow ends immediately"}
            </span>
          </div>
        </div>

        {/* Quick Reasons for Request Changes */}
        {decision === "changes" ? (
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">
              Common reasons:
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {CHANGE_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleChipClick(r)}
                  className="rounded-md border border-border bg-card hover:bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {/* Reason / Comment Field */}
        <div className="space-y-1.5">
          <Label htmlFor="decision-note" className="text-xs font-semibold text-foreground">
            {decision === "changes"
              ? "Instructions for requester (required)"
              : decision === "reject"
                ? "Reason for rejection (required)"
                : "Comment (optional)"}
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
                ? "Specify what the requester needs to update before resubmitting..."
                : decision === "reject"
                  ? "Explain why this request is declined for compliance audit..."
                  : "Add an optional remark for the permanent audit trail..."
            }
            rows={3}
            className="bg-card text-xs sm:text-sm resize-none"
          />
          {error ? (
            <p role="alert" className="text-xs font-medium text-danger flex items-center gap-1">
              <AlertCircle className="size-3.5 shrink-0" />
              {error}
            </p>
          ) : null}
        </div>

        <DialogFooter className="gap-2 sm:justify-end pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs h-9 sm:h-8"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className={`text-xs font-semibold gap-1.5 h-9 sm:h-8 text-white ${
              decision === "approve"
                ? "bg-success hover:bg-success/90"
                : decision === "changes"
                  ? "bg-warning hover:bg-warning/90"
                  : "bg-danger hover:bg-danger/90"
            }`}
            onClick={() => {
              if (noteRequired && note.trim().length < 3) {
                setError(
                  decision === "changes"
                    ? "Please enter instructions for the requester."
                    : "Please provide a reason for declining this request.",
                );
                return;
              }
              onConfirm(decision, note.trim());
              setNote("");
            }}
          >
            <copy.icon className="size-3.5 shrink-0" />
            {copy.cta}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
