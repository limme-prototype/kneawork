import * as React from "react";
import type { Table } from "@tanstack/react-table";
import { Search, X, RotateCcw, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./data-table-column-visibility";
import { DataTableFilterSheet } from "./data-table-filter-sheet";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { DataTableFilterPills } from "./data-table-filter-pills";
import type { DataTableFilterableColumn, DataTableFilterPillsConfig } from "./data-table-types";
import { cn } from "@/lib/utils";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  searchPlaceholder?: string | undefined;
  filterableColumns?: DataTableFilterableColumn[] | undefined;
  filterPills?: DataTableFilterPillsConfig | undefined;
  hideViewOptions?: boolean | undefined;
  onRefresh?: (() => void) | undefined;
  toolbar?: React.ReactNode | undefined;
  className?: string | undefined;
}

export function DataTableToolbar<TData>({
  table,
  searchPlaceholder = "Search records...",
  filterableColumns = [],
  filterPills,
  hideViewOptions = false,
  onRefresh,
  toolbar,
  className,
}: DataTableToolbarProps<TData>) {
  const isFiltered =
    table.getState().columnFilters.length > 0 || Boolean(table.getState().globalFilter);

  const globalFilter = (table.getState().globalFilter as string) ?? "";

  const handleClearFilters = () => {
    table.resetColumnFilters();
    table.setGlobalFilter("");
  };

  const pillColumn = filterPills ? table.getColumn(filterPills.columnId) : undefined;

  // Exclude columns that are already rendered as primary filter pills above to prevent duplication
  const facetColumns = React.useMemo(
    () => filterableColumns.filter((col) => !filterPills || col.id !== filterPills.columnId),
    [filterableColumns, filterPills],
  );

  return (
    <div className={cn("space-y-2.5 py-1", className)}>
      {/* Primary Category / Status Pills Row if configured */}
      {filterPills && (
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-0.5">
          <DataTableFilterPills
            column={pillColumn}
            allLabel={filterPills.allLabel}
            allCount={filterPills.allCount}
            items={filterPills.items}
          />
        </div>
      )}

      {/* Main Toolbar Actions Row */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        {/* Left side: Search & Facet Filters */}
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative w-full sm:w-64 md:w-72">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={globalFilter}
              onChange={(e) => table.setGlobalFilter(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-8 pl-8 pr-7 text-xs bg-background placeholder:text-muted-foreground/80 focus-visible:ring-1"
            />
            {globalFilter && (
              <button
                type="button"
                onClick={() => table.setGlobalFilter("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                aria-label="Clear search"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Desktop Faceted Filters (popover with command search & checkboxes) */}
          {facetColumns.length > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 flex-wrap">
              {facetColumns.map((col) => {
                const column = table.getColumn(col.id);
                if (!column) return null;
                return (
                  <DataTableFacetedFilter
                    key={col.id}
                    column={column}
                    title={col.title}
                    options={col.options}
                    singleSelect={col.singleSelect}
                  />
                );
              })}
            </div>
          )}

          {/* Mobile Filter Sheet (drawer with all facet sections) */}
          {filterableColumns.length > 0 && (
            <div className="sm:hidden">
              <DataTableFilterSheet table={table} filterableColumns={filterableColumns} />
            </div>
          )}

          {/* Reset button when filters are active */}
          {isFiltered && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
            >
              <RotateCcw className="size-3.5" />
              <span>Reset</span>
            </Button>
          )}
        </div>

        {/* Right side: Refresh, View Options, and Custom Actions */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {onRefresh && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="h-8 px-2.5 text-xs gap-1.5 font-medium"
              title="Refresh table"
              aria-label="Refresh table"
            >
              <RefreshCw className="size-3.5" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          )}

          {!hideViewOptions && <DataTableViewOptions table={table} />}

          {toolbar && <div className="flex items-center gap-2">{toolbar}</div>}
        </div>
      </div>
    </div>
  );
}
