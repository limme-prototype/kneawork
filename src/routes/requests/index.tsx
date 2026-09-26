import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Filter,
  Inbox,
  Plus,
  RotateCcw,
  Sparkles,
  Users,
} from "lucide-react";
import React, { useMemo, useState } from "react";

import { AppShell } from "@/components/kneawork/app-shell";
import { PageHeader } from "@/components/kneawork/page-header";
import { RequestTable } from "@/components/kneawork/request-table";
import { Button } from "@/components/ui/button";
import { personById } from "@/lib/kneawork/data";
import { currentStep, useKneaState } from "@/lib/kneawork/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/requests/")({
  component: RequestsListPage,
});

function RequestsListPage() {
  const { requests, currentUserId } = useKneaState();
  const me = personById(currentUserId);

  const [scope, setScope] = useState<"all" | "mine">("all");

  // Filter requests based on scope (Everyone vs My Requests)
  const scopedRequests = useMemo(() => {
    return requests.filter((r) => (scope === "all" ? true : r.requesterId === currentUserId));
  }, [requests, scope, currentUserId]);

  // Metric counts
  const needsActionCount = useMemo(() => {
    return requests.filter((r) => {
      const step = currentStep(r);
      return step && step.assigneeId === currentUserId && r.status === "in_review";
    }).length;
  }, [requests, currentUserId]);

  const inReviewCount = useMemo(() => {
    return scopedRequests.filter((r) => r.status === "in_review").length;
  }, [scopedRequests]);

  const approvedCount = useMemo(() => {
    return scopedRequests.filter((r) => r.status === "approved").length;
  }, [scopedRequests]);

  const handleExportCSV = () => {
    const headers = ["ID", "Title", "Category", "Requester", "Department", "Value", "Status", "Date"];
    const rows = scopedRequests.map((r) => [
      r.code,
      `"${r.title.replace(/"/g, '""')}"`,
      r.type,
      `"${personById(r.requesterId).name}"`,
      r.department,
      `"${r.valueLabel || ""}"`,
      r.status,
      r.submittedDate,
    ]);
    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `anumat_requests_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppShell
      title="All requests"
      breadcrumbs={[{ label: "Workspace", to: "/" }, { label: "Requests" }]}
    >
      <div className="space-y-6 pb-12">
        {/* Page Header with Export CSV & Create Request */}
        <PageHeader
          eyebrow="Workspace"
          title={`All Requests (${requests.length})`}
          description="Corporate audit register of operational purchases, expense reimbursements, and leave applications across your team."
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="h-9 text-xs font-semibold gap-1.5 hidden sm:flex"
              >
                <Download className="size-3.5" />
                Export CSV
              </Button>
              <Button
                asChild
                size="default"
                className="gap-1.5 font-semibold bg-[#003D96] hover:bg-[#002D70] text-white shrink-0 shadow-2xs h-9 px-4"
              >
                <Link to="/requests/new">
                  <Plus className="size-4" />
                  Create request
                </Link>
              </Button>
            </div>
          }
        />

        {/* Contextual Notice when user has actions pending */}
        {needsActionCount > 0 && (
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-[#F2F7FF] border border-[#003D96]/20 text-[#003D96] text-xs font-medium shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#003D96] animate-pulse shrink-0" />
              <span>
                <strong>{needsActionCount}</strong> request{needsActionCount > 1 ? "s" : ""} waiting for your review.
              </span>
            </div>
            <Link to="/action" className="font-bold underline hover:opacity-80 shrink-0">
              Review actions →
            </Link>
          </div>
        )}

        {/* Requests Table with unified filter pills and scope switcher on the same line */}
        <RequestTable
          requests={scopedRequests}
          currentUserId={currentUserId}
          enableFilters={true}
          filterPillsTrailing={
            <div className="inline-flex items-center p-0.5 rounded-full bg-muted/60 border border-border/70 shrink-0">
              <button
                type="button"
                onClick={() => setScope("all")}
                className={cn(
                  "h-7 px-3 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5",
                  scope === "all"
                    ? "bg-[#003D96] text-white shadow-2xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Users className="size-3.5" />
                <span>Everyone</span>
                <span
                  className={cn(
                    "inline-flex items-center justify-center min-w-[18px] h-4 px-1 rounded-full text-[10px] font-mono font-bold",
                    scope === "all" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground",
                  )}
                >
                  {requests.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setScope("mine")}
                className={cn(
                  "h-7 px-3 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5",
                  scope === "mine"
                    ? "bg-[#003D96] text-white shadow-2xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <FileText className="size-3.5" />
                <span>My Requests</span>
                <span
                  className={cn(
                    "inline-flex items-center justify-center min-w-[18px] h-4 px-1 rounded-full text-[10px] font-mono font-bold",
                    scope === "mine" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground",
                  )}
                >
                  {requests.filter((r) => r.requesterId === currentUserId).length}
                </span>
              </button>
            </div>
          }
        />
      </div>
    </AppShell>
  );
}
