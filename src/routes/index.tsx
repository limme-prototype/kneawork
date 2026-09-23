import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
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

export function HomePage() {
  const { requests, currentUserId } = useKneaState();
  const me = personById(currentUserId);
  const myActions = needsActionFrom(requests, currentUserId);
  const myRequests = requests.filter((r) => r.requesterId === currentUserId);
  const isApprover = me.id === "u_manager" || me.id === "u_finance" || me.id === "u_director";
  const isAdmin = me.id === "u_admin";

  return (
    <AppShell
      title="Home"
      subtitle={`${me.name} · ${me.title ?? me.role}`}
      breadcrumbs={[{ label: "Workspace" }, { label: "Home" }]}
    >
      <div className="space-y-6 max-w-5xl">
        {/* User Identity Header */}
        <div className="flex flex-col gap-1 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-base font-bold text-foreground">Welcome back, {me.name}</h1>
            <p className="text-xs text-muted-foreground">
              {me.title ?? `${me.role} · ${me.department}`}
            </p>
          </div>

          {isAdmin ? (
            <Button
              asChild
              size="sm"
              variant="outline"
              className="text-xs font-semibold gap-1.5 self-start sm:self-auto"
            >
              <Link to="/admin">
                <LayoutDashboard className="size-3.5 text-muted-foreground" />
                Operations overview
              </Link>
            </Button>
          ) : null}
        </div>

        {/* Approver / Reviewer Priority Section: "Needs your attention" Banner */}
        {myActions.length > 0 ? (
          <div className="rounded-lg border border-attention-border bg-attention-soft p-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex size-8 items-center justify-center rounded-md bg-attention text-xs font-bold text-attention-foreground shadow-2xs">
                  {myActions.length}
                </span>
                <div>
                  <h2 className="text-xs font-bold text-attention">Needs your attention</h2>
                  <p className="text-xs text-foreground mt-0.5">
                    {myActions.length === 1
                      ? `1 request is waiting for your review as ${me.role}.`
                      : `${myActions.length} requests require your review to proceed.`}
                  </p>
                </div>
              </div>
              <Button
                asChild
                size="sm"
                className="bg-attention text-attention-foreground hover:bg-attention/90 text-xs font-semibold h-8 self-start sm:self-auto"
              >
                <Link to="/action">
                  Review now
                  <ArrowRight className="size-3.5 ml-1.5" />
                </Link>
              </Button>
            </div>
          </div>
        ) : null}

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
                  <span className="mt-2 text-xs font-bold text-foreground">{tmpl.label}</span>
                  <span className="mt-0.5 text-[11px] text-muted-foreground truncate w-full">
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
            <h2 className="text-sm font-semibold text-foreground">
              {isApprover ? "My submitted requests" : "Recent requests"}
            </h2>
            <Link to="/requests" className="text-xs font-semibold text-primary hover:underline">
              View all requests ({requests.length})
            </Link>
          </div>

          {myRequests.length > 0 ? (
            <>
              <div className="hidden sm:block">
                <RequestTable requests={myRequests} currentUserId={currentUserId} />
              </div>
              <div className="sm:hidden space-y-2.5">
                {myRequests.map((request) => (
                  <RequestCard key={request.id} request={request} currentUserId={currentUserId} />
                ))}
              </div>
            </>
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
