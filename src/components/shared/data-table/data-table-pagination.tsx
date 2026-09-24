import * as React from "react";
import type { Table } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  pageSizeOptions?: number[];
  className?: string;
}

/**
 * Calculates page numbers to display with smart ellipsis for larger page counts.
 */
function getPaginationItems(currentPage: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  const items: (number | "ellipsis")[] = [0];

  const start = Math.max(1, currentPage - 1);
  const end = Math.min(totalPages - 2, currentPage + 1);

  if (start > 1) {
    items.push("ellipsis");
  }

  for (let i = start; i <= end; i++) {
    items.push(i);
  }

  if (end < totalPages - 2) {
    items.push("ellipsis");
  }

  items.push(totalPages - 1);
  return items;
}

export function DataTablePagination<TData>({
  table,
  pageSizeOptions = [10, 20, 25, 50],
  className,
}: DataTablePaginationProps<TData>) {
  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const totalCount = table.getFilteredRowModel().rows.length;
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const pageCount = table.getPageCount();

  const startRecord = totalCount === 0 ? 0 : pageIndex * pageSize + 1;
  const endRecord = Math.min((pageIndex + 1) * pageSize, totalCount);

  const pageItems = React.useMemo(
    () => getPaginationItems(pageIndex, pageCount),
    [pageIndex, pageCount],
  );

  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-3 py-2.5 border-t border-border bg-card/60",
        className,
      )}
    >
      {/* Left side: Records status or selection badge */}
      <div className="flex items-center text-xs text-muted-foreground min-w-0">
        {selectedCount > 0 ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 text-primary font-semibold">
            <CheckCircle2 className="size-3.5" />
            <span>
              {selectedCount} of {totalCount} row(s) selected
            </span>
          </span>
        ) : (
          <span className="truncate">
            Showing <span className="font-semibold text-foreground">{startRecord}</span>–
            <span className="font-semibold text-foreground">{endRecord}</span> of{" "}
            <span className="font-semibold text-foreground">{totalCount}</span> records
          </span>
        )}
      </div>

      {/* Right side: Page size selector and page navigation */}
      <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 sm:gap-4">
        {/* Page size dropdown */}
        <div className="flex items-center space-x-2">
          <label
            htmlFor="rows-per-page"
            className="text-xs font-medium text-muted-foreground whitespace-nowrap"
          >
            Rows per page
          </label>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger
              id="rows-per-page"
              className="h-8 w-[68px] text-xs font-medium bg-background"
            >
              <SelectValue placeholder={`${pageSize}`} />
            </SelectTrigger>
            <SelectContent side="top" align="end">
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={`${size}`} className="text-xs font-medium">
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page number buttons & prev/next */}
        <div className="flex items-center space-x-1">
          {/* First Page (only shown if pageCount > 5) */}
          {pageCount > 5 && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="hidden lg:inline-flex size-8 p-0"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              aria-label="First page"
            >
              <ChevronsLeft className="size-4" />
            </Button>
          )}

          {/* Previous Button */}
          <Button
            type="button"
            variant="outline"
            className="h-8 min-h-[32px] sm:min-h-0 px-2.5 text-xs font-semibold gap-1 text-foreground"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-3.5" />
            <span className="hidden sm:inline">Previous</span>
          </Button>

          {/* Interactive numeric page buttons (hidden on mobile, rendered on desktop) */}
          <div className="hidden sm:flex items-center space-x-1">
            {pageCount <= 1 ? (
              <span className="px-2 text-xs font-medium text-muted-foreground">Page 1 of 1</span>
            ) : (
              pageItems.map((item, idx) => {
                if (item === "ellipsis") {
                  return (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-1.5 text-xs text-muted-foreground/60 select-none"
                    >
                      …
                    </span>
                  );
                }

                const isActive = item === pageIndex;
                return (
                  <Button
                    key={item}
                    type="button"
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "size-8 p-0 text-xs font-semibold transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-2xs hover:bg-primary-hover"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    )}
                    onClick={() => table.setPageIndex(item)}
                    aria-label={`Go to page ${item + 1}`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {item + 1}
                  </Button>
                );
              })
            )}
          </div>

          {/* Mobile Current Page Indicator (< sm) */}
          <span className="sm:hidden px-2 text-xs font-medium text-foreground">
            {pageCount === 0 ? 0 : pageIndex + 1}/{pageCount}
          </span>

          {/* Next Button */}
          <Button
            type="button"
            variant="outline"
            className="h-8 min-h-[32px] sm:min-h-0 px-2.5 text-xs font-semibold gap-1 text-foreground"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Next page"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="size-3.5" />
          </Button>

          {/* Last Page (only shown if pageCount > 5) */}
          {pageCount > 5 && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="hidden lg:inline-flex size-8 p-0"
              onClick={() => table.setPageIndex(pageCount - 1)}
              disabled={!table.getCanNextPage()}
              aria-label="Last page"
            >
              <ChevronsRight className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
