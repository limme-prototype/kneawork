import type * as React from "react";
import type {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  RowSelectionState,
  SortingState,
  Table as TanStackTable,
  VisibilityState,
} from "@tanstack/react-table";

export type DataTableMode = "table" | "cards" | "auto";

export interface DataTableQueryState {
  pagination: PaginationState;
  sorting: SortingState;
  globalFilter: string;
  columnFilters: ColumnFiltersState;
  columnVisibility: VisibilityState;
}

export interface DataTableFilterOption {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  count?: number;
}

export interface DataTableFilterableColumn {
  id: string;
  title: string;
  options: DataTableFilterOption[];
  singleSelect?: boolean;
}

export interface DataTableBulkAction<TData> {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: "default" | "secondary" | "destructive" | "outline";
  onClick: (selectedRows: TData[], clearSelection: () => void) => void | Promise<void>;
  disabled?: boolean;
}

export interface DataTableFilterPillsConfig {
  columnId: string;
  allLabel?: string | undefined;
  allCount?: number | undefined;
  items: Array<{
    value: string;
    label: string;
    count?: number | undefined;
    activeClassName?: string | undefined;
  }>;
  trailing?: React.ReactNode | undefined;
}

export interface DataTableProps<TData, TValue = unknown> {
  tableId?: string | undefined;
  data: TData[];
  columns: ColumnDef<TData, TValue>[];
  getRowId?: ((row: TData) => string) | undefined;

  /** Display mode: "table" (force table), "cards" (force mobile cards), or "auto" (table on md+, cards on mobile) */
  mode?: DataTableMode | undefined;

  /** Server-side flags */
  manualPagination?: boolean | undefined;
  manualSorting?: boolean | undefined;
  manualFiltering?: boolean | undefined;
  rowCount?: number | undefined;

  /** Controlled state */
  state?: Partial<DataTableQueryState> | undefined;
  onStateChange?: ((state: DataTableQueryState) => void) | undefined;

  sorting?: SortingState | undefined;
  onSortingChange?: ((sorting: SortingState) => void) | undefined;
  globalFilter?: string | undefined;
  onGlobalFilterChange?: ((filter: string) => void) | undefined;
  columnFilters?: ColumnFiltersState | undefined;
  onColumnFiltersChange?: ((filters: ColumnFiltersState) => void) | undefined;
  pagination?: PaginationState | undefined;
  onPaginationChange?: ((pagination: PaginationState) => void) | undefined;

  /** Selection & Bulk Actions */
  enableRowSelection?: boolean | ((row: TData) => boolean) | undefined;
  onRowSelectionChange?: ((selection: RowSelectionState) => void) | undefined;
  bulkActions?: ((rows: TData[], clearSelection: () => void) => React.ReactNode) | undefined;

  /** Mobile rendering */
  renderMobileCard?: ((row: TData, index: number) => React.ReactNode) | undefined;

  /** Search & Filter configuration */
  searchPlaceholder?: string | undefined;
  filterableColumns?: DataTableFilterableColumn[] | undefined;
  filterPills?: DataTableFilterPillsConfig | undefined;
  toolbar?: React.ReactNode | undefined;
  onRefresh?: (() => void) | undefined;

  /** Empty & Loading states */
  isLoading?: boolean | undefined;
  error?: Error | string | React.ReactNode | null | undefined;
  onRetry?: (() => void) | undefined;
  emptyTitle?: string | undefined;
  emptyDescription?: string | undefined;
  emptyAction?: React.ReactNode | undefined;
  isFiltered?: boolean | undefined;
  onClearFilters?: (() => void) | undefined;

  /** Visibility & Customization */
  hideToolbar?: boolean | undefined;
  hidePagination?: boolean | undefined;
  hideViewOptions?: boolean | undefined;
  className?: string | undefined;
  onRowClick?: ((row: TData) => void) | undefined;
  getRowOpenLabel?: ((row: TData) => string) | undefined;
}
