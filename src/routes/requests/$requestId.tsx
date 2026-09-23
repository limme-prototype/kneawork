import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Paperclip,
  RotateCcw,
  Send,
  XCircle,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/kneawork/app-shell";
import { ApprovalTimeline } from "@/components/kneawork/approval-timeline";
import { DecisionDialog } from "@/components/kneawork/decision-dialog";
import { StatusBadge, UrgencyBadge, formatDueStatus } from "@/components/kneawork/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { personById } from "@/lib/kneawork/data";
import { addComment, currentStep, decide, useKneaState } from "@/lib/kneawork/store";
import type { Decision } from "@/lib/kneawork/types";

export const Route = createFileRoute("/requests/$requestId")({
  component: RequestDetailPage,
});

function RequestDetailPage() {
  const { requestId } = Route.useParams();
  const navigate = useNavigate();
  const { requests, currentUserId } = useKneaState();
  const request = requests.find((r) => r.id === requestId);

  const [activeDecision, setActiveDecision] = useState<Decision | null>(null);
  const [newComment, setNewComment] = useState("");
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  if (!request) {
    return (
      <AppShell title="Request not found">
        <div className="py-12 text-center">
          <p className="text-muted-foreground">The requested record does not exist.</p>
          <Button asChild className="mt-4" variant="outline">
            <Link to="/requests">Back to requests</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  const requester = personById(request.requesterId);
  const step = currentStep(request);
  const owner = step ? personById(step.assigneeId) : null;
  const isMe = step && step.assigneeId === currentUserId && request.status === "in_review";
  const nextStep = step ? request.steps[request.steps.indexOf(step) + 1] : null;

  const handleDecision = (decision: Decision, note: string) => {
    decide(request.id, decision, note);
    setActiveDecision(null);
    if (decision === "approve") {
      setActionFeedback(
        nextStep
          ? `Approved. Request forwarded to ${personById(nextStep.assigneeId).name} for ${nextStep.name}.`
          : "Approved. All sequential steps completed and request recorded.",
      );
    } else if (decision === "changes") {
      setActionFeedback(`Changes requested. Request returned to ${requester.name} for revision.`);
    } else {
      setActionFeedback(
        `Request rejected. The workflow is concluded and ${requester.name} has been notified.`,
      );
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addComment(request.id, newComment.trim());
    setNewComment("");
  };

  return (
    <AppShell
      title={`${request.title} (${request.code})`}
      breadcrumbs={[
        { label: "Requests", to: "/requests" },
        { label: isMe ? "Needs My Action" : "All Requests", to: isMe ? "/action" : "/requests" },
        { label: request.code },
      ]}
    >
      <div className={`space-y-6 ${isMe ? "pb-16 sm:pb-0" : ""}`}>
        {/* Action Feedback Banner */}
        {actionFeedback ? (
          <div className="rounded-lg border border-success-border bg-success-soft p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-success">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="size-4 shrink-0" />
              <span className="font-medium text-foreground">{actionFeedback}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                asChild
                size="sm"
                className="bg-primary text-primary-foreground text-xs font-semibold h-7.5"
              >
                <Link to="/action">Return to My Action</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="text-xs font-semibold h-7.5 bg-card border-border"
              >
                <Link to="/requests">All Requests</Link>
              </Button>
            </div>
          </div>
        ) : null}

        {/* 1. Header Bar: Title, Code, Metadata + Immediate Action Buttons */}
        <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-semibold text-muted-foreground shrink-0">
                {request.code}
              </span>
              <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium text-foreground capitalize shrink-0">
                {request.type} request
              </span>
              <div className="shrink-0">
                <StatusBadge
                  status={request.status}
                  currentStepName={step?.name}
                  assigneeName={owner?.name}
                  isAssignedToMe={Boolean(isMe)}
                />
              </div>
            </div>
            <h1 className="mt-1.5 text-xl font-bold text-foreground tracking-tight sm:text-2xl break-words">
              {request.title}
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Submitted by <span className="font-semibold text-foreground">{requester.name}</span> (
              {request.department}) · {request.submittedLabel}
            </p>
          </div>

          {/* Contextual Action Group (Header actions visible sm and up; mobile uses sticky bottom bar) */}
          {isMe ? (
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="border-border text-danger hover:bg-danger-soft hover:border-danger-border font-semibold"
                onClick={() => setActiveDecision("reject")}
              >
                <XCircle className="mr-1.5 size-4 text-danger" />
                Reject
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-border text-warning hover:bg-warning-soft hover:border-warning-border font-semibold"
                onClick={() => setActiveDecision("changes")}
              >
                <RotateCcw className="mr-1.5 size-4 text-warning" />
                Request changes
              </Button>
              <Button
                size="sm"
                className="bg-success text-white hover:bg-success/90 font-semibold shadow-2xs"
                onClick={() => setActiveDecision("approve")}
              >
                <CheckCircle2 className="mr-1.5 size-4" />
                Approve request
              </Button>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground shrink-0">
              {request.status === "approved" ? (
                <span className="inline-flex items-center gap-1 font-semibold text-success">
                  <CheckCircle2 className="size-4 text-success" /> Fully approved & closed
                </span>
              ) : request.status === "rejected" ? (
                <span className="inline-flex items-center gap-1 font-semibold text-danger">
                  <XCircle className="size-4 text-danger" /> Closed as rejected
                </span>
              ) : (
                <span>
                  Assigned to <strong className="text-foreground">{owner?.name}</strong>
                </span>
              )}
            </div>
          )}
        </div>

        {/* 2. Sentinel Split Layout: Main Content (Left 8 cols) + Aside Status/Metadata (Right 4 cols) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 min-w-0">
          {/* LEFT COLUMN: Summary, Attachments, Timeline, Comments */}
          <div className="space-y-6 lg:col-span-8 min-w-0">
            {/* Request Summary Box */}
            <div className="rounded-lg border border-border bg-card p-5 sm:p-6 shadow-2xs space-y-4">
              <h2 className="text-base font-semibold text-foreground">Request summary</h2>
              <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 text-sm">
                <div>
                  <dt className="text-[13px] text-muted-foreground font-medium">Total value / amount</dt>
                  <dd className="mt-1 text-2xl font-bold text-foreground">
                    {request.valueLabel}
                  </dd>
                </div>
                <div>
                  <dt className="text-[13px] text-muted-foreground font-medium">Needed by date</dt>
                  <dd className="mt-1 text-sm font-medium text-foreground">
                    {step ? step.dueLabel : "Standard timeline"}
                  </dd>
                </div>
                <div className="sm:col-span-2 border-t border-border pt-4">
                  <dt className="text-[13px] text-muted-foreground font-medium">Business justification & reason</dt>
                  <dd className="mt-1.5 text-sm text-foreground leading-relaxed bg-muted/30 p-3.5 rounded-md border border-border">
                    <article className="prose prose-sm prose-kneawork max-w-none text-sm">
                      <p>{request.reason}</p>
                    </article>
                  </dd>
                </div>
              </dl>
            </div>

            {/* Attachments Section */}
            <div className="rounded-lg border border-border bg-card p-5 sm:p-6 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-foreground">
                  Attachments & evidence ({request.attachments.length})
                </h2>
              </div>
              {request.attachments.length > 0 ? (
                <div className="mt-3 divide-y divide-border">
                  {request.attachments.map((att) => (
                    <div key={att.id} className="flex items-center justify-between py-3 gap-2">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <Paperclip className="size-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-foreground truncate">{att.filename}</p>
                          <p className="text-xs text-muted-foreground">{att.size}</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10 shrink-0"
                      >
                        <Download className="size-3.5 mr-1" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">No attachments provided.</p>
              )}
            </div>

            {/* Approval Progress Timeline */}
            <div className="rounded-lg border border-border bg-card p-5 sm:p-6 shadow-2xs">
              <h2 className="text-base font-semibold text-foreground mb-4">
                Approval progress & decisions
              </h2>
              <ApprovalTimeline request={request} currentUserId={currentUserId} />
            </div>

            {/* Comments & Conversation */}
            <div className="rounded-lg border border-border bg-card p-5 sm:p-6 shadow-2xs space-y-4">
              <h2 className="text-base font-semibold text-foreground">Comments & discussion</h2>

              <div className="space-y-3">
                {request.audit
                  .filter((a) => a.comment)
                  .map((item) => {
                    const author = personById(item.actorId);
                    return (
                      <div
                        key={item.id}
                        className="rounded-md border border-border bg-muted/30 p-3.5 text-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground">
                            {author.name}{" "}
                            <span className="font-normal text-muted-foreground text-[13px]">
                              ({author.role})
                            </span>
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {item.timestampLabel}
                          </span>
                        </div>
                        <article className="prose prose-sm prose-kneawork max-w-none text-sm mt-1.5">
                          <p className="text-foreground leading-relaxed">{item.comment}</p>
                        </article>
                      </div>
                    );
                  })}
              </div>

              <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
                <Input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add an operational note or remark..."
                  className="rounded-md"
                />
                <Button type="submit" size="sm" disabled={!newComment.trim()}>
                  <Send className="size-3.5 mr-1" />
                  Post
                </Button>
              </form>
            </div>
          </div>

          {/* RIGHT ASIDE: Status Panel, Metadata & Activity History (Sentinel Style) */}
          <div className="space-y-6 lg:col-span-4 min-w-0">
            {/* 1. Status Panel */}
            <div className="rounded-lg border border-border bg-card p-5 shadow-2xs space-y-4">
              <h3 className="text-base font-semibold text-foreground">Status panel</h3>

              <div className="space-y-3.5 text-sm">
                <div>
                  <span className="text-muted-foreground block text-[13px] font-medium">Workflow state</span>
                  <div className="mt-1.5">
                    <StatusBadge
                      status={request.status}
                      currentStepName={step?.name}
                      assigneeName={owner?.name}
                      isAssignedToMe={Boolean(isMe)}
                    />
                  </div>
                </div>

                {step ? (
                  <>
                    <div className="border-t border-border pt-3">
                      <span className="text-muted-foreground block text-[13px] font-medium">Current step</span>
                      <p className="mt-0.5 text-base font-semibold text-foreground">{step.name}</p>
                    </div>

                    <div className="border-t border-border pt-3">
                      <span className="text-muted-foreground block text-[13px] font-medium">
                        Assigned approver
                      </span>
                      <p className="mt-0.5 text-sm font-medium text-foreground">
                        {owner?.name}{" "}
                        <span className="font-normal text-muted-foreground text-[13px]">({owner?.role})</span>
                      </p>
                    </div>

                    <div className="border-t border-border pt-3">
                      <span className="text-muted-foreground block text-[13px] font-medium">Due timeline</span>
                      <div className="mt-1">
                        <UrgencyBadge urgency={request.urgency} dueLabel={step.dueLabel} />
                      </div>
                    </div>

                    {nextStep ? (
                      <div className="border-t border-border pt-3">
                        <span className="text-muted-foreground block text-[13px] font-medium">
                          Next step after approval
                        </span>
                        <p className="mt-0.5 text-sm text-foreground">
                          {nextStep.name} ({personById(nextStep.assigneeId).name})
                        </p>
                      </div>
                    ) : (
                      <div className="border-t border-border pt-3">
                        <span className="text-muted-foreground block text-[13px] font-medium">
                          Final action
                        </span>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          Request will be completed and archived.
                        </p>
                      </div>
                    )}
                  </>
                ) : null}
              </div>
            </div>

            {/* 2. Request Metadata Box */}
            <div className="rounded-lg border border-border bg-card p-5 shadow-2xs space-y-3.5 text-sm">
              <h3 className="text-base font-semibold text-foreground">Request details</h3>
              <div className="space-y-2.5 text-muted-foreground">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[13px]">Requester</span>
                  <span className="font-medium text-foreground">{requester.name}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[13px]">Department</span>
                  <span className="font-medium text-foreground">{request.department}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[13px]">Currency</span>
                  <span className="font-medium text-foreground">USD ($)</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[13px]">Due status</span>
                  <span className="font-medium text-foreground">
                    {formatDueStatus(request.urgency, step?.dueLabel)}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Activity Log (Event titles 14px, timestamps 12px) */}
            <div className="rounded-lg border border-border bg-card p-5 shadow-2xs space-y-3.5">
              <h3 className="text-base font-semibold text-foreground">Audit activity history</h3>
              <div className="space-y-3.5">
                {request.audit.map((evt) => {
                  const actor = personById(evt.actorId);
                  return (
                    <div key={evt.id} className="border-l-2 border-border pl-3.5 py-0.5">
                      <p className="text-sm font-semibold text-foreground">{evt.action}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {actor.name} · {evt.timestampLabel}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Action Bar */}
      {isMe ? (
        <div className="sm:hidden fixed bottom-14 left-0 right-0 p-3 bg-card/95 backdrop-blur-xs border-t border-border z-30 shadow-lg flex items-center justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-border text-danger hover:bg-danger-soft text-xs font-semibold h-9"
            onClick={() => setActiveDecision("reject")}
          >
            Reject
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-border text-warning hover:bg-warning-soft text-xs font-semibold h-9"
            onClick={() => setActiveDecision("changes")}
          >
            Changes
          </Button>
          <Button
            size="sm"
            className="flex-2 bg-success text-white hover:bg-success/90 text-xs font-semibold h-9 shadow-2xs"
            onClick={() => setActiveDecision("approve")}
          >
            Approve
          </Button>
        </div>
      ) : null}

      {/* Decision Dialog Modal with Consequence Explanation */}
      <DecisionDialog
        request={request}
        decision={activeDecision}
        onClose={() => setActiveDecision(null)}
        onConfirm={handleDecision}
      />
    </AppShell>
  );
}
