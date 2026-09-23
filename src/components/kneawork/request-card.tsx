import { Link } from "@tanstack/react-router";
import { ArrowRight, Clock } from "lucide-react";

import { StatusBadge, UrgencyBadge } from "./status-badge";
import { personById } from "@/lib/kneawork/data";
import { currentStep } from "@/lib/kneawork/store";
import type { WorkRequest } from "@/lib/kneawork/types";

export function RequestCard({
  request,
  currentUserId,
}: {
  request: WorkRequest;
  currentUserId?: string;
}) {
  const step = currentStep(request);
  const owner = step ? personById(step.assigneeId) : null;
  const requester = personById(request.requesterId);
  const isMe =
    currentUserId && step && step.assigneeId === currentUserId && request.status === "in_review";

  return (
    <Link
      to="/requests/$requestId"
      params={{ requestId: request.id }}
      className={`block rounded-lg border bg-card p-3.5 shadow-2xs transition-colors hover:border-border ${
        isMe
          ? "border-attention-border bg-attention-soft/40 ring-1 ring-attention/20"
          : "border-border"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {/* Header metadata */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono font-medium">{request.code}</span>
            <span>·</span>
            <span className="capitalize">{request.type}</span>
            <span>·</span>
            <span>{request.valueLabel}</span>
          </div>

          {/* Title */}
          <h3 className="mt-1 text-sm font-semibold text-foreground leading-tight">
            {request.title}
          </h3>

          {/* Status badge with precise ownership */}
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <StatusBadge
              status={request.status}
              currentStepName={step?.name}
              assigneeName={owner?.name}
              isAssignedToMe={Boolean(isMe)}
            />
            {step ? <UrgencyBadge urgency={request.urgency} dueLabel={step.dueLabel} /> : null}
          </div>

          {/* Footer Requester & Date */}
          <p className="mt-2 text-xs text-muted-foreground">
            Submitted by {requester.name} · {request.updatedLabel}
          </p>
        </div>

        <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
      </div>
    </Link>
  );
}
