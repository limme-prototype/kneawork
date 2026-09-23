import { AlertTriangle, CheckCircle2, Clock, RotateCcw, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { personById } from "@/lib/kneawork/data";
import { currentStep } from "@/lib/kneawork/store";
import type { WorkRequest } from "@/lib/kneawork/types";

export function CurrentActionBanner({
  request,
  currentUserId,
}: {
  request: WorkRequest;
  currentUserId: string;
}) {
  const step = currentStep(request);
  const requester = personById(request.requesterId);

  if (request.status === "approved") {
    return (
      <Banner
        tone="success"
        icon={CheckCircle2}
        heading="Approved — nothing left to do"
        body="All approval steps are complete. The decision and history are saved on this record."
      />
    );
  }

  if (request.status === "rejected") {
    return (
      <Banner
        tone="danger"
        icon={XCircle}
        heading="Rejected — this request is closed"
        body="The reason is shown in the timeline below. A new request can be submitted if the situation changes."
      />
    );
  }

  if (request.status === "changes_requested") {
    return (
      <Banner
        tone="warning"
        icon={RotateCcw}
        heading={`${requester.name} must fix and resubmit`}
        body="An approver asked for a correction. The approval route continues from the same step once it is resubmitted."
      />
    );
  }

  if (!step) return null;

  const owner = personById(step.assigneeId);
  const isMe = step.assigneeId === currentUserId;
  const next = request.steps[request.steps.indexOf(step) + 1];
  const after = next
    ? `If approved, it goes to ${personById(next.assigneeId).name} for ${next.name}.`
    : "If approved, the request is finally approved and closed.";

  return (
    <Banner
      tone={request.urgency === "overdue" ? "danger" : isMe ? "info" : "neutral"}
      icon={request.urgency === "overdue" ? AlertTriangle : Clock}
      heading={isMe ? `Your decision is needed: ${step.name}` : `Waiting for ${owner.name}`}
      body={`${isMe ? "You are" : `${owner.name} is`} the owner of ${step.name}. ${step.dueLabel}. ${after}`}
    />
  );
}

function Banner({
  tone,
  icon: Icon,
  heading,
  body,
}: {
  tone: "info" | "success" | "warning" | "danger" | "neutral";
  icon: typeof Clock;
  heading: string;
  body: string;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border p-4",
        tone === "info" && "border-info/25 bg-info-soft",
        tone === "success" && "border-success/25 bg-success-soft",
        tone === "warning" && "border-warning/25 bg-warning-soft",
        tone === "danger" && "border-danger/25 bg-danger-soft",
        tone === "neutral" && "border-border bg-muted",
      )}
    >
      <div className="flex gap-3">
        <Icon
          className={cn(
            "mt-0.5 size-5 shrink-0",
            tone === "info" && "text-info",
            tone === "success" && "text-success",
            tone === "warning" && "text-warning",
            tone === "danger" && "text-danger",
            tone === "neutral" && "text-muted-foreground",
          )}
          aria-hidden="true"
        />
        <div>
          <p className="font-semibold">{heading}</p>
          <p className="mt-1 text-sm text-foreground/80">{body}</p>
        </div>
      </div>
    </section>
  );
}
