import * as React from "react";
import type { Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, EyeOff, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DataTableColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
  enableHide?: boolean | undefined;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  enableHide = false,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return (
      <div className={cn("text-xs font-semibold text-muted-foreground", className)}>{title}</div>
    );
  }

  const isSorted = column.getIsSorted();

  const handleToggleSort = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSorted === "asc") {
      column.toggleSorting(true); // Toggle to desc
    } else if (isSorted === "desc") {
      column.clearSorting(); // Clear
    } else {
      column.toggleSorting(false); // Toggle to asc
    }
  };

  return (
    <div className={cn("group inline-flex items-center space-x-1", className)}>
      <button
        type="button"
        onClick={handleToggleSort}
        className={cn(
          "inline-flex items-center gap-1.5 py-1 text-xs font-semibold rounded transition-colors cursor-pointer select-none",
          isSorted ? "text-foreground font-bold" : "text-muted-foreground hover:text-foreground",
        )}
        title={`Sort by ${title}`}
      >
        <span>{title}</span>
        {isSorted === "desc" ? (
          <ArrowDown className="size-3.5 text-primary" />
        ) : isSorted === "asc" ? (
          <ArrowUp className="size-3.5 text-primary" />
        ) : (
          <ArrowUpDown className="size-3 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </button>

      {enableHide && column.getCanHide() && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="size-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
              aria-label={`Options for ${title}`}
            >
              <MoreVertical className="size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-36">
            <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
              <ArrowUp className="mr-2 size-3.5 text-muted-foreground/70" />
              Sort Asc
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
              <ArrowDown className="mr-2 size-3.5 text-muted-foreground/70" />
              Sort Desc
            </DropdownMenuItem>
            {isSorted && (
              <DropdownMenuItem onClick={() => column.clearSorting()}>
                <ArrowUpDown className="mr-2 size-3.5 text-muted-foreground/70" />
                Clear sort
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
              <EyeOff className="mr-2 size-3.5 text-muted-foreground/70" />
              Hide column
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
