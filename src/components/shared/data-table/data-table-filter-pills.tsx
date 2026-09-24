import * as React from "react";
import type { Column } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface DataTableFilterPillItem {
  value: string;
  label: string;
  count?: number | undefined;
  activeClassName?: string | undefined;
}

interface DataTableFilterPillsProps<TData, TValue> {
  column?: Column<TData, TValue> | undefined;
  allLabel?: string | undefined;
  allCount?: number | undefined;
  items: DataTableFilterPillItem[];
  className?: string | undefined;
}

export function DataTableFilterPills<TData, TValue>({
  column,
  allLabel = "All",
  allCount,
  items,
  className,
}: DataTableFilterPillsProps<TData, TValue>) {
  const currentFilter = column?.getFilterValue();

  const activeValue =
    typeof currentFilter === "string"
      ? currentFilter
      : Array.isArray(currentFilter) && currentFilter.length === 1
        ? currentFilter[0]
        : "all";

  const isAll = !currentFilter || activeValue === "all";

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs",
        className,
      )}
    >
      <Button
        type="button"
        size="sm"
        variant={isAll ? "default" : "outline"}
        onClick={() => column?.setFilterValue(undefined)}
        className={cn(
          "h-7 min-h-[28px] px-2.5 text-xs font-semibold rounded-md shrink-0 transition-colors",
          isAll
            ? "bg-primary text-primary-foreground shadow-2xs"
            : "text-muted-foreground hover:text-foreground hover:bg-muted",
        )}
      >
        <span>{allLabel}</span>
        {allCount !== undefined && (
          <span
            className={cn(
              "ml-1 text-[11px] font-mono",
              isAll ? "text-primary-foreground/90" : "text-muted-foreground",
            )}
          >
            ({allCount})
          </span>
        )}
      </Button>

      {items.map((item) => {
        const isActive = activeValue === item.value;
        return (
          <Button
            key={item.value}
            type="button"
            size="sm"
            variant={isActive ? "default" : "outline"}
            onClick={() => {
              if (isActive) {
                column?.setFilterValue(undefined);
              } else {
                column?.setFilterValue(item.value);
              }
            }}
            className={cn(
              "h-7 min-h-[28px] px-2.5 text-xs font-semibold rounded-md shrink-0 transition-colors",
              isActive
                ? (item.activeClassName ?? "bg-primary text-primary-foreground shadow-2xs")
                : "text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
          >
            <span>{item.label}</span>
            {item.count !== undefined && (
              <span
                className={cn(
                  "ml-1 text-[11px] font-mono",
                  isActive ? "opacity-90" : "text-muted-foreground",
                )}
              >
                ({item.count})
              </span>
            )}
          </Button>
        );
      })}
    </div>
  );
}
