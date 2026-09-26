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
          "h-8 min-h-[32px] px-3 text-xs font-semibold rounded-full shrink-0 transition-all gap-1.5",
          isAll
            ? "bg-[#003D96] text-white hover:bg-[#002D70] shadow-2xs"
            : "text-muted-foreground hover:text-foreground hover:bg-muted border border-border/80",
        )}
      >
        <span>{allLabel}</span>
        {allCount !== undefined && (
          <span
            className={cn(
              "inline-flex items-center justify-center min-w-[20px] h-4.5 px-1.5 rounded-full text-[11px] font-mono font-bold transition-colors",
              isAll
                ? "bg-white/20 text-white"
                : "bg-muted text-muted-foreground",
            )}
          >
            {allCount}
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
              "h-8 min-h-[32px] px-3 text-xs font-semibold rounded-full shrink-0 transition-all gap-1.5",
              isActive
                ? (item.activeClassName ?? "bg-[#003D96] text-white hover:bg-[#002D70] shadow-2xs")
                : "text-muted-foreground hover:text-foreground hover:bg-muted border border-border/80",
            )}
          >
            <span>{item.label}</span>
            {item.count !== undefined && (
              <span
                className={cn(
                  "inline-flex items-center justify-center min-w-[20px] h-4.5 px-1.5 rounded-full text-[11px] font-mono font-bold transition-colors",
                  isActive
                    ? "bg-white/25 text-white"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {item.count}
              </span>
            )}
          </Button>
        );
      })}
    </div>
  );
}
