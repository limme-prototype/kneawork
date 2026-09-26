import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  FileText,
  Inbox,
  LayoutDashboard,
  Plane,
  Plus,
  Receipt,
  ShoppingCart,
} from "lucide-react";

import { AppShell } from "@/components/kneawork/app-shell";
import { PageHeader } from "@/components/kneawork/page-header";
import { RequestCard } from "@/components/kneawork/request-card";
import { RequestTable } from "@/components/kneawork/request-table";
import { Button } from "@/components/ui/button";
import { personById, TEMPLATES } from "@/lib/kneawork/data";
import { needsActionFrom, useKneaState } from "@/lib/kneawork/store";

export const Route = createFileRoute("/")({
  component: HomePage,
});

const TYPE_ICONS = {
  purchase: ShoppingCart,
  expense: Receipt,
  leave: Plane,
  contract: FileText,
};

function HomePage() {
  const { requests, currentUserId } = useKneaState();
  const me = personById(currentUserId);
  const myActions = needsActionFrom(requests, currentUserId);
  const myRequests = requests.filter((r) => r.requesterId === currentUserId);
  const isApprover = me.id === "u_manager" || me.id === "u_finance" || me.id === "u_director";
  const isAdmin = me.id === "u_admin";
  const waitingForOthers = myRequests.filter((r) => r.status === "in_review");
  const completedCount = requests.filter((r) => r.status === "approved").length;

  return (
    <AppShell title="Home" breadcrumbs={[{ label: "Workspace" }, { label: "Home" }]}>
      <div className="space-y-6">
        {/* Consistent Standard PageHeader */}
        <PageHeader
          eyebrow="Workspace"
          title={`Good morning, ${me.name}`}
          description="Here is what needs your attention today across active requests and approval routes."
          actions={
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="gap-1.5 font-semibold text-xs sm:text-[13px]"
                >
                  <Link to="/admin">
                    <LayoutDashboard className="size-3.5 text-muted-foreground" />
                    Overview
                  </Link>
                </Button>
              )}
              <Button
                asChild
                size="default"
                className="gap-1.5 font-semibold bg-primary text-primary-foreground hover:bg-primary-hover shadow-2xs"
              >
                <Link to="/requests/new">
                  <Plus className="size-4" />
                  Create request
                </Link>
              </Button>
            </div>
          }
        />

        {/* Urgent Attention Hero Banner (if user has pending decisions) */}
        {myActions.length > 0 ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-attention-border bg-accent p-5 shadow-2xs">
            <div className="flex items-center gap-3.5 min-w-0">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-card border-2 border-primary text-primary font-bold text-lg shadow-2xs">
                {myActions.length}
              </span>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-foreground">
                  {myActions.length} {myActions.length === 1 ? "request is" : "requests are"} waiting for your approval
                </h2>
                <p className="text-xs sm:text-[13px] text-muted-foreground mt-0.5 flex items-center gap-1.5 truncate">
                  <Clock className="size-3.5 text-warning shrink-0" />
                  <span>Oldest: {myActions[0].title} ({myActions[0].code}) — Pending your decision</span>
                </p>
              </div>
            </div>
            <Button asChild size="default" className="rounded-full bg-primary text-primary-foreground hover:bg-primary-hover px-5 font-semibold text-xs sm:text-sm shrink-0">
              <Link to="/action">
                Review Actions ({myActions.length}) <ArrowRight className="size-4 ml-1" />
              </Link>
            </Button>
          </div>
        ) : null}

        {/* Actionable KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-lg border border-border bg-card p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Pending Approvals</span>
              <Clock className="size-4 text-warning" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">{requests.filter(r => r.status === "in_review" || r.status === "pending").length}</span>
              <span className="text-xs text-warning font-medium">in active review</span>
            </div>
            <div className="mt-3">
              <Link
                to="/requests"
                search={{ status: "in_review" }}
                className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
              >
                Track queue <ArrowRight className="size-3" />
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">
                Approved This Month
              </span>
              <Check className="size-4 text-success" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">{completedCount}</span>
              <span className="text-xs text-success font-medium">completed submissions</span>
            </div>
            <div className="mt-3">
              <Link
                to="/requests"
                search={{ status: "approved" }}
                className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
              >
                View completed <ArrowRight className="size-3" />
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">
                Rejected / Returned
              </span>
              <FileText className="size-4 text-muted-foreground" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">
                {requests.filter(r => r.status === "rejected" || r.status === "changes_requested").length}
              </span>
              <span className="text-xs text-muted-foreground">archived/returned</span>
            </div>
            <div className="mt-3">
              <Link
                to="/requests"
                search={{ status: "rejected" }}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
              >
                View archive <ArrowRight className="size-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Create Actions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">Start a request</h2>
            <Link to="/requests/new" className="text-xs font-semibold text-primary hover:underline">
              + Create custom request
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {TEMPLATES.map((tmpl) => {
              const Icon = TYPE_ICONS[tmpl.type];
              return (
                <Link
                  key={tmpl.type}
                  to="/requests/new"
                  search={{ type: tmpl.type }}
                  className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-4 text-center transition-all hover:border-primary/50 hover:bg-accent/50 shadow-2xs group"
                >
                  <span className="flex size-9 items-center justify-center rounded-md bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <Icon className="size-4.5" />
                  </span>
                  <span className="mt-2 text-sm font-bold text-foreground">{tmpl.label}</span>
                  <span className="mt-0.5 text-xs sm:text-[13px] text-muted-foreground truncate w-full">
                    {tmpl.valueLabel}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Personal Requests vs Organization Activity */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-foreground">
              {isApprover ? "My submitted requests" : "Recent requests"}
            </h2>
            <Link to="/requests" className="text-sm font-semibold text-primary hover:underline">
              View all requests ({requests.length})
            </Link>
          </div>

          {myRequests.length > 0 ? (
            <RequestTable requests={myRequests} currentUserId={currentUserId} />
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center text-xs text-muted-foreground">
              <p>You have not submitted any requests yet.</p>
              <Button asChild size="sm" variant="outline" className="mt-3 text-xs">
                <Link to="/requests/new">Create your first request</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
