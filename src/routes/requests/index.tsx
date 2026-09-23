import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Filter } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/kneawork/app-shell";
import { PageHeader } from "@/components/kneawork/page-header";
import { RequestCard } from "@/components/kneawork/request-card";
import { RequestTable } from "@/components/kneawork/request-table";
import { SearchInput } from "@/components/kneawork/search-input";
import { Button } from "@/components/ui/button";
import { useKneaState } from "@/lib/kneawork/store";
import type { RequestStatus } from "@/lib/kneawork/types";

export const Route = createFileRoute("/requests/")({
  component: RequestsListPage,
});

type StatusFilter = "all" | RequestStatus;

function RequestsListPage() {
  const { requests, currentUserId } = useKneaState();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filtered = requests.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        r.reason.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <AppShell
      title="All requests"
      breadcrumbs={[{ label: "Workspace", to: "/" }, { label: "Requests" }]}
    >
      <div className="space-y-6">
        {/* Standard PageHeader */}
        <PageHeader
          eyebrow="Workspace"
          title={`All Requests (${requests.length})`}
          description="Audit record of all operational purchase, expense, and leave submissions across the team."
          actions={
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <div className="flex-1 sm:w-64">
                <SearchInput
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search ID, title, reason..."
                />
              </div>
              <Button
                asChild
                size="default"
                className="gap-1.5 font-semibold bg-primary text-primary-foreground hover:bg-primary-hover shrink-0 shadow-2xs"
              >
                <Link to="/requests/new">
                  <Plus className="size-4" />
                  Create request
                </Link>
              </Button>
            </div>
          }
        />

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs sm:text-[13px] scrollbar-none">
          <Button
            type="button"
            size="sm"
            variant={statusFilter === "all" ? "default" : "outline"}
            onClick={() => setStatusFilter("all")}
            className="font-semibold"
          >
            All ({requests.length})
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setStatusFilter("in_review")}
            className={`font-semibold ${
              statusFilter === "in_review"
                ? "bg-attention text-attention-foreground border-attention hover:bg-attention/90 hover:text-attention-foreground"
                : ""
            }`}
          >
            Waiting on approval
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setStatusFilter("approved")}
            className={`font-semibold ${
              statusFilter === "approved"
                ? "bg-success text-white border-success hover:bg-success/90 hover:text-white"
                : ""
            }`}
          >
            Completed
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setStatusFilter("changes_requested")}
            className={`font-semibold ${
              statusFilter === "changes_requested"
                ? "bg-warning text-white border-warning hover:bg-warning/90 hover:text-white"
                : ""
            }`}
          >
            Changes requested
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setStatusFilter("rejected")}
            className={`font-semibold ${
              statusFilter === "rejected"
                ? "bg-danger text-white border-danger hover:bg-danger/90 hover:text-white"
                : ""
            }`}
          >
            Rejected
          </Button>
        </div>

        {/* Requests Table (Responsive: Desktop Table + Mobile Cards) */}
        {filtered.length > 0 ? (
          <RequestTable requests={filtered} currentUserId={currentUserId} />
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center">
            <p className="text-sm text-muted-foreground">
              No requests match the specified filters.
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
