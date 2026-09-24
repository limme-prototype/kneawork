import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock, Inbox, Sparkles, X } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/kneawork/app-shell";
import { PageHeader } from "@/components/kneawork/page-header";
import { RequestCard } from "@/components/kneawork/request-card";
import { RequestTable } from "@/components/kneawork/request-table";
import { SearchInput } from "@/components/kneawork/search-input";
import { StatusBadge, UrgencyBadge } from "@/components/kneawork/status-badge";
import { Button } from "@/components/ui/button";
import { personById } from "@/lib/kneawork/data";
import {
  currentStep,
  needsActionFrom,
  recentlyCompletedBy,
  useKneaState,
} from "@/lib/kneawork/store";

export const Route = createFileRoute("/action")({
  component: ActionInboxPage,
});

type FilterTab = "all" | "due_today" | "overdue" | "completed";

export function ActionInboxPage() {
  const { requests, currentUserId } = useKneaState();
  const me = personById(currentUserId);
  const myActions = needsActionFrom(requests, currentUserId);
  const completedActions = recentlyCompletedBy(requests, currentUserId);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const [actionDoneBanner, setActionDoneBanner] = useState<string | null>(null);

  const baseList = filter === "completed" ? completedActions : myActions;

  const filtered = baseList.filter((r) => {
    if (filter === "overdue" && r.urgency !== "overdue") return false;
    if (filter === "due_today" && r.urgency !== "due_today") return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return r.title.toLowerCase().includes(q) || r.code.toLowerCase().includes(q);
    }
    return true;
  });

  const overdueCount = myActions.filter((r) => r.urgency === "overdue").length;
  const dueTodayCount = myActions.filter((r) => r.urgency === "due_today").length;

  return (
    <AppShell
      title="My Action"
      subtitle="Requests assigned to you"
      breadcrumbs={[{ label: "Workspace", to: "/" }, { label: "My Action" }]}
    >
      <div className="space-y-6">
        {/* Immediate Post-Decision Confirmation Alert */}
        {actionDoneBanner ? (
          <div className="rounded-lg border border-success-border bg-success-soft p-3.5 text-xs text-success flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-success" />
              <span>{actionDoneBanner}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActionDoneBanner(null)}
              className="h-6 w-6 p-0 text-success hover:bg-success-border/30"
            >
              <X className="size-3.5" />
            </Button>
          </div>
        ) : null}

        {/* Header Summary */}
        <PageHeader
          eyebrow="Workspace"
          title={`My Action (${myActions.length})`}
          description={`Requests assigned to ${me.name} that require a decision or confirmation.`}
          actions={
            <div className="w-full sm:w-64">
              <SearchInput
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter actions..."
              />
            </div>
          }
        />

        {/* Filter Tabs using Button component */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <Button
            size="sm"
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            className="shrink-0"
          >
            Needs decision ({myActions.length})
          </Button>
          <Button
            size="sm"
            variant={filter === "due_today" ? "default" : "outline"}
            onClick={() => setFilter("due_today")}
            className={`shrink-0 ${
              filter === "due_today" ? "bg-warning text-white hover:bg-warning/90" : ""
            }`}
          >
            Due today ({dueTodayCount})
          </Button>
          <Button
            size="sm"
            variant={filter === "overdue" ? "default" : "outline"}
            onClick={() => setFilter("overdue")}
            className={`shrink-0 ${
              filter === "overdue" ? "bg-danger text-white hover:bg-danger/90" : ""
            }`}
          >
            Overdue ({overdueCount})
          </Button>
          <Button
            size="sm"
            variant={filter === "completed" ? "default" : "outline"}
            onClick={() => setFilter("completed")}
            className="shrink-0"
          >
            Recently completed ({completedActions.length})
          </Button>
        </div>

        {/* Action List Display (Spec: Daily-Use Compact Scannable Row) */}
        {filtered.length > 0 ? (
          filtered.length === 1 ? (
            /* Single Focused Record Card Layout */
            <div className="space-y-3">
              {filtered.map((req) => {
                const requester = personById(req.requesterId);
                const step = currentStep(req);
                return (
                  <div
                    key={req.id}
                    className="rounded-lg border border-attention-border bg-card p-5 sm:p-6 shadow-2xs hover:border-attention transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/60 pb-3.5">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-semibold text-muted-foreground shrink-0">
                            {req.code}
                          </span>
                          <h2 className="text-base font-bold text-foreground truncate">
                            {req.title}
                          </h2>
                          <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground capitalize shrink-0">
                            {req.type}
                          </span>
                        </div>
                        <p className="text-lg font-bold text-foreground mt-1">{req.valueLabel}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <StatusBadge
                          status={req.status}
                          currentStepName={step?.name}
                          isAssignedToMe
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
                      <div className="space-y-1.5 text-muted-foreground">
                        <div>
                          Requested by{" "}
                          <strong className="text-foreground font-semibold">
                            {requester.name}
                          </strong>{" "}
                          · {req.department}
                        </div>
                        <div>
                          Current step:{" "}
                          <strong className="text-attention font-semibold">
                            {step?.name ?? "Review"} · You
                          </strong>
                        </div>
                        <div className="flex items-center gap-2 pt-0.5">
                          <UrgencyBadge
                            urgency={req.urgency}
                            dueLabel={step?.dueLabel ?? "Today"}
                          />
                        </div>
                      </div>

                      <div>
                        <Button asChild size="sm" className="font-semibold gap-1.5">
                          <Link to="/requests/$requestId" params={{ requestId: req.id }}>
                            Review
                            <ArrowRight className="size-3.5" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Multi-Record: Table on Desktop, Cards on Mobile */
            <RequestTable requests={filtered} currentUserId={currentUserId} />
          )
        ) : filter === "completed" ? (
          /* Empty Completed Actions */
          <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center shadow-2xs">
            <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <CheckCircle2 className="size-5" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-foreground">
              No completed decisions found
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Requests you have approved, rejected, or sent changes for will appear here for audit
              reference.
            </p>
          </div>
        ) : (
          /* Clean Empty State */
          <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center shadow-2xs">
            <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-success-soft text-success">
              <CheckCircle2 className="size-5" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-foreground">You are all caught up</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              No requests are currently waiting for your decision.
            </p>
            <div className="mt-4">
              <Button asChild variant="outline" size="sm" className="text-xs">
                <Link to="/requests">View my requests</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
