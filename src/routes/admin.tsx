import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  DollarSign,
  Download,
  Filter,
  Layers,
  Plus,
  TrendingUp,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import React, { useMemo, useState } from "react";

import { AppShell } from "@/components/kneawork/app-shell";
import { PageHeader } from "@/components/kneawork/page-header";
import { RequestTable } from "@/components/kneawork/request-table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PEOPLE, personById } from "@/lib/kneawork/data";
import { currentStep, useKneaState } from "@/lib/kneawork/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  component: OperationsOverviewPage,
});

function OperationsOverviewPage() {
  const { requests, currentUserId } = useKneaState();
  const [selectedHolderId, setSelectedHolderId] = useState<string | null>(null);

  // 1. Executive Operations Telemetry
  const inReviewRequests = useMemo(
    () => requests.filter((r) => r.status === "in_review"),
    [requests],
  );

  const overdueRequests = useMemo(
    () => requests.filter((r) => r.urgency === "overdue"),
    [requests],
  );

  const approvedRequests = useMemo(
    () => requests.filter((r) => r.status === "approved"),
    [requests],
  );

  // Financial Exposure (Total $ sum of active requests awaiting sign-off)
  const pendingExposure = useMemo(() => {
    let total = 0;
    for (const r of inReviewRequests) {
      const match = r.valueLabel.match(/[\d,]+(?:\.\d+)?/);
      if (match && !r.valueLabel.includes("day")) {
        const val = parseFloat(match[0].replace(/,/g, ""));
        if (!isNaN(val)) total += val;
      }
    }
    return `$${total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, [inReviewRequests]);

  // 2. Approver Caseload & SLA Bottleneck Breakdown
  const approverCaseloads = useMemo(() => {
    return PEOPLE.map((person) => {
      const holding = requests.filter((r) => {
        if (r.status !== "in_review") return false;
        const step = currentStep(r);
        return step?.assigneeId === person.id;
      });
      const overdue = holding.filter((r) => r.urgency === "overdue").length;
      return {
        person,
        holding,
        overdue,
      };
    }).filter((item) => item.holding.length > 0);
  }, [requests]);

  // Filter requests based on selected approver holding queue
  const displayedRequests = useMemo(() => {
    if (!selectedHolderId) return requests;
    return requests.filter((r) => {
      if (r.status !== "in_review") return false;
      const step = currentStep(r);
      return step?.assigneeId === selectedHolderId;
    });
  }, [requests, selectedHolderId]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Title",
      "Category",
      "Requester",
      "Department",
      "Value",
      "Current Step",
      "Assignee",
      "Status",
      "Urgency",
    ];
    const rows = displayedRequests.map((r) => {
      const step = currentStep(r);
      const assignee = step ? personById(step.assigneeId).name : "—";
      return [
        r.code,
        `"${r.title.replace(/"/g, '""')}"`,
        r.type,
        `"${personById(r.requesterId).name}"`,
        r.department,
        `"${r.valueLabel || ""}"`,
        `"${step?.name || "Completed"}"`,
        `"${assignee}"`,
        r.status,
        r.urgency,
      ];
    });
    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `anumat_operations_audit_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectedHolder = selectedHolderId ? personById(selectedHolderId) : null;

  return (
    <AppShell
      title="Operations Overview"
      breadcrumbs={[{ label: "Manage" }, { label: "Operations overview" }]}
    >
      <div className="space-y-6 pb-12">
        {/* Page Header */}
        <PageHeader
          eyebrow="Manage"
          title="Operations Overview"
          description="Executive oversight of active approval queues, reviewer workloads, SLA bottlenecks, and corporate compliance across all active routes."
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

        {/* 1. Executive Telemetry Ribbon (4 KPI Cards) */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {/* Active in Route */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-2xs flex items-center gap-3.5">
            <div className="size-10 rounded-full bg-[#F2F7FF] border border-[#003D96]/15 flex items-center justify-center shrink-0">
              <Clock className="size-5 text-[#003D96]" />
            </div>
            <div className="min-w-0">
              <span className="text-xs text-muted-foreground font-medium block truncate">
                Active in Route
              </span>
              <span className="text-2xl font-bold font-mono text-foreground mt-0.5 block leading-tight">
                {inReviewRequests.length}
              </span>
              <span className="text-[11px] text-muted-foreground block truncate">
                Awaiting approval
              </span>
            </div>
          </div>

          {/* SLA Bottlenecks */}
          <div
            className={cn(
              "rounded-xl border p-4 shadow-2xs flex items-center gap-3.5 transition-colors",
              overdueRequests.length > 0
                ? "border-rose-200 bg-rose-50/60 dark:bg-rose-950/20 dark:border-rose-900"
                : "border-border bg-card",
            )}
          >
            <div
              className={cn(
                "size-10 rounded-full flex items-center justify-center shrink-0",
                overdueRequests.length > 0
                  ? "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-400"
                  : "bg-muted text-muted-foreground",
              )}
            >
              <AlertTriangle className="size-5" />
            </div>
            <div className="min-w-0">
              <span className="text-xs text-muted-foreground font-medium block truncate">
                SLA Bottlenecks
              </span>
              <span
                className={cn(
                  "text-2xl font-bold font-mono mt-0.5 block leading-tight",
                  overdueRequests.length > 0 ? "text-rose-700 dark:text-rose-400" : "text-foreground",
                )}
              >
                {overdueRequests.length}
              </span>
              <span
                className={cn(
                  "text-[11px] block truncate font-medium",
                  overdueRequests.length > 0 ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground",
                )}
              >
                {overdueRequests.length > 0 ? "Requires escalation" : "All routes on schedule"}
              </span>
            </div>
          </div>

          {/* In-Flight Financial Exposure */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-2xs flex items-center gap-3.5">
            <div className="size-10 rounded-full bg-[#F2F7FF] border border-[#003D96]/15 flex items-center justify-center shrink-0">
              <TrendingUp className="size-5 text-[#003D96]" />
            </div>
            <div className="min-w-0">
              <span className="text-xs text-muted-foreground font-medium block truncate">
                Pending Exposure
              </span>
              <span className="text-2xl font-bold font-mono text-foreground mt-0.5 block leading-tight">
                {pendingExposure}
              </span>
              <span className="text-[11px] text-muted-foreground block truncate">
                Total in-flight spend
              </span>
            </div>
          </div>

          {/* Completed Records */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-2xs flex items-center gap-3.5">
            <div className="size-10 rounded-full bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 flex items-center justify-center shrink-0">
              <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="min-w-0">
              <span className="text-xs text-muted-foreground font-medium block truncate">
                Completed Records
              </span>
              <span className="text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-400 mt-0.5 block leading-tight">
                {approvedRequests.length}
              </span>
              <span className="text-[11px] text-muted-foreground block truncate">
                Archived with full audit
              </span>
            </div>
          </div>
        </div>

        {/* 2. Real-Time Approver Caseload & Bottleneck Matrix */}
        <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border pb-3">
            <div>
              <h2 className="text-base font-bold text-foreground">
                Reviewer Queues & Bottleneck Analysis
              </h2>
              <p className="text-[13px] text-muted-foreground mt-0.5">
                Live caseload of active approvers holding requests. Click to filter the operations audit register.
              </p>
            </div>
            {selectedHolderId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedHolderId(null)}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground gap-1.5 self-start sm:self-auto"
              >
                <X className="size-3.5" />
                Clear filter
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {approverCaseloads.map(({ person, holding, overdue }) => {
              const isSelected = selectedHolderId === person.id;
              return (
                <div
                  key={person.id}
                  onClick={() =>
                    setSelectedHolderId((prev) => (prev === person.id ? null : person.id))
                  }
                  className={cn(
                    "flex flex-col justify-between rounded-xl border p-4 transition-all cursor-pointer select-none",
                    isSelected
                      ? "border-[#003D96] bg-[#F2F7FF]/70 shadow-2xs ring-1 ring-[#003D96]"
                      : "border-border bg-muted/20 hover:border-[#003D96]/40 hover:bg-muted/40",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar className="size-9 shrink-0 border border-border">
                        <AvatarFallback className="bg-muted text-foreground text-xs font-bold">
                          {person.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <span className="font-bold text-foreground text-sm block truncate">
                          {person.name}
                        </span>
                        <span className="text-[12px] text-muted-foreground block truncate">
                          {person.role} · {person.department}
                        </span>
                      </div>
                    </div>

                    <span className="font-mono text-xs font-bold text-[#003D96] bg-white border border-[#003D96]/20 px-2 py-0.5 rounded-full shrink-0 shadow-2xs">
                      {holding.length} {holding.length === 1 ? "held" : "held"}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                    {overdue > 0 ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400">
                        <AlertCircle className="size-3.5" />
                        {overdue} overdue SLA
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                        <CheckCircle2 className="size-3.5" />
                        On schedule
                      </span>
                    )}

                    <span
                      className={cn(
                        "font-semibold text-[11px] transition-colors flex items-center gap-1",
                        isSelected ? "text-[#003D96]" : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {isSelected ? "Active Filter" : "Filter queue"}
                      <ArrowRight className="size-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Filter Banner (if holder selected) */}
        {selectedHolder && (
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-[#F2F7FF] border border-[#003D96]/30 text-xs text-[#003D96]">
            <div className="flex items-center gap-2">
              <UserCheck className="size-4 shrink-0" />
              <span>
                Showing requests currently held by{" "}
                <strong>{selectedHolder.name}</strong> ({selectedHolder.role} · {selectedHolder.department}).
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedHolderId(null)}
              className="text-xs font-bold underline hover:opacity-80 cursor-pointer"
            >
              Show all ({requests.length})
            </button>
          </div>
        )}

        {/* 4. Operations Audit Register (`RequestTable`) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground">Operations Audit Register</h2>
              <p className="text-[13px] text-muted-foreground">
                Sequential tracking of operational purchases, financial claims, and leave authorizations.
              </p>
            </div>
          </div>

          <RequestTable
            requests={displayedRequests}
            currentUserId={currentUserId}
            enableFilters={true}
          />
        </div>
      </div>
    </AppShell>
  );
}
