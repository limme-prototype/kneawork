"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type Row,
  type RowSelectionState,
  type SortingState,
  type Table as TanStackTable,
  type VisibilityState,
  type OnChangeFn,
} from "@tanstack/react-table";

import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTableToolbar } from "./data-table-toolbar";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableSelectionToolbar } from "./data-table-selection-toolbar";
import { DataTableEmpty } from "./data-table-empty";
import { DataTableLoadingRows, DataTableLoadingCards } from "./data-table-loading";
import { DataTableErrorState } from "./data-table-error";
import { DataTableMobileList } from "./data-table-mobile-list";
import type { DataTableProps } from "./data-table-types";

const DEFAULT_PAGINATION: PaginationState = { pageIndex: 0, pageSize: 10 };

function useControllableState<T>(
  controlledValue: T | undefined,
  onChange: ((value: T) => void) | undefined,
  defaultValue: T,
): [T, OnChangeFn<T>] {
  const [internalValue, setInternalValue] = React.useState<T>(defaultValue);
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const setValue: OnChangeFn<T> = React.useCallback(
    (updater) => {
      const next = typeof updater === "function" ? (updater as (old: T) => T)(value) : updater;
      if (onChange) {
        onChange(next);
      } else {
        setInternalValue(next);
      }
    },
    [onChange, value],
  );

  return [value, setValue];
}

