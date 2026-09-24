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
  MessageSquare,
  Smartphone,
} from "lucide-react";
import { useState } from "react";

import { ActionBar } from "@/components/kneawork/action-bar";
import { AppShell } from "@/components/kneawork/app-shell";
import { ApprovalTimeline } from "@/components/kneawork/approval-timeline";
import { DecisionDialog } from "@/components/kneawork/decision-dialog";
import { PageHeader } from "@/components/kneawork/page-header";
import { StatusBadge, UrgencyBadge, formatDueStatus } from "@/components/kneawork/status-badge";
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
import { personById } from "@/lib/kneawork/data";
import {
  addComment,
  currentStep,
  decide,
  resubmitRequest,
  useKneaState,
} from "@/lib/kneawork/store";
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
  const [resubmitNote, setResubmitNote] = useState("");
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);

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
  const changeStep = request.steps.find((s) => s.status === "changes_requested");
  const isRequester = request.requesterId === currentUserId;

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

  const handleResubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resubmitNote.trim()) return;
    resubmitRequest(request.id, resubmitNote.trim());
    setActionFeedback(
      `Revisions submitted successfully. Request returned to ${changeStep?.name ?? "reviewer"} for review.`,
    );
    setResubmitNote("");
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
      hideMobileNav={Boolean(isMe)}
      breadcrumbs={[
        { label: "Requests", to: "/requests" },
        { label: isMe ? "Needs My Action" : "All Requests", to: isMe ? "/action" : "/requests" },
        { label: request.code },
      ]}
    >
      <div className={`space-y-6 ${isMe ? "pb-20 sm:pb-0" : ""}`}>
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

        {/* Standard PageHeader */}
        <PageHeader
          eyebrow={`${request.code} · ${request.type} request`}
          title={request.title}
          description={`Submitted by ${requester.name} (${request.department}) · ${request.submittedLabel}`}
          status={
            <StatusBadge
              status={request.status}
              currentStepName={step?.name}
              assigneeName={owner?.name}
              isAssignedToMe={Boolean(isMe)}
            />
          }
          actions={
            <div className="flex items-center gap-2 shrink-0">
              {/* Telegram Preview: On desktop visible in header, on mobile available in metadata panel */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsTelegramModalOpen(true)}
                className="hidden sm:inline-flex gap-1.5 text-xs h-8 border-border text-muted-foreground hover:text-foreground"
              >
                <Smartphone className="size-3.5" />
                Telegram preview
              </Button>

              {/* Desktop Decision Actions (Hidden on mobile to eliminate duplicated action bar & overflow) */}
              {isMe ? (
                <div className="hidden sm:flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border text-danger hover:bg-danger-soft hover:border-danger-border font-semibold text-xs h-8"
                    onClick={() => setActiveDecision("reject")}
                  >
                    <XCircle className="mr-1.5 size-3.5 text-danger" />
                    Reject
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border text-warning hover:bg-warning-soft hover:border-warning-border font-semibold text-xs h-8"
                    onClick={() => setActiveDecision("changes")}
                  >
                    <RotateCcw className="mr-1.5 size-3.5 text-warning" />
                    Request changes
                  </Button>
                  <Button
                    size="sm"
                    className="bg-success text-white hover:bg-success/90 font-semibold shadow-2xs text-xs h-8"
                    onClick={() => setActiveDecision("approve")}
                  >
                    <CheckCircle2 className="mr-1.5 size-3.5" />
                    Approve request
                  </Button>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">
                  {request.status === "approved" ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-success">
                      <CheckCircle2 className="size-3.5 text-success" /> Fully approved & closed
                    </span>
                  ) : request.status === "rejected" ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-danger">
                      <XCircle className="size-3.5 text-danger" /> Closed as rejected
                    </span>
                  ) : (
                    <span>
                      Assigned to <strong className="text-foreground">{owner?.name}</strong>
                    </span>
                  )}
                </div>
              )}
            </div>
          }
        />

        {/* 2. Sentinel Split Layout: Main Content (Left 8 cols) + Aside Status/Metadata (Right 4 cols) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 min-w-0">
          {/* LEFT COLUMN: Summary, Attachments, Timeline, Comments */}
          <div className="space-y-6 lg:col-span-8 min-w-0">
            {/* Revision Callout if Changes Requested */}
            {request.status === "changes_requested" && (
              <div className="rounded-lg border border-warning-border bg-warning-soft/30 p-5 shadow-2xs space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <RotateCcw className="size-5 text-warning shrink-0" />
                    <div>
                      <h3 className="text-base font-bold text-foreground">
                        Action required: Changes requested
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        The reviewer requested changes or additional context before this request can
                        proceed.
                      </p>
                    </div>
                  </div>
                  <span className="rounded bg-warning-soft border border-warning-border px-2.5 py-0.5 text-xs font-semibold text-warning shrink-0">
                    Waiting for revision
                  </span>
                </div>

                {changeStep?.note && (
                  <div className="rounded-md border border-warning-border/60 bg-card p-3.5 text-xs sm:text-[13px] text-foreground">
                    <span className="font-semibold text-warning block mb-1">
                      Reviewer feedback ({personById(changeStep.assigneeId).name} ·{" "}
                      {changeStep.name}):
                    </span>
                    <p className="italic leading-relaxed">"{changeStep.note}"</p>
                  </div>
                )}

                {isRequester ? (
                  <form onSubmit={handleResubmit} className="space-y-3 pt-1">
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="resubmit-notes"
                        className="text-xs font-semibold text-foreground"
                      >
                        Your revision notes / response to reviewer *
                      </Label>
                      <Textarea
                        id="resubmit-notes"
                        required
                        rows={3}
                        value={resubmitNote}
                        onChange={(e) => setResubmitNote(e.target.value)}
                        placeholder="Explain the changes made or provide clarification requested by the reviewer..."
                        className="text-xs sm:text-[13px] bg-card"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
                      <span className="text-xs text-muted-foreground">
                        Resubmitting will return this request to{" "}
                        <strong>Waiting for {changeStep?.name}</strong>.
                      </span>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={!resubmitNote.trim()}
                        className="bg-primary text-primary-foreground hover:bg-primary-hover font-semibold gap-1.5 text-xs h-8 shrink-0"
                      >
                        <Send className="size-3.5" />
                        Resubmit request
                      </Button>
                    </div>
                  </form>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Currently waiting for requester (
                    <strong className="text-foreground">{requester.name}</strong>) to provide
                    revisions.
                  </p>
                )}
              </div>
            )}

            {/* Request Summary Box */}
            <div className="rounded-lg border border-border bg-card p-5 sm:p-6 shadow-2xs space-y-4">
              <h2 className="text-base font-semibold text-foreground">Request summary</h2>
              <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 text-sm">
                <div>
                  <dt className="text-[13px] text-muted-foreground font-medium">
                    Total value / amount
                  </dt>
                  <dd className="mt-1 text-2xl font-bold text-foreground">{request.valueLabel}</dd>
                </div>
                <div>
                  <dt className="text-[13px] text-muted-foreground font-medium">Needed by date</dt>
                  <dd className="mt-1 text-sm font-medium text-foreground">
                    {step ? step.dueLabel : "Standard timeline"}
                  </dd>
                </div>
                <div className="sm:col-span-2 border-t border-border pt-4">
                  <dt className="text-[13px] text-muted-foreground font-medium">
                    Business justification & reason
                  </dt>
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
                          <p className="text-sm font-semibold text-foreground truncate">
                            {att.filename}
                          </p>
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
                  <span className="text-muted-foreground block text-[13px] font-medium">
                    Workflow state
                  </span>
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
                      <span className="text-muted-foreground block text-[13px] font-medium">
                        Current step
                      </span>
                      <p className="mt-0.5 text-base font-semibold text-foreground">{step.name}</p>
                    </div>

                    <div className="border-t border-border pt-3">
                      <span className="text-muted-foreground block text-[13px] font-medium">
                        Assigned approver
                      </span>
                      <p className="mt-0.5 text-sm font-medium text-foreground">
                        {owner?.name}{" "}
                        <span className="font-normal text-muted-foreground text-[13px]">
                          ({owner?.role})
                        </span>
                      </p>
                    </div>

                    <div className="border-t border-border pt-3">
                      <span className="text-muted-foreground block text-[13px] font-medium">
                        Due timeline
                      </span>
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

              {/* Telegram Preview Trigger (Desktop & Mobile accessible) */}
              <div className="pt-2 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsTelegramModalOpen(true)}
                  className="w-full h-9 text-xs font-semibold gap-1.5 border-border text-muted-foreground hover:text-foreground"
                >
                  <Smartphone className="size-3.5" aria-hidden="true" />
                  Simulate Telegram notification
                </Button>
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

      {/* Mobile Sticky Action Bar (44px min touch target, no duplication) */}
      {isMe ? (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-card/95 backdrop-blur-md border-t border-border px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-lg">
          <div className="flex items-center gap-2 max-w-lg mx-auto">
            <Button
              variant="outline"
              className="h-11 min-h-[44px] px-3.5 border-border text-danger hover:bg-danger-soft text-xs font-semibold"
              onClick={() => setActiveDecision("reject")}
            >
              <XCircle className="size-4 mr-1 shrink-0" aria-hidden="true" />
              Reject
            </Button>
            <Button
              variant="outline"
              className="h-11 min-h-[44px] px-3.5 border-border text-warning hover:bg-warning-soft text-xs font-semibold"
              onClick={() => setActiveDecision("changes")}
            >
              <RotateCcw className="size-4 mr-1 shrink-0" aria-hidden="true" />
              Changes
            </Button>
            <Button
              className="h-11 min-h-[44px] flex-1 bg-success text-white hover:bg-success/90 text-sm font-semibold shadow-2xs gap-1.5"
              onClick={() => setActiveDecision("approve")}
            >
              <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
              Approve
            </Button>
          </div>
        </div>
      ) : null}

      {/* Decision Dialog Modal with Consequence Explanation */}
      <DecisionDialog
        request={request}
        decision={activeDecision}
        onClose={() => setActiveDecision(null)}
        onConfirm={handleDecision}
      />

      {/* Telegram Notification Simulation Modal */}
      <Dialog open={isTelegramModalOpen} onOpenChange={setIsTelegramModalOpen}>
        <DialogContent className="sm:max-w-md p-5 sm:p-6">
          <DialogHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-full bg-[#229ED9] text-white shrink-0">
                <Send className="size-3.5" />
              </span>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Telegram notification preview
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Mobile notification delivered to the assigned reviewer
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Telegram Chat Bubble Preview */}
          <div className="rounded-lg bg-[#0F1E2B] text-white p-4 space-y-3 font-sans text-xs border border-white/10 shadow-md">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-[#56B3F5]">KneaWork Bot</span>
                <span className="rounded bg-[#56B3F5]/20 px-1 py-0.2 text-[9px] font-semibold text-[#56B3F5]">
                  BOT
                </span>
              </div>
              <span className="text-[10px] text-white/50">Today 10:04 AM</span>
            </div>

            <div className="space-y-1.5 leading-relaxed">
              <p className="font-semibold text-white">Approval requested</p>
              <p className="text-white/90">
                <span className="text-white/60">Request:</span> {request.code} — {request.title}
              </p>
              <p className="text-white/90">
                <span className="text-white/60">Amount:</span> {request.valueLabel}
              </p>
              <p className="text-white/90">
                <span className="text-white/60">Requester:</span> {requester.name} (
                {request.department})
              </p>
              <p className="text-white/90">
                <span className="text-white/60">Step:</span> {step?.name ?? "Approval"}
              </p>
              <p className="text-white/90">
                <span className="text-white/60">Due:</span> {step?.dueLabel ?? "Today"}
              </p>
              <div className="mt-2 rounded bg-white/5 p-2.5 text-white/80 border border-white/10 text-xs">
                "{request.reason}"
              </div>
            </div>

            {/* Telegram Webhook Inline Button */}
            <div className="space-y-2 pt-1">
              <Button
                type="button"
                onClick={() => setIsTelegramModalOpen(false)}
                className="w-full bg-[#229ED9] hover:bg-[#229ED9]/90 text-white font-semibold text-xs h-8.5 gap-1.5 shadow-xs"
              >
                <ExternalLink className="size-3.5" />
                Review request in KneaWork
              </Button>
              {request.attachments.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsTelegramModalOpen(false)}
                  className="w-full bg-white/5 hover:bg-white/10 text-white/90 border-white/15 text-xs h-7.5 gap-1"
                >
                  <Paperclip className="size-3" />
                  Attachment ({request.attachments[0]?.filename})
                </Button>
              )}
            </div>
          </div>

          <DialogFooter className="sm:justify-end pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsTelegramModalOpen(false)}
              className="text-xs h-8"
            >
              Close preview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
