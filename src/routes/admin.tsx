import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Filter,
  Layers,
  Plus,
  Users,
} from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/kneawork/app-shell";
import { RequestTable } from "@/components/kneawork/request-table";
import { SearchInput } from "@/components/kneawork/search-input";
import { Button } from "@/components/ui/button";
import { PEOPLE, personById, TEMPLATES } from "@/lib/kneawork/data";
import { needsActionFrom, useKneaState } from "@/lib/kneawork/store";

export const Route = createFileRoute("/admin")({
  component: OperationsOverviewPage,
});

function OperationsOverviewPage() {
  const { requests, currentUserId } = useKneaState();
  const [search, setSearch] = useState("");

  const needsActionCount = needsActionFrom(requests, currentUserId).length;
  const waitingOthersCount = requests.filter(
    (r) => r.status === "in_review" && !needsActionFrom([r], currentUserId).length,
  ).length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;
  const overdueCount = requests.filter((r) => r.urgency === "overdue").length;

  const filteredRequests = requests.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      r.code.toLowerCase().includes(q) ||
      personById(r.requesterId).name.toLowerCase().includes(q) ||
      r.type.toLowerCase().includes(q)
    );
  });

  return (
    <AppShell
      title="Operations overview"
      subtitle="All team requests and approval activity"
      breadcrumbs={[{ label: "Manage" }, { label: "Operations overview" }]}
    >
      <div className="space-y-6">
        {/* 1. Sentinel Priority Summary Counters */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {/* Needs My Action (Attention token) */}
          <div className="rounded-lg border border-border bg-card p-4 shadow-2xs">
            <span className="text-xs font-semibold text-attention uppercase tracking-wider">Needs my action</span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-foreground">{needsActionCount}</span>
              <span className="text-xs text-muted-foreground">Requires you</span>
            </div>
          </div>

          {/* Waiting on Others (Warning token) */}
          <div className="rounded-lg border border-border bg-card p-4 shadow-2xs">
            <span className="text-xs font-semibold text-warning uppercase tracking-wider">Waiting on others</span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-foreground">{waitingOthersCount}</span>
              <span className="text-xs text-muted-foreground">In route</span>
            </div>
          </div>

          {/* Approved This Month (Success token) */}
          <div className="rounded-lg border border-border bg-card p-4 shadow-2xs">
            <span className="text-xs font-semibold text-success uppercase tracking-wider">Approved this month</span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-foreground">{approvedCount}</span>
              <span className="text-xs text-muted-foreground">Recorded</span>
            </div>
          </div>

          {/* Overdue (Danger token ONLY when count > 0, otherwise neutral) */}
          <div
            className={`rounded-lg border p-4 shadow-2xs ${
              overdueCount > 0 ? "border-danger-border bg-danger-soft" : "border-border bg-card"
            }`}
          >
            <span
              className={`text-xs font-semibold uppercase tracking-wider ${
                overdueCount > 0 ? "text-danger" : "text-muted-foreground"
              }`}
            >
              Overdue
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span
                className={`text-2xl font-bold ${
                  overdueCount > 0 ? "text-danger" : "text-foreground"
                }`}
              >
                {overdueCount}
              </span>
              <span className="text-xs text-muted-foreground">
                {overdueCount > 0 ? "Urgent attention" : "All on track"}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Operations Request Table & Filters */}
        <div className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground">Requests requiring attention</h2>
              <p className="text-[13px] text-muted-foreground">
                Track sequential progression and active approvers across departments
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex-1 sm:w-64">
                <SearchInput
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search requests, IDs, or people..."
                />
              </div>

              <Button
                asChild
                size="sm"
                className="gap-1.5 font-semibold bg-primary text-primary-foreground hover:bg-primary-hover shrink-0"
              >
                <Link to="/requests/new">
                  <Plus className="size-3.5" />
                  New request
                </Link>
              </Button>
            </div>
          </div>

          {/* Table */}
          <RequestTable requests={filteredRequests} currentUserId={currentUserId} />
        </div>

        {/* 3. Actionable Approval Bottlenecks (Why it matters, oldest request) */}
        <div className="rounded-lg border border-border bg-card p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="text-base font-semibold text-foreground">
                Approval bottleneck analysis
              </h3>
              <p className="text-[13px] text-muted-foreground">
                Stages where work is currently waiting for reviews
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-start justify-between rounded-md border border-border bg-muted/30 p-4">
              <div>
                <span className="font-bold text-foreground text-sm">Finance review</span>
                <p className="text-[13px] text-muted-foreground mt-0.5">Assigned to Vanna (Finance)</p>
                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-semibold text-danger">Oldest: 3 days</span>
                  <span>·</span>
                  <span>2 requests waiting</span>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSearch("Finance")}
                className="font-semibold"
              >
                Filter
              </Button>
            </div>

            <div className="flex items-start justify-between rounded-md border border-border bg-muted/30 p-4">
              <div>
                <span className="font-bold text-foreground text-sm">Manager approval</span>
                <p className="text-[13px] text-muted-foreground mt-0.5">
                  Assigned to Sokha (Operations)
                </p>
                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="text-warning font-medium">Oldest: Today</span>
                  <span>·</span>
                  <span>1 request waiting</span>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSearch("Manager")}
                className="font-semibold"
              >
                Filter
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
