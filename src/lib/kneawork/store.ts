import { useSyncExternalStore } from "react";

import { ROUTES_BY_TYPE, ROUTE_STEPS, SEED_REQUESTS } from "./data";
import type { Decision, RequestType, WorkRequest } from "./types";

interface State {
  requests: WorkRequest[];
  currentUserId: string;
}

let state: State = {
  requests: SEED_REQUESTS.map((r) => ({
    ...r,
    steps: r.steps.map((s) => ({ ...s })),
    attachments: r.attachments.map((a) => ({ ...a })),
    audit: r.audit.map((a) => ({ ...a })),
  })),
  currentUserId: "u_manager",
};

const listeners = new Set<() => void>();

function emit(next: State) {
  state = next;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

export function useKneaState(): State {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function setCurrentUser(userId: string) {
  emit({ ...state, currentUserId: userId });
}

function nextId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function nowLabel() {
  return "Just now";
}

export function currentStep(request: WorkRequest) {
  return request.steps.find((s) => s.status === "pending");
}

export function needsActionFrom(requests: WorkRequest[], userId: string) {
  return requests.filter((r) => {
    const step = currentStep(r);
    return !!step && step.assigneeId === userId && r.status === "in_review";
  });
}

export function recentlyCompletedBy(requests: WorkRequest[], userId: string) {
  return requests.filter((r) => {
    return (
      r.steps.some(
        (s) =>
          s.assigneeId === userId &&
          (s.status === "approved" || s.status === "changes_requested" || s.status === "rejected"),
      ) ||
      r.audit.some(
        (a) =>
          a.actorId === userId &&
          (a.action.includes("Approved") ||
            a.action.includes("Rejected") ||
            a.action.includes("Requested changes")),
      )
    );
  });
}

export function submitRequest(input: {
  type: RequestType;
  title: string;
  valueLabel: string;
  reason: string;
  neededBy: string;
  attachmentName?: string | undefined;
}) {
  const id = nextId("r");
  const prefix =
    input.type === "purchase"
      ? "PR"
      : input.type === "expense"
        ? "EX"
        : input.type === "leave"
          ? "LV"
          : "CT";
  const typeSteps = ROUTES_BY_TYPE[input.type] ?? ROUTE_STEPS;
  const request: WorkRequest = {
    id,
    code: `${prefix}-${2100 + state.requests.length}`,
    type: input.type,
    title: input.title,
    requesterId: state.currentUserId,
    department: "Operations",
    valueLabel: input.valueLabel,
    reason: input.reason,
    status: "in_review",
    urgency: "normal",
    submittedLabel: "Submitted just now",
    updatedLabel: "Updated just now",
    steps: typeSteps.map((s, i) => ({
      id: `${id}s${i}`,
      name: s.name,
      assigneeId: s.assigneeId,
      status: i === 0 ? "pending" : "locked",
      dueLabel: input.neededBy ? `Needed by ${input.neededBy}` : `Due in ${i + 1} days`,
    })),
    attachments: input.attachmentName
      ? [{ id: nextId("a"), filename: input.attachmentName, size: "320 KB" }]
      : [],
    audit: [
      {
        id: nextId("e"),
        actorId: state.currentUserId,
        action: "Submitted request",
        timestampLabel: nowLabel(),
        channel: "Mobile",
      },
    ],
  };
  emit({ ...state, requests: [request, ...state.requests] });
  return request;
}

export function decide(requestId: string, decision: Decision, note: string) {
  const requests = state.requests.map((request) => {
    if (request.id !== requestId) return request;
    const index = request.steps.findIndex((s) => s.status === "pending");
    if (index === -1) return request;

    const steps = request.steps.map((s) => ({ ...s }));
    const step = steps[index]!;
    let status = request.status;

    if (decision === "approve") {
      step.status = "approved";
      step.decidedLabel = "Approved just now";
      if (note) step.note = note;
      const next = steps[index + 1];
      if (next && next.status === "locked") {
        next.status = "pending";
        status = "in_review";
      } else {
        status = "approved";
      }
    } else if (decision === "changes") {
      step.status = "changes_requested";
      step.decidedLabel = "Changes requested just now";
      step.note = note;
      status = "changes_requested";
    } else {
      step.status = "rejected";
      step.decidedLabel = "Rejected just now";
      step.note = note;
      status = "rejected";
      for (let i = index + 1; i < steps.length; i++) steps[i]!.status = "cancelled";
    }

    const actionLabel =
      decision === "approve"
        ? `Approved ${step.name}`
        : decision === "changes"
          ? `Requested changes at ${step.name}`
          : `Rejected at ${step.name}`;

    return {
      ...request,
      status,
      urgency: "normal" as const,
      updatedLabel: "Updated just now",
      steps,
      audit: [
        ...request.audit,
        {
          id: nextId("e"),
          actorId: state.currentUserId,
          action: actionLabel,
          timestampLabel: nowLabel(),
          comment: note || undefined,
          channel: "Mobile" as const,
        },
      ],
    };
  });

  emit({ ...state, requests });
}

export function sendReminder(requestId: string) {
  const requests = state.requests.map((request) => {
    if (request.id !== requestId) return request;
    const step = currentStep(request);
    return {
      ...request,
      updatedLabel: "Updated just now",
      audit: [
        ...request.audit,
        {
          id: nextId("e"),
          actorId: state.currentUserId,
          action: `Sent reminder for ${step?.name ?? "current step"}`,
          timestampLabel: nowLabel(),
          channel: "Mobile" as const,
        },
      ],
    };
  });
  emit({ ...state, requests });
}

export function resubmitRequest(requestId: string, note: string) {
  const requests = state.requests.map((request) => {
    if (request.id !== requestId) return request;
    const steps = request.steps.map((s) => ({ ...s }));
    const index = steps.findIndex((s) => s.status === "changes_requested");
    if (index >= 0) steps[index]!.status = "pending";
    return {
      ...request,
      status: "in_review" as const,
      updatedLabel: "Updated just now",
      steps,
      audit: [
        ...request.audit,
        {
          id: nextId("e"),
          actorId: state.currentUserId,
          action: "Resubmitted after changes",
          timestampLabel: nowLabel(),
          comment: note || undefined,
          channel: "Mobile" as const,
        },
      ],
    };
  });
  emit({ ...state, requests });
}

export function addComment(requestId: string, comment: string) {
  const requests = state.requests.map((request) => {
    if (request.id !== requestId) return request;
    return {
      ...request,
      updatedLabel: "Updated just now",
      audit: [
        ...request.audit,
        {
          id: nextId("e"),
          actorId: state.currentUserId,
          action: "Added a comment",
          timestampLabel: nowLabel(),
          comment,
          channel: "Mobile" as const,
        },
      ],
    };
  });
  emit({ ...state, requests });
}
