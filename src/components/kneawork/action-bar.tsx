import type * as React from "react";
import { cn } from "@/lib/utils";

export interface ActionBarProps {
  primary: React.ReactNode;
  secondary?: React.ReactNode;
  destructive?: React.ReactNode;
  status?: React.ReactNode;
  sticky?: boolean;
  className?: string;
}

export function ActionBar({
  primary,
  secondary,
  destructive,
  status,
  sticky = true,
  className,
}: ActionBarProps) {
  return (
    <div
      className={cn(
        "w-full border-t border-border bg-card/95 backdrop-blur shadow-2xs transition-all",
        sticky
          ? "sticky bottom-0 z-30 -mx-3.5 sm:-mx-6 lg:-mx-8 px-3.5 sm:px-6 lg:px-8 py-3 mt-8 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
          : "py-3 mt-6",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3">
        {/* Left: Status / Draft indicator & Secondary action (e.g. Save Draft) */}
        <div className="flex items-center gap-3 min-w-0">
          {status ? (
            <div className="text-xs text-muted-foreground truncate hidden sm:block">
              {status}
            </div>
          ) : null}
          {secondary ? <div>{secondary}</div> : null}
        </div>

        {/* Right: Cancel / Destructive & Primary action */}
        <div className="flex items-center gap-2.5 shrink-0">
          {destructive ? <div>{destructive}</div> : null}
          {primary}
        </div>
      </div>
    </div>
  );
}
