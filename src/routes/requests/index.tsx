import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";

import { AppShell } from "@/components/kneawork/app-shell";
import { PageHeader } from "@/components/kneawork/page-header";
import { RequestTable } from "@/components/kneawork/request-table";
import { Button } from "@/components/ui/button";
import { useKneaState } from "@/lib/kneawork/store";

export const Route = createFileRoute("/requests/")({
  component: RequestsListPage,
});

function RequestsListPage() {
  const { requests, currentUserId } = useKneaState();

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
          }
        />

        {/* Requests Table (Unified search, filter pills, category facets, column visibility, responsive cards, & pagination) */}
        <RequestTable requests={requests} currentUserId={currentUserId} enableFilters={true} />
      </div>
    </AppShell>
  );
}
