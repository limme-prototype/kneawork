import * as React from "react";
import { Link } from "@tanstack/react-router";
import { Calendar, ChevronRight, FileCheck, Receipt, ShoppingBag } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StatusBadge, UrgencyBadge } from "./status-badge";
import { personById } from "@/lib/kneawork/data";
import { currentStep } from "@/lib/kneawork/store";
import type { WorkRequest } from "@/lib/kneawork/types";
import { cn } from "@/lib/utils";
import {
  DataTable,
  DataTableColumnHeader,
  DataTableMobileCard,
  type DataTableFilterableColumn,
  type DataTableFilterPillsConfig,
} from "@/components/shared/data-table";

function getCategoryIcon(type: string) {
  const cat = type.toLowerCase();
  if (cat.includes("equipment") || cat.includes("it") || cat.includes("purchase")) {
    return <ShoppingBag className="size-4 text-[#003D96]" />;
  }
  if (cat.includes("expense") || cat.includes("claim") || cat.includes("reimburse")) {
    return <Receipt className="size-4 text-[#003D96]" />;
  }
  if (cat.includes("leave") || cat.includes("vacation")) {
    return <Calendar className="size-4 text-[#003D96]" />;
  }
  return <FileCheck className="size-4 text-[#003D96]" />;
}

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
  filterPillsTrailing?: React.ReactNode | undefined;
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
  filterPillsTrailing,
}: RequestTableProps) {
  const shouldHideToolbar = hideToolbar !== undefined ? hideToolbar : !enableFilters;

  const columns = React.useMemo<ColumnDef<WorkRequest>[]>(
    () => [
      {
        accessorKey: "code",
        header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
        cell: ({ row }) => (
          <Link
            to="/requests/$requestId"
            params={{ requestId: row.original.id }}
            className="whitespace-nowrap font-mono text-xs font-semibold text-[#003D96] hover:underline"
          >
            {row.original.code}
          </Link>
        ),
        size: 90,
        minSize: 85,
      },
      {
        accessorKey: "title",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Request" />,
        cell: ({ row }) => {
          const req = row.original;
          return (
            <div className="flex items-center gap-3 py-1 min-w-0">
              <div className="size-8.5 rounded-lg bg-[#F2F7FF] border border-[#003D96]/15 flex items-center justify-center shrink-0">
                {getCategoryIcon(req.type)}
              </div>
              <div className="min-w-0">
                <Link
                  to="/requests/$requestId"
                  params={{ requestId: req.id }}
                  className="text-sm font-semibold text-foreground hover:text-[#003D96] hover:underline transition-colors truncate block max-w-[200px] sm:max-w-xs md:max-w-sm"
                >
                  {req.title}
                </Link>
                <div className="text-[11px] font-medium text-muted-foreground mt-0.5 flex items-center gap-1.5 flex-wrap">
                  <span className="capitalize">{req.type}</span>
                  <span>·</span>
                  <span>{req.submittedDate}</span>
                </div>
              </div>
            </div>
          );
        },
      },
      {
        id: "requester",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Requester" />,
        accessorFn: (row) => personById(row.requesterId).name,
        cell: ({ row }) => {
          const requester = personById(row.original.requesterId);
          return (
            <div className="flex items-center gap-2 min-w-0">
              <Avatar className="size-6.5 shrink-0 border border-border">
                <AvatarFallback className="bg-muted text-foreground text-[10px] font-bold">
                  {requester.initials}
                </AvatarFallback>
              </Avatar>
              <div className="text-xs min-w-0">
                <span className="block font-medium text-foreground truncate">{requester.name}</span>
                <span className="block text-[11px] text-muted-foreground truncate">
                  {row.original.department}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "valueLabel",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Value" />,
        cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold text-foreground whitespace-nowrap">
            {row.original.valueLabel || "—"}
          </span>
        ),
      },
      {
        id: "stageTurn",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Stage / Turn" />,
        accessorFn: (row) => {
          const step = currentStep(row);
          if (!step) return "Completed";
          return `${step.name} (${personById(step.assigneeId).name})`;
        },
        cell: ({ row }) => {
          const req = row.original;
          const step = currentStep(req);
          if (!step) {
            return <span className="text-xs text-muted-foreground">—</span>;
          }
          const owner = personById(step.assigneeId);
          const isMe = step.assigneeId === currentUserId && req.status === "in_review";

          if (isMe) {
            return (
              <span className="inline-flex items-center gap-1.5 font-bold text-[#003D96] bg-[#F2F7FF] px-2.5 py-1 rounded-full border border-[#003D96]/30 text-xs shadow-2xs whitespace-nowrap">
                <span className="size-1.5 rounded-full bg-[#003D96] animate-pulse" />
                Your Turn
              </span>
            );
          }

          return (
            <div className="text-xs min-w-0">
              <span className="font-medium text-foreground block truncate">{step.name}</span>
              <span className="text-[11px] text-muted-foreground block truncate">With {owner.name}</span>
            </div>
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
                variant={isMe ? "default" : "outline"}
                size="sm"
                className={cn(
                  "font-semibold text-xs h-8 px-2.5",
                  isMe && "bg-[#003D96] hover:bg-[#002D70] text-white"
                )}
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
      trailing: filterPillsTrailing,
      items: [
        {
          value: "in_review",
          label: "Waiting on approval",
          count: countsByStatus.in_review,
          activeClassName: "bg-[#003D96] text-white hover:bg-[#002D70] shadow-2xs",
        },
        {
          value: "approved",
          label: "Completed",
          count: countsByStatus.approved,
          activeClassName: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs",
        },
        {
          value: "changes_requested",
          label: "Changes requested",
          count: countsByStatus.changes_requested,
          activeClassName: "bg-amber-600 text-white hover:bg-amber-700 shadow-2xs",
        },
        {
          value: "rejected",
          label: "Rejected",
          count: countsByStatus.rejected,
          activeClassName: "bg-rose-600 text-white hover:bg-rose-700 shadow-2xs",
        },
      ],
    }),
    [requests.length, countsByStatus, filterPillsTrailing],
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
            <div className="flex items-center gap-2 flex-wrap">
              <span className="size-7 rounded-lg bg-[#F2F7FF] border border-[#003D96]/15 flex items-center justify-center shrink-0">
                {getCategoryIcon(req.type)}
              </span>
              <span className="font-mono text-xs font-semibold text-[#003D96]">{req.code}</span>
              <span className="text-sm font-bold text-foreground truncate">{req.title}</span>
            </div>
          }
          subtitle={`${req.valueLabel ? `${req.valueLabel} · ` : ""}${req.type} · By ${requester.name}`}
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
              label: "Stage / Turn",
              value: isMe ? (
                <span className="inline-flex items-center gap-1 font-bold text-[#003D96] bg-[#F2F7FF] px-2 py-0.5 rounded-full border border-[#003D96]/30 text-xs">
                  <span className="size-1.5 rounded-full bg-[#003D96] animate-pulse" />
                  Your Turn ({step?.name})
                </span>
              ) : (
                <span>
                  {step?.name ?? "Completed"}
                  {owner && (
                    <span className="text-muted-foreground font-normal">
                      {" "}· With {owner.name}
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
            <Button
              asChild
              variant={isMe ? "default" : "outline"}
              size="sm"
              className={cn(
                "font-semibold text-xs h-8 px-3",
                isMe && "bg-[#003D96] hover:bg-[#002D70] text-white"
              )}
            >
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
