import * as React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface DataTableErrorProps {
  error: Error | string | React.ReactNode;
  onRetry?: (() => void) | undefined;
}

export function DataTableErrorState({ error, onRetry }: DataTableErrorProps) {
  const errorMessage =
    error instanceof Error ? error.message : typeof error === "string" ? error : null;

  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center animate-in fade-in-50">
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-3">
        <AlertCircle className="size-6" />
      </div>
      <h3 className="text-base font-semibold text-foreground">Failed to load table data</h3>
      <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-sm">
        {errorMessage || "An unexpected error occurred while fetching records. Please try again."}
      </p>
      {typeof error !== "string" && !(error instanceof Error) && error}
      {onRetry && (
        <div className="mt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="text-xs h-8 gap-1.5"
          >
            <RotateCcw className="size-3.5" />
            Retry
          </Button>
        </div>
      )}
    </div>
  );
}
