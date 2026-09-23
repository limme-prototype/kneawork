import { CheckCircle2, Clock, RotateCcw, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { personById } from "@/lib/kneawork/data";
import type { WorkRequest } from "@/lib/kneawork/types";

export function ApprovalTimeline({
  request,
  currentUserId,
}: {
  request: WorkRequest;
  currentUserId?: string;
}) {
  const requester = personById(request.requesterId);

  return (
    <div className="relative pl-7 before:absolute before:left-3 before:top-2 before:bottom-3 before:w-0.5 before:bg-border">
      {/* 1. Submission Step */}
      <div className="relative pb-6">
        <span className="absolute -left-7 top-0.5 flex size-5.5 items-center justify-center rounded-full bg-success text-white ring-4 ring-card shadow-2xs">
          <CheckCircle2 className="size-3.5" />
        </span>
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 text-xs">
          <div>
            <span className="font-semibold text-foreground">Submitted</span>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {requester.name} · <span>{requester.role}</span>
            </p>
          </div>
          <span className="text-[11px] text-muted-foreground sm:text-right">
            {request.submittedLabel}
          </span>
        </div>
      </div>

      {/* 2. Sequential Approval Steps */}
      {request.steps.map((step, idx) => {
        const person = personById(step.assigneeId);
        const isDone = step.status === "approved";
        const isCurrent = step.status === "pending";
        const isRejected = step.status === "rejected";
        const isChanges = step.status === "changes_requested";
        const isMe = Boolean(currentUserId && step.assigneeId === currentUserId && isCurrent);

        return (
          <div key={step.id} className="relative pb-5 last:pb-0">
            {/* Timeline Dot Node - Always consistently positioned on the vertical track */}
            <span
              className={cn(
                "absolute -left-7 top-1 flex size-5.5 items-center justify-center rounded-full text-white ring-4 ring-card shadow-2xs z-10",
                isDone && "bg-success ring-success-soft",
                isCurrent &&
                  (isMe ? "bg-attention ring-attention-soft" : "bg-attention ring-attention-soft"),
                isRejected && "bg-danger ring-danger-soft",
                isChanges && "bg-warning ring-warning-soft",
                !isDone &&
                  !isCurrent &&
                  !isRejected &&
                  !isChanges &&
                  "bg-muted text-muted-foreground ring-muted/30",
              )}
            >
              {isDone ? (
                <CheckCircle2 className="size-3.5" />
              ) : isCurrent ? (
                <Clock className="size-3.5" />
              ) : isRejected ? (
                <XCircle className="size-3.5" />
              ) : isChanges ? (
                <RotateCcw className="size-3.5" />
              ) : (
                <span className="text-[10px] font-bold text-muted-foreground">{idx + 1}</span>
              )}
            </span>

            {/* Step Body */}
            <div
              className={cn(
                "rounded-lg text-xs transition-colors",
                isCurrent
                  ? isMe
                    ? "border border-attention-border bg-attention-soft/70 p-3 shadow-2xs"
                    : "border border-border bg-muted/40 p-3"
                  : "p-1",
              )}
            >
              {/* Top row: Step Name & Single Distinct Status Badge */}
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-foreground text-xs">{step.name}</span>

                {/* Single, non-duplicated status indicator */}
                <div>
                  {isDone ? (
                    <span className="inline-flex items-center gap-1 rounded bg-success-soft border border-success-border px-2 py-0.5 text-[11px] font-semibold text-success">
                      <CheckCircle2 className="size-3" />
                      Approved
                    </span>
                  ) : isCurrent ? (
                    isMe ? (
                      <span className="inline-flex items-center gap-1 rounded bg-attention px-2 py-0.5 text-[11px] font-semibold text-attention-foreground shadow-2xs">
                        <Clock className="size-3" />
                        You must act
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-attention-soft border border-attention-border px-2 py-0.5 text-[11px] font-semibold text-attention">
                        <Clock className="size-3" />
                        Current step
                      </span>
                    )
                  ) : isChanges ? (
                    <span className="inline-flex items-center gap-1 rounded bg-warning-soft border border-warning-border px-2 py-0.5 text-[11px] font-semibold text-warning">
                      <RotateCcw className="size-3" />
                      Changes requested
                    </span>
                  ) : isRejected ? (
                    <span className="inline-flex items-center gap-1 rounded bg-danger-soft border border-danger-border px-2 py-0.5 text-[11px] font-semibold text-danger">
                      <XCircle className="size-3" />
                      Rejected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded bg-muted border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      Upcoming
                    </span>
                  )}
                </div>
              </div>

              {/* Subtitle row: Assignee & Timeline */}
              <div className="mt-1 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                <p>
                  <span className="font-semibold text-foreground">{person.name}</span>
                  <span className="text-muted-foreground"> · {person.role}</span>
                </p>
                <span
                  className={cn(
                    isCurrent && isMe ? "font-semibold text-attention" : "text-muted-foreground",
                  )}
                >
                  {step.decidedLabel ?? (isCurrent && isMe ? "Due today" : step.dueLabel)}
                </span>
              </div>

              {/* Note / Comment */}
              {step.note ? (
                <div className="mt-2.5 rounded-md border border-border bg-card p-2.5 text-foreground shadow-2xs">
                  <span className="font-semibold text-muted-foreground text-[10px] block">
                    Review note:
                  </span>
                  <p className="mt-0.5 text-xs text-foreground italic">"{step.note}"</p>
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
