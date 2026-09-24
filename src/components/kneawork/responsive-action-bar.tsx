import type * as React from "react";
import { cn } from "@/lib/utils";

export interface ResponsiveActionBarProps {
  primary: React.ReactNode;
  secondary?: React.ReactNode | undefined;
  destructive?: React.ReactNode | undefined;
  status?: React.ReactNode | undefined;
  className?: string | undefined;
}

export function ResponsiveActionBar({
  primary,
  secondary,
  destructive,
  status,
  className,
}: ResponsiveActionBarProps) {
  return (
    <div
      role="region"
      aria-label="Workflow Actions"
      className={cn(
        "fixed sm:sticky bottom-0 inset-x-0 z-30 w-full min-h-[64px] border-t border-border bg-card/95 backdrop-blur-md shadow-lg transition-all",
        "px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3">
        {/* Left: Status / Progress / Cancel */}
        <div className="flex items-center gap-3 min-w-0">
          {status ? (
            <div className="text-xs text-muted-foreground truncate hidden sm:block">{status}</div>
          ) : null}
          {destructive ? <div className="shrink-0">{destructive}</div> : null}
        </div>

        {/* Right: Secondary action & Primary action */}
        <div className="flex items-center gap-2.5 shrink-0 flex-1 sm:flex-initial justify-end">
          {secondary ? <div className="shrink-0">{secondary}</div> : null}
          <div className="flex-1 sm:flex-initial">{primary}</div>
        </div>
      </div>
    </div>
  );
}
