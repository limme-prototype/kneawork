import * as React from "react";
import { SearchX, Inbox, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface DataTableEmptyProps {
  isFiltered?: boolean | undefined;
  title?: string | undefined;
  description?: string | undefined;
  action?: React.ReactNode | undefined;
  onClearFilters?: (() => void) | undefined;
}

export function DataTableEmpty({
  isFiltered = false,
  title,
  description,
  action,
  onClearFilters,
}: DataTableEmptyProps) {
  if (isFiltered) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center animate-in fade-in-50">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
          <SearchX className="size-6" />
        </div>
        <h3 className="text-base font-semibold text-foreground">
          {title || "No matching records found"}
        </h3>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-sm">
          {description ||
            "Try adjusting your search keywords or clearing active filters to see results."}
        </p>
        <div className="mt-4 flex items-center gap-2">
          {onClearFilters && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="text-xs h-8 gap-1.5"
            >
              <RotateCcw className="size-3.5" />
              Reset filters
            </Button>
          )}
          {action}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center animate-in fade-in-50">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
        <Inbox className="size-6" />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title || "No records yet"}</h3>
      <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-sm">
        {description || "Get started by adding your first record using the action above."}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
