import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Inbox,
  Paperclip,
  RotateCcw,
  Sparkles,
  User,
  X,
  XCircle,
} from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/kneawork/app-shell";
import { DecisionDialog } from "@/components/kneawork/decision-dialog";
import { PageHeader } from "@/components/kneawork/page-header";
import { RequestTable } from "@/components/kneawork/request-table";
import { SearchInput } from "@/components/kneawork/search-input";
import { StatusBadge, UrgencyBadge } from "@/components/kneawork/status-badge";
import { Button } from "@/components/ui/button";
import { personById } from "@/lib/kneawork/data";
import {
  currentStep,
  decide,
  needsActionFrom,
  recentlyCompletedBy,
  useKneaState,
} from "@/lib/kneawork/store";
import type { Decision, WorkRequest } from "@/lib/kneawork/types";

export const Route = createFileRoute("/action")({
  component: ActionInboxPage,
});

type FilterTab = "all" | "overdue" | "completed";

function ActionInboxPage() {
  const { requests, currentUserId } = useKneaState();
  const me = personById(currentUserId);
  const myActions = needsActionFrom(requests, currentUserId);
  const completedActions = recentlyCompletedBy(requests, currentUserId);

  const [filter, setFilter] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeDecision, setActiveDecision] = useState<{ req: WorkRequest; type: Decision } | null>(
    null,
  );
  const [actionDoneBanner, setActionDoneBanner] = useState<string | null>(null);

  const baseList = filter === "completed" ? completedActions : myActions;

  const filtered = baseList.filter((r) => {
    if (filter === "overdue" && r.urgency !== "overdue") return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return r.title.toLowerCase().includes(q) || r.code.toLowerCase().includes(q);
    }
    return true;
  });

  const overdueCount = myActions.filter((r) => r.urgency === "overdue").length;

  // Active selected item for split reading pane
  const activeSelected =
    filtered.find((r) => r.id === selectedId) || (filtered.length > 0 ? filtered[0] : null);

  const handleQuickApprove = (req: WorkRequest) => {
    decide(req.id, "approve", "");
    setActionDoneBanner(`Approved ${req.code} (${req.title}) · ${req.valueLabel}`);
  };

  const handleDecisionConfirm = (decision: Decision, note: string) => {
    if (!activeDecision) return;
    decide(activeDecision.req.id, decision, note);
    const code = activeDecision.req.code;
    setActiveDecision(null);
    if (decision === "changes") {
      setActionDoneBanner(`Changes requested for ${code}. Returned to requester.`);
    } else if (decision === "reject") {
      setActionDoneBanner(`Request ${code} declined.`);
    } else {
      setActionDoneBanner(`Approved ${code}.`);
    }
  };

  return (
    <AppShell
      title="My Actions"
      subtitle="Requests requiring your review"
      breadcrumbs={[{ label: "Workspace", to: "/" }, { label: "My Actions" }]}
    >
      <div className="space-y-6">
        {/* Post-Decision Feedback Banner */}
        {actionDoneBanner ? (
          <div className="rounded-xl border border-success-border bg-success-soft p-4 text-xs text-success flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="size-4.5 text-success shrink-0" />
              <span className="font-semibold text-foreground">{actionDoneBanner}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActionDoneBanner(null)}
              className="h-7 w-7 p-0 text-success hover:bg-success-border/30"
            >
              <X className="size-4" />
            </Button>
          </div>
        ) : null}

        {/* Header Summary */}
        <PageHeader
          eyebrow="Decision Queue"
          title={`My Actions (${myActions.length})`}
          description={`Requests assigned to ${me.name} requiring executive review or sign-off.`}
          actions={
            <div className="w-full sm:w-64">
              <SearchInput
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter actions by title or ID..."
              />
            </div>
          }
        />

        {/* Filter Pills (Standardized with /requests and anumat-apps standard) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <Button
            size="sm"
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            className={cn(
              "h-8 min-h-[32px] px-3 text-xs font-semibold rounded-full shrink-0 transition-all gap-1.5",
              filter === "all"
                ? "bg-[#003D96] text-white hover:bg-[#002D70] shadow-2xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted border border-border/80",
            )}
          >
            <span>All Pending</span>
            <span
              className={cn(
                "inline-flex items-center justify-center min-w-[20px] h-4.5 px-1.5 rounded-full text-[11px] font-mono font-bold transition-colors",
                filter === "all"
                  ? "bg-white/20 text-white"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {myActions.length}
            </span>
          </Button>

          <Button
            size="sm"
            variant={filter === "overdue" ? "default" : "outline"}
            onClick={() => setFilter("overdue")}
            className={cn(
              "h-8 min-h-[32px] px-3 text-xs font-semibold rounded-full shrink-0 transition-all gap-1.5",
              filter === "overdue"
                ? "bg-rose-600 text-white hover:bg-rose-700 shadow-2xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted border border-border/80",
            )}
          >
            <span>Overdue</span>
            <span
              className={cn(
                "inline-flex items-center justify-center min-w-[20px] h-4.5 px-1.5 rounded-full text-[11px] font-mono font-bold transition-colors",
                filter === "overdue"
                  ? "bg-white/20 text-white"
                  : overdueCount > 0
                    ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-bold"
                    : "bg-muted text-muted-foreground",
              )}
            >
              {overdueCount}
            </span>
          </Button>

          <Button
            size="sm"
            variant={filter === "completed" ? "default" : "outline"}
            onClick={() => setFilter("completed")}
            className={cn(
              "h-8 min-h-[32px] px-3 text-xs font-semibold rounded-full shrink-0 transition-all gap-1.5",
              filter === "completed"
                ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted border border-border/80",
            )}
          >
            <span>Recently Completed</span>
            <span
              className={cn(
                "inline-flex items-center justify-center min-w-[20px] h-4.5 px-1.5 rounded-full text-[11px] font-mono font-bold transition-colors",
                filter === "completed"
                  ? "bg-white/20 text-white"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {completedActions.length}
            </span>
          </Button>
        </div>

        {/* Action Content Area */}
        {filter === "completed" ? (
          /* Completed items table */
          completedActions.length > 0 ? (
            <RequestTable requests={completedActions} currentUserId={currentUserId} />
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center shadow-2xs">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <CheckCircle2 className="size-6" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-foreground">
                No completed decisions yet
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Decisions you confirm will appear here for historical reference.
              </p>
            </div>
          )
        ) : filtered.length > 0 ? (
          /* Prompt 03: 2-Column Split View on Desktop >= 1024px (Outlook / Teams Reading Pane) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[580px]">
            {/* Left Queue Column: 380px wide on large screens (lg:col-span-4 or 5) */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Pending Decisions ({filtered.length})
                </span>
                <span className="text-[11px] text-muted-foreground">Click to preview</span>
              </div>

              <div className="space-y-2.5 max-h-[720px] overflow-y-auto pr-1">
                {filtered.map((req) => {
                  const isSelected = activeSelected?.id === req.id;
                  const requester = personById(req.requesterId);
                  const step = currentStep(req);

                  return (
                    <div
                      key={req.id}
                      onClick={() => setSelectedId(req.id)}
                      className={`group rounded-xl border p-4 cursor-pointer transition-all duration-150 ${
                        isSelected
                          ? "border-primary bg-accent/80 border-l-4 border-l-primary shadow-sm ring-1 ring-primary/20"
                          : "border-border bg-card hover:bg-muted/40 hover:border-border/80"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-xs font-bold text-foreground">
                            {req.code}
                          </span>
                          <span className="rounded bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground capitalize">
                            {req.type}
                          </span>
                        </div>
                        <UrgencyBadge urgency={req.urgency} dueLabel={step?.dueLabel ?? "Pending"} />
                      </div>

                      <h3
                        className={`text-sm font-bold line-clamp-1 mb-1.5 ${
                          isSelected ? "text-primary" : "text-foreground"
                        }`}
                      >
                        {req.title}
                      </h3>

                      <div className="flex items-center justify-between text-xs mt-3 pt-2.5 border-t border-border/60">
                        <div className="flex items-center gap-2 text-muted-foreground min-w-0">
                          <div className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary text-[11px] font-bold shrink-0">
                            {requester.name.charAt(0)}
                          </div>
                          <span className="font-medium text-foreground truncate">
                            {requester.name}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-foreground shrink-0 font-mono">
                          {req.valueLabel}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Reading & Inspection Pane (lg:col-span-7) */}
            {activeSelected ? (
              <div className="lg:col-span-7">
                {(() => {
                  const req = activeSelected;
                  const requester = personById(req.requesterId);
                  const step = currentStep(req);

                  return (
                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between space-y-6">
                      <div className="space-y-6">
                        {/* Header Row */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-border/70 pb-5">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-semibold text-muted-foreground">
                                {req.code}
                              </span>
                              <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground capitalize">
                                {req.type}
                              </span>
                              <StatusBadge
                                status={req.status}
                                currentStepName={step?.name}
                                isAssignedToMe
                              />
                            </div>
                            <h2 className="text-xl sm:text-2xl font-bold text-foreground leading-tight">
                              {req.title}
                            </h2>
                          </div>

                          <div className="sm:text-right shrink-0">
                            <span className="text-xs text-muted-foreground block font-medium">
                              Total Amount
                            </span>
                            <span className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-mono">
                              {req.valueLabel}
                            </span>
                          </div>
                        </div>

                        {/* Requester Profile Card */}
                        <div className="flex items-center justify-between rounded-lg border border-border/80 bg-muted/20 p-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
                              {requester.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-foreground">{requester.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {requester.role} · {req.department}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[11px] font-semibold text-attention bg-accent border border-attention-border px-2.5 py-1 rounded-full">
                              Waiting on your decision
                            </span>
                          </div>
                        </div>

                        {/* Form Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div className="space-y-1 rounded-lg border border-border/60 p-3 bg-card">
                            <span className="text-muted-foreground font-medium block">
                              Current Step & SLA
                            </span>
                            <span className="text-sm font-semibold text-foreground block">
                              {step?.name ?? "Review"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {step?.dueLabel ?? "Due within 24 hours"}
                            </span>
                          </div>

                          <div className="space-y-1 rounded-lg border border-border/60 p-3 bg-card">
                            <span className="text-muted-foreground font-medium block">
                              Submitted Date
                            </span>
                            <span className="text-sm font-semibold text-foreground block">
                              {req.submittedLabel}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Immutable audit trail active
                            </span>
                          </div>

                          <div className="sm:col-span-2 space-y-1.5 rounded-lg border border-border/60 p-3.5 bg-muted/10">
                            <span className="text-muted-foreground font-semibold block text-xs">
                              Business Justification & Reason
                            </span>
                            <p className="text-xs sm:text-[13px] text-foreground leading-relaxed">
                              {req.reason}
                            </p>
                          </div>
                        </div>

                        {/* Attached Quotations & Documents Box (Prompt 03 specification) */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-foreground">
                              Attached Documents & Quotations ({req.attachments.length})
                            </span>
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <Eye className="size-3 text-muted-foreground" />
                              Audit logged
                            </span>
                          </div>

                          {req.attachments.length > 0 ? (
                            <div className="divide-y divide-border rounded-lg border border-border bg-card">
                              {req.attachments.map((att) => (
                                <div
                                  key={att.id}
                                  className="flex items-center justify-between p-3 text-xs"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <FileText className="size-4 text-primary shrink-0" />
                                    <div className="min-w-0">
                                      <p className="font-semibold text-foreground truncate">
                                        {att.filename}
                                      </p>
                                      <p className="text-[11px] text-muted-foreground">
                                        {att.size} · PDF Attachment
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10 h-7"
                                  >
                                    View PDF
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="rounded-lg border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
                              No files attached with this submission.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Sticky / Dedicated Decision Action Bar (Prompt 03) */}
                      <div className="pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-card sticky bottom-0">
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="text-xs text-muted-foreground hover:text-foreground self-start sm:self-auto"
                        >
                          <Link to="/requests/$requestId" params={{ requestId: req.id }}>
                            View full page details
                            <ArrowRight className="size-3.5 ml-1" />
                          </Link>
                        </Button>

                        <div className="flex items-center gap-2 flex-wrap justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs font-semibold text-warning border-border hover:bg-warning-soft hover:border-warning-border h-9"
                            onClick={() => setActiveDecision({ req, type: "changes" })}
                          >
                            <RotateCcw className="size-3.5 mr-1 text-warning" />
                            Request Changes
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs font-semibold text-danger border-border hover:bg-danger-soft hover:border-danger-border h-9"
                            onClick={() => setActiveDecision({ req, type: "reject" })}
                          >
                            <XCircle className="size-3.5 mr-1 text-danger" />
                            Reject
                          </Button>

                          <Button
                            size="sm"
                            className="bg-primary text-primary-foreground hover:bg-primary-hover text-xs font-bold shadow-2xs h-9 px-4"
                            onClick={() => handleQuickApprove(req)}
                          >
                            <CheckCircle2 className="size-3.5 mr-1.5" />
                            Approve {req.valueLabel}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : null}
          </div>
        ) : (
          /* Clean All-Caught-Up Empty State */
          <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center shadow-2xs">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-success-soft text-success">
              <CheckCircle2 className="size-6" />
            </div>
            <h3 className="mt-3 text-base font-semibold text-foreground">You are all caught up</h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
              No requests are currently waiting for your review. When someone submits a request on
              your path, it will appear here.
            </p>
            <div className="mt-5">
              <Button asChild variant="outline" size="sm" className="text-xs font-medium">
                <Link to="/requests">Explore all requests</Link>
              </Button>
            </div>
          </div>
        )}

        {/* Interactive Decision Dialog with Quick-Reason Chips */}
        {activeDecision ? (
          <DecisionDialog
            request={activeDecision.req}
            decision={activeDecision.type}
            onClose={() => setActiveDecision(null)}
            onConfirm={handleDecisionConfirm}
          />
        ) : null}
      </div>
    </AppShell>
  );
}
