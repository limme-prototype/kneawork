import * as React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface DataTableBulkActionItem<TData> {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: "default" | "secondary" | "destructive" | "outline";
  onClick: (selectedRows: TData[], clearSelection: () => void) => void | Promise<void>;
  disabled?: boolean;
}

export interface DataTableSelectionToolbarProps<TData> {
  selectedCount: number;
  selectedRows: TData[];
  onClearSelection: () => void;
  actions?:
    React.ReactNode | ((selectedRows: TData[], clearSelection: () => void) => React.ReactNode);
  className?: string;
}

export function DataTableSelectionToolbar<TData>({
  selectedCount,
  selectedRows,
  onClearSelection,
  actions,
  className,
}: DataTableSelectionToolbarProps<TData>) {
  if (selectedCount === 0) return null;

  return (
    <div
      role="region"
      aria-label="Bulk actions toolbar"
      className={cn(
        "fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 rounded-xl border border-border bg-popover/95 px-4 py-2.5 shadow-lg backdrop-blur-sm animate-in fade-in-50 slide-in-from-bottom-4 max-w-[calc(100vw-2rem)]",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-r border-border pr-3">
        <span className="text-xs font-semibold tabular-nums text-foreground">{selectedCount}</span>
        <span className="text-xs text-muted-foreground hidden sm:inline">selected</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground ml-1"
          aria-label="Clear selection"
        >
          <X className="size-3.5" />
        </Button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto">
        {typeof actions === "function" ? actions(selectedRows, onClearSelection) : actions}
      </div>
    </div>
  );
}
