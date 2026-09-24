import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileEdit,
  Lock,
  MinusCircle,
  RotateCcw,
  XCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { ApprovalStepStatus, RequestStatus, Urgency } from "@/lib/kneawork/types";

export interface StatusDescriptor {
  label: string;
  icon: typeof Clock;
  className: string;
}

export function formatDueStatus(urgency: Urgency, dueLabel?: string | undefined): string {
  switch (urgency) {
    case "due_today":
      return "Due today";
    case "overdue":
      return dueLabel ? `Overdue (${dueLabel})` : "Overdue";
    case "normal":
    default:
      return dueLabel ?? "Normal timeline";
  }
}

export function getPreciseStatus(
  status: RequestStatus,
  currentStepName?: string | undefined,
  assigneeName?: string | undefined,
  isAssignedToMe?: boolean | undefined,
  showDetail = false,
): StatusDescriptor {
  if (status === "approved") {
    return {
      label: "Completed",
      icon: CheckCircle2,
      className: "bg-success-soft text-success border-success-border",
    };
  }

  if (status === "rejected") {
    return {
      label: "Rejected",
      icon: XCircle,
      className: "bg-danger-soft text-danger border-danger-border",
    };
  }

  if (status === "changes_requested") {
    return {
      label: "Changes requested",
      icon: RotateCcw,
      className: "bg-warning-soft text-warning border-warning-border",
    };
  }

  if (status === "in_review" || status === "submitted") {
    if (isAssignedToMe) {
      return {
        label:
          showDetail && currentStepName
            ? `Needs your action · ${currentStepName}`
            : "Needs your action",
        icon: Clock,
        className:
          "bg-attention-soft text-attention border-attention-border font-semibold whitespace-nowrap",
      };
    }
    if (assigneeName) {
      return {
        label:
          showDetail && currentStepName
            ? `Waiting for ${assigneeName} · ${currentStepName}`
            : `Waiting for ${assigneeName}`,
        icon: Clock,
        className: "bg-secondary text-secondary-foreground border-border whitespace-nowrap",
      };
    }
    if (currentStepName) {
      return {
        label: `Waiting for ${currentStepName}`,
        icon: Clock,
        className: "bg-secondary text-secondary-foreground border-border whitespace-nowrap",
      };
    }
    return {
      label: "Waiting on approval",
      icon: Clock,
      className: "bg-secondary text-secondary-foreground border-border whitespace-nowrap",
    };
  }

  return {
    label: status === "draft" ? "Draft" : status,
    icon: FileEdit,
    className: "bg-muted text-muted-foreground border-border",
  };
}

export function StatusBadge({
  status,
  currentStepName,
  assigneeName,
  isAssignedToMe,
  showDetail = false,
  className,
}: {
  status: RequestStatus;
  currentStepName?: string | undefined;
  assigneeName?: string | undefined;
  isAssignedToMe?: boolean | undefined;
  showDetail?: boolean | undefined;
  className?: string | undefined;
}) {
  const desc = getPreciseStatus(status, currentStepName, assigneeName, isAssignedToMe, showDetail);
  const Icon = desc.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium",
        desc.className,
        className,
      )}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      <span>{desc.label}</span>
    </span>
  );
}

export function StepStatusBadge({ status }: { status: ApprovalStepStatus }) {
  if (status === "approved") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-success-border bg-success-soft px-2 py-0.5 text-xs font-medium text-success">
        <CheckCircle2 className="size-3" />
        Approved
      </span>
    );
  }
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-attention-border bg-attention-soft px-2 py-0.5 text-xs font-semibold text-attention">
        <Clock className="size-3" />
        Current step
      </span>
    );
  }
  if (status === "changes_requested") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-warning-border bg-warning-soft px-2 py-0.5 text-xs font-medium text-warning">
        <RotateCcw className="size-3" />
        Changes requested
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-danger-border bg-danger-soft px-2 py-0.5 text-xs font-medium text-danger">
        <XCircle className="size-3" />
        Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/40 px-2 py-0.5 text-xs font-medium text-muted-foreground">
      <Lock className="size-3" />
      Upcoming
    </span>
  );
}

export function UrgencyBadge({ urgency, dueLabel }: { urgency: Urgency; dueLabel: string }) {
  if (urgency === "overdue") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-danger-border bg-danger-soft px-2 py-0.5 text-xs font-semibold text-danger">
        <AlertTriangle className="size-3" />
        Overdue · {dueLabel}
      </span>
    );
  }
  if (urgency === "due_today") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-warning-border bg-warning-soft px-2 py-0.5 text-xs font-medium text-warning">
        <Clock className="size-3" />
        Due today
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/40 px-2 py-0.5 text-xs font-medium text-muted-foreground">
      <Clock className="size-3" />
      {dueLabel}
    </span>
  );
}
