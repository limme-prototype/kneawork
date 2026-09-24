import * as React from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { StatusBadge, UrgencyBadge } from "./status-badge";
import { personById } from "@/lib/kneawork/data";
import { currentStep } from "@/lib/kneawork/store";
import type { WorkRequest } from "@/lib/kneawork/types";
import {
  DataTable,
  DataTableColumnHeader,
  DataTableMobileCard,
  type DataTableFilterableColumn,
  type DataTableFilterPillsConfig,
} from "@/components/shared/data-table";

export interface RequestTableProps {
  requests: WorkRequest[];
  selectedRequestId?: string | undefined;
  onSelectRequest?: ((id: string) => void) | undefined;
  currentUserId: string;
  hideToolbar?: boolean | undefined;
  hidePagination?: boolean | undefined;
  searchPlaceholder?: string | undefined;
  enableFilters?: boolean | undefined;
  toolbar?: React.ReactNode | undefined;
}

export function RequestTable({
  requests,
  selectedRequestId,
  onSelectRequest,
  currentUserId,
  hideToolbar,
  hidePagination = false,
  searchPlaceholder = "Search ID, title, requester, reason...",
  enableFilters = false,
  toolbar,
}: RequestTableProps) {
  const shouldHideToolbar = hideToolbar !== undefined ? hideToolbar : !enableFilters;

  const columns = React.useMemo<ColumnDef<WorkRequest>[]>(
    () => [
      {
        accessorKey: "code",
        header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
        cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold text-muted-foreground">
            {row.original.code}
          </span>
        ),
      },
      {
        accessorKey: "title",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Request" />,
        cell: ({ row }) => {
          const req = row.original;
          const requester = personById(req.requesterId);
          return (
            <div className="min-w-0 py-1">
              <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate max-w-[220px] sm:max-w-xs md:max-w-sm">
                {req.title}
              </div>
              <div className="text-[12px] font-medium text-muted-foreground mt-0.5">
                {req.valueLabel} · <span className="capitalize">{req.type}</span>
                <span className="lg:hidden text-muted-foreground/80"> · {requester.name}</span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "type",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
        cell: ({ row }) => (
          <span className="text-xs font-medium capitalize text-muted-foreground">
            {row.original.type}
          </span>
        ),
      },
      {
        id: "requester",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Requester" />,
        accessorFn: (row) => personById(row.requesterId).name,
        cell: ({ row }) => {
          const requester = personById(row.original.requesterId);
          return (
            <div className="text-xs">
              <span className="block font-medium text-foreground">{requester.name}</span>
              <span className="block text-[11px] text-muted-foreground">
                {row.original.department}
              </span>
            </div>
          );
        },
      },
      {
        id: "step",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Current Step" />,
        accessorFn: (row) => currentStep(row)?.name ?? "Completed",
        cell: ({ row }) => {
          const step = currentStep(row.original);
          return step ? (
            <span className="text-xs font-medium text-foreground">{step.name}</span>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          );
        },
      },
      {
        id: "owner",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Owner" />,
        accessorFn: (row) => {
          const step = currentStep(row);
          return step ? personById(step.assigneeId).name : "None";
        },
        cell: ({ row }) => {
          const step = currentStep(row.original);
          const owner = step ? personById(step.assigneeId) : null;
          const isMe =
            step && step.assigneeId === currentUserId && row.original.status === "in_review";

          return owner ? (
            <span
              className={`text-xs font-semibold ${isMe ? "text-attention" : "text-foreground"}`}
            >
              {isMe ? "You" : owner.name}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          );
        },
      },
      {
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
          const req = row.original;
          const step = currentStep(req);
          const owner = step ? personById(step.assigneeId) : null;
          const isMe = step && step.assigneeId === currentUserId && req.status === "in_review";

          return (
            <StatusBadge
              status={req.status}
              currentStepName={step?.name}
              assigneeName={owner?.name}
              isAssignedToMe={Boolean(isMe)}
            />
          );
        },
      },
      {
        id: "due",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Due / Updated" />,
        accessorFn: (row) => {
          const step = currentStep(row);
          return step?.dueLabel ?? row.updatedLabel;
        },
        cell: ({ row }) => {
          const req = row.original;
          const step = currentStep(req);
          return step ? (
            <UrgencyBadge urgency={req.urgency} dueLabel={step.dueLabel} />
          ) : (
            <span className="text-xs text-muted-foreground">{req.updatedLabel}</span>
          );
        },
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => {
          const req = row.original;
          const step = currentStep(req);
          const isMe = step && step.assigneeId === currentUserId && req.status === "in_review";

          return (
            <div className="flex justify-end" data-no-row-click>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="font-semibold text-xs h-8 px-2.5"
              >
                <Link to="/requests/$requestId" params={{ requestId: req.id }}>
                  {isMe ? "Review" : "View"}
                  <ChevronRight className="size-3.5 ml-1" />
                </Link>
              </Button>
            </div>
          );
        },
      },
    ],
    [currentUserId],
  );

  const filterableColumns = React.useMemo<DataTableFilterableColumn[]>(
    () => [
      {
        id: "type",
        title: "Category",
        options: [
          { value: "purchase", label: "Purchase" },
          { value: "expense", label: "Expense" },
          { value: "leave", label: "Leave" },
          { value: "contract", label: "Contract" },
        ],
      },
    ],
    [],
  );

  const countsByStatus = React.useMemo(() => {
    const counts = {
      in_review: 0,
      approved: 0,
      changes_requested: 0,
      rejected: 0,
    };
    for (const r of requests) {
      if (r.status in counts) {
        counts[r.status as keyof typeof counts] += 1;
      }
    }
    return counts;
  }, [requests]);

  const filterPills = React.useMemo<DataTableFilterPillsConfig>(
    () => ({
      columnId: "status",
      allLabel: "All",
      allCount: requests.length,
      items: [
        {
          value: "in_review",
          label: "Waiting on approval",
          count: countsByStatus.in_review,
          activeClassName: "bg-attention text-attention-foreground shadow-2xs",
        },
        {
          value: "approved",
          label: "Completed",
          count: countsByStatus.approved,
          activeClassName: "bg-success text-white shadow-2xs",
        },
        {
          value: "changes_requested",
          label: "Changes requested",
          count: countsByStatus.changes_requested,
          activeClassName: "bg-warning text-white shadow-2xs",
        },
        {
          value: "rejected",
          label: "Rejected",
          count: countsByStatus.rejected,
          activeClassName: "bg-danger text-white shadow-2xs",
        },
      ],
    }),
    [requests.length, countsByStatus],
  );

  const renderMobileCard = React.useCallback(
    (req: WorkRequest) => {
      const requester = personById(req.requesterId);
      const step = currentStep(req);
      const owner = step ? personById(step.assigneeId) : null;
      const isMe = step && step.assigneeId === currentUserId && req.status === "in_review";

      return (
        <DataTableMobileCard
          key={req.id}
          selected={req.id === selectedRequestId}
          onClick={onSelectRequest ? () => onSelectRequest(req.id) : undefined}
          title={
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-mono text-xs text-muted-foreground">{req.code}</span>
              <span className="text-sm font-bold text-foreground">{req.title}</span>
            </div>
          }
          subtitle={`${req.valueLabel} · ${req.type} · By ${requester.name}`}
          status={
            <StatusBadge
              status={req.status}
              currentStepName={step?.name}
              assigneeName={owner?.name}
              isAssignedToMe={Boolean(isMe)}
            />
          }
          attributes={[
            {
              label: "Current Step",
              value: (
                <span>
                  {step?.name ?? "Completed"}
                  {owner && (
                    <span className="text-muted-foreground font-normal">
                      {" "}
                      · {isMe ? "You" : owner.name}
                    </span>
                  )}
                </span>
              ),
            },
            {
              label: "Due / Updated",
              value: step ? (
                <UrgencyBadge urgency={req.urgency} dueLabel={step.dueLabel} />
              ) : (
                <span className="text-muted-foreground">{req.updatedLabel}</span>
              ),
            },
          ]}
          actions={
            <Button asChild variant="outline" size="sm" className="font-semibold text-xs h-8 px-3">
              <Link to="/requests/$requestId" params={{ requestId: req.id }}>
                {isMe ? "Review" : "View"}
                <ChevronRight className="size-3.5 ml-1" />
              </Link>
            </Button>
          }
        />
      );
    },
    [currentUserId, onSelectRequest, selectedRequestId],
  );

  return (
    <DataTable
      data={requests}
      columns={columns}
      getRowId={(row) => row.id}
      mode="auto"
      hideToolbar={shouldHideToolbar}
      hidePagination={hidePagination}
      searchPlaceholder={searchPlaceholder}
      filterableColumns={enableFilters ? filterableColumns : undefined}
      filterPills={enableFilters ? filterPills : undefined}
      toolbar={toolbar}
      renderMobileCard={renderMobileCard}
      onRowClick={onSelectRequest ? (row) => onSelectRequest(row.id) : undefined}
      emptyTitle="No requests found"
      emptyDescription="No requests match the specified search or active filters."
    />
  );
}