export function DataTable<TData, TValue = unknown>({
  tableId,
  data,
  columns,
  getRowId,
  mode = "auto",
  manualPagination = false,
  manualSorting = false,
  manualFiltering = false,
  rowCount,
  sorting: controlledSorting,
  onSortingChange,
  globalFilter: controlledGlobalFilter,
  onGlobalFilterChange,
  columnFilters: controlledColumnFilters,
  onColumnFiltersChange,
  pagination: controlledPagination,
  onPaginationChange,
  enableRowSelection = false,
  onRowSelectionChange,
  bulkActions,
  renderMobileCard,
  searchPlaceholder,
  filterableColumns,
  filterPills,
  toolbar,
  onRefresh,
  isLoading = false,
  error = null,
  onRetry,
  emptyTitle,
  emptyDescription,
  emptyAction,
  isFiltered: controlledIsFiltered,
  onClearFilters,
  hideToolbar = false,
  hidePagination = false,
  hideViewOptions = false,
  className,
  onRowClick,
  getRowOpenLabel,
}: DataTableProps<TData, TValue>) {
  // Selection state
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  // Sorting state
  const [sorting, setSorting] = useControllableState<SortingState>(
    controlledSorting,
    onSortingChange,
    [],
  );

  // Global search filter state
  const [globalFilter, setGlobalFilter] = useControllableState<string>(
    controlledGlobalFilter,
    onGlobalFilterChange,
    "",
  );

  // Column filters state
  const [columnFilters, setColumnFilters] = useControllableState<ColumnFiltersState>(
    controlledColumnFilters,
    onColumnFiltersChange,
    [],
  );

  // Pagination state
  const [pagination, setPagination] = useControllableState<PaginationState>(
    controlledPagination,
    onPaginationChange,
    DEFAULT_PAGINATION,
  );

  // Visibility state
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

  // Handle external row selection change notifications
  React.useEffect(() => {
    if (onRowSelectionChange) {
      onRowSelectionChange(rowSelection);
    }
  }, [rowSelection, onRowSelectionChange]);

  // Checkbox selection column injection
  const selectColumn = React.useMemo<ColumnDef<TData, TValue>>(
    () => ({
      id: "select",
      enableSorting: false,
      enableHiding: false,
      header: ({ table }) => (
        <div className="flex items-center px-1" data-no-row-click>
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(val) => table.toggleAllPageRowsSelected(Boolean(val))}
            aria-label="Select all rows"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center px-1" data-no-row-click>
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(val) => row.toggleSelected(Boolean(val))}
            aria-label="Select row"
          />
        </div>
      ),
    }),
    [],
  );

  const effectiveColumns = React.useMemo(() => {
    const cols = filterableColumns?.length
      ? columns.map((col) => {
          const anyCol = col as { accessorKey?: string; id?: string };
          const isFilterable = filterableColumns.some(
            (fc) => fc.id === anyCol.id || fc.id === anyCol.accessorKey,
          );
          if (isFilterable && !col.filterFn) {
            return {
              ...col,
              filterFn: (row: Row<TData>, columnId: string, filterValue: unknown) => {
                const cellValue = row.getValue(columnId);
                if (filterValue === undefined || filterValue === null || filterValue === "")
                  return true;
                if (Array.isArray(filterValue)) {
                  if (filterValue.length === 0) return true;
                  return filterValue.includes(cellValue);
                }
                return cellValue === filterValue;
              },
            } as ColumnDef<TData, TValue>;
          }
          return col;
        })
      : columns;

    if (enableRowSelection) {
      return [selectColumn, ...cols];
    }
    return cols;
  }, [enableRowSelection, selectColumn, columns, filterableColumns]);

  // TanStack Table Instance
  const table = useReactTable<TData>({
    data,
    columns: effectiveColumns,
    getRowId: getRowId
      ? getRowId
      : (row: TData, index: number) => {
          const anyRow = row as Record<string, unknown>;
          return anyRow["id"] !== undefined ? String(anyRow["id"]) : String(index);
        },
    state: {
      sorting,
      globalFilter,
      columnFilters,
      columnVisibility,
      pagination,
      rowSelection,
    },
    enableRowSelection:
      typeof enableRowSelection === "function"
        ? (row: Row<TData>) => (enableRowSelection as (item: TData) => boolean)(row.original)
        : Boolean(enableRowSelection),
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    ...(manualPagination || manualSorting || manualFiltering
      ? {
          manualPagination,
          manualSorting,
          manualFiltering,
          ...(rowCount !== undefined ? { rowCount } : {}),
          autoResetPageIndex: false,
          getCoreRowModel: getCoreRowModel(),
        }
      : {
          getCoreRowModel: getCoreRowModel(),
          getSortedRowModel: getSortedRowModel(),
          getFilteredRowModel: getFilteredRowModel(),
          getPaginationRowModel: getPaginationRowModel(),
        }),
  });

  const isFiltered =
    controlledIsFiltered !== undefined
      ? controlledIsFiltered
      : columnFilters.length > 0 || Boolean(globalFilter);

  const handleClearFilters = () => {
    if (onClearFilters) {
      onClearFilters();
    } else {
      table.resetColumnFilters();
      table.setGlobalFilter("");
    }
  };

  const handleRowClick = (row: Row<TData>, event: React.MouseEvent<HTMLTableRowElement>) => {
    if (!onRowClick) return;
    const target = event.target as HTMLElement;
    if (
      target.closest(
        "button, a, input, select, textarea, label, [role='menuitem'], [data-no-row-click]",
      )
    ) {
      return;
    }
    onRowClick(row.original);
  };

  const handleRowKeyDown = (row: Row<TData>, event: React.KeyboardEvent<HTMLTableRowElement>) => {
    if (!onRowClick) return;
    if (event.key === "Enter" || event.key === " ") {
      const target = event.target as HTMLElement;
      if (
        target.closest(
          "button, a, input, select, textarea, label, [role='menuitem'], [data-no-row-click]",
        )
      ) {
        return;
      }
      event.preventDefault();
      onRowClick(row.original);
    }
  };

  const selectedRows = table.getSelectedRowModel().rows.map((r) => r.original);

  return (
    <div className={cn("space-y-3 relative", className)}>
      {/* Table Toolbar */}
      {!hideToolbar && (
        <DataTableToolbar
          table={table}
          searchPlaceholder={searchPlaceholder}
          filterableColumns={filterableColumns}
          filterPills={filterPills}
          hideViewOptions={hideViewOptions}
          onRefresh={onRefresh}
          toolbar={toolbar}
        />
      )}

      {/* Main Content Area */}
      <div className="rounded-lg border border-border bg-card shadow-2xs overflow-hidden">
        {/* Error State */}
        {error ? (
          <DataTableErrorState error={error} onRetry={onRetry} />
        ) : (
          <>
            {/* Desktop Table: visible on md+ if mode is "auto", or always if mode is "table" */}
            <div
              className={cn(
                mode === "auto" && "hidden md:block",
                mode === "cards" && "hidden",
                "overflow-x-auto",
              )}
            >
              <Table>
                <TableHeader className="bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id} className="py-3 px-3">
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody className="divide-y divide-border text-sm">
                  {isLoading ? (
                    <DataTableLoadingRows
                      columnsCount={effectiveColumns.length}
                      rowCount={pagination.pageSize || 5}
                    />
                  ) : table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                        className={cn(
                          "transition-colors",
                          onRowClick &&
                            "cursor-pointer hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                        )}
                        tabIndex={onRowClick ? 0 : undefined}
                        onClick={(e) => handleRowClick(row, e)}
                        onKeyDown={(e) => handleRowKeyDown(row, e)}
                        aria-label={getRowOpenLabel ? getRowOpenLabel(row.original) : undefined}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="py-3 px-3 align-middle">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={effectiveColumns.length} className="p-0 border-0">
                        <DataTableEmpty
                          isFiltered={isFiltered}
                          title={emptyTitle}
                          description={emptyDescription}
                          action={emptyAction}
                          onClearFilters={handleClearFilters}
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards / List: visible on < md if mode is "auto", or always if mode is "cards" */}
            <div className={cn(mode === "auto" && "block md:hidden", mode === "table" && "hidden")}>
              {isLoading ? (
                <DataTableLoadingCards count={4} />
              ) : table.getRowModel().rows.length > 0 ? (
                <DataTableMobileList
                  table={table}
                  renderMobileCard={renderMobileCard}
                  onRowClick={onRowClick}
                />
              ) : (
                <DataTableEmpty
                  isFiltered={isFiltered}
                  title={emptyTitle}
                  description={emptyDescription}
                  action={emptyAction}
                  onClearFilters={handleClearFilters}
                />
              )}
            </div>
          </>
        )}

        {/* Bottom Pagination */}
        {!hidePagination && !error && <DataTablePagination table={table} />}
      </div>

      {/* Floating Selection Toolbar (Bulk Actions) */}
      {enableRowSelection && bulkActions && selectedRows.length > 0 && (
        <DataTableSelectionToolbar
          selectedCount={selectedRows.length}
          selectedRows={selectedRows}
          onClearSelection={() => setRowSelection({})}
          actions={bulkActions}
        />
      )}
    </div>
  );
}
