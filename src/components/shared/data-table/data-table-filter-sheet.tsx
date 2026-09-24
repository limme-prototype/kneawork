import * as React from "react";
import type { Table } from "@tanstack/react-table";
import { Filter, RotateCcw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { DataTableFilterableColumn } from "./data-table-types";
import { cn } from "@/lib/utils";

interface DataTableFilterSheetProps<TData> {
  table: Table<TData>;
  filterableColumns: DataTableFilterableColumn[];
}

export function DataTableFilterSheet<TData>({
  table,
  filterableColumns,
}: DataTableFilterSheetProps<TData>) {
  const [open, setOpen] = React.useState(false);

  // Calculate active filter count across all filterable columns
  const activeFiltersCount = React.useMemo(() => {
    let count = 0;
    for (const col of filterableColumns) {
      const filterValue = table.getColumn(col.id)?.getFilterValue();
      if (Array.isArray(filterValue) && filterValue.length > 0) {
        count += filterValue.length;
      } else if (typeof filterValue === "string" && filterValue.trim()) {
        count += 1;
      }
    }
    return count;
  }, [table, filterableColumns]);

  const handleClearAll = () => {
    for (const col of filterableColumns) {
      table.getColumn(col.id)?.setFilterValue(undefined);
    }
  };

  const handleToggleOption = (columnId: string, optionValue: string, singleSelect?: boolean) => {
    const column = table.getColumn(columnId);
    if (!column) return;

    const current = column.getFilterValue();

    if (singleSelect) {
      if (current === optionValue) {
        column.setFilterValue(undefined);
      } else {
        column.setFilterValue(optionValue);
      }
      return;
    }

    const currentArray = Array.isArray(current) ? [...current] : current ? [current] : [];
    const index = currentArray.indexOf(optionValue);
    if (index >= 0) {
      currentArray.splice(index, 1);
    } else {
      currentArray.push(optionValue);
    }

    column.setFilterValue(currentArray.length > 0 ? currentArray : undefined);
  };

  const isOptionSelected = (columnId: string, optionValue: string, singleSelect?: boolean) => {
    const column = table.getColumn(columnId);
    if (!column) return false;
    const current = column.getFilterValue();

    if (singleSelect) {
      return current === optionValue;
    }
    if (Array.isArray(current)) {
      return current.includes(optionValue);
    }
    return current === optionValue;
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs font-medium relative"
        >
          <Filter className="size-3.5" />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <Badge
              variant="default"
              className="ml-1 size-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-primary text-primary-foreground"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="p-4 sm:p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-base font-semibold">Filter records</SheetTitle>
            {activeFiltersCount > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1 px-2"
              >
                <RotateCcw className="size-3" />
                Reset
              </Button>
            )}
          </div>
          <SheetDescription className="text-xs text-muted-foreground">
            Narrow down your data by selecting one or more attributes below.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {filterableColumns.map((col) => {
            return (
              <div key={col.id} className="space-y-2.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                  {col.title}
                </label>
                <div className="flex flex-wrap gap-2">
                  {col.options.map((opt) => {
                    const selected = isOptionSelected(col.id, opt.value, col.singleSelect);
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleToggleOption(col.id, opt.value, col.singleSelect)}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer",
                          selected
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background text-foreground border-border hover:bg-muted",
                        )}
                      >
                        {selected ? (
                          <Check className="size-3" />
                        ) : Icon ? (
                          <Icon className="size-3 text-muted-foreground" />
                        ) : null}
                        <span>{opt.label}</span>
                        {typeof opt.count === "number" && (
                          <span
                            className={cn(
                              "text-[10px] ml-1 px-1.5 py-0.2 rounded-full",
                              selected
                                ? "bg-primary-foreground/20 text-primary-foreground"
                                : "bg-muted text-muted-foreground",
                            )}
                          >
                            {opt.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <SheetFooter className="p-4 sm:p-6 border-t border-border mt-auto flex-row justify-end gap-2">
          <Button
            type="button"
            className="w-full sm:w-auto font-semibold"
            onClick={() => setOpen(false)}
          >
            Apply filters ({activeFiltersCount})
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
