import * as React from "react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

export interface MobileCardAttribute {
  label: string;
  value: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface DataTableMobileCardProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode | undefined;
  status?: React.ReactNode | undefined;
  attributes?: MobileCardAttribute[] | undefined;
  actions?: React.ReactNode | undefined;
  selected?: boolean | undefined;
  onSelectChange?: ((selected: boolean) => void) | undefined;
  onClick?: (() => void) | undefined;
  className?: string | undefined;
  children?: React.ReactNode | undefined;
}

export function DataTableMobileCard({
  title,
  subtitle,
  status,
  attributes = [],
  actions,
  selected = false,
  onSelectChange,
  onClick,
  className,
  children,
}: DataTableMobileCardProps) {
  const isSelectable = typeof onSelectChange === "function";

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onClick) return;
    const target = e.target as HTMLElement;
    if (
      target.closest(
        "button, a, input, select, textarea, label, [role='menuitem'], [data-no-row-click]",
      )
    ) {
      return;
    }
    onClick();
  };

  return (
    <div
      onClick={onClick ? handleCardClick : undefined}
      className={cn(
        "rounded-lg border border-border bg-card p-4 transition-colors shadow-2xs",
        onClick && "cursor-pointer active:bg-muted/40",
        selected && "border-primary/50 bg-primary/5",
        className,
      )}
    >
      {/* Top Header: Selection, Title, Subtitle, and Status Badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          {isSelectable && (
            <div className="pt-0.5" data-no-row-click>
              <Checkbox
                checked={selected}
                onCheckedChange={(val) => onSelectChange?.(Boolean(val))}
                aria-label="Select card"
              />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-foreground leading-snug break-words">
              {title}
            </div>
            {subtitle && (
              <div className="mt-0.5 text-xs text-muted-foreground break-words">{subtitle}</div>
            )}
          </div>
        </div>
        {status && <div className="shrink-0 pt-0.5">{status}</div>}
      </div>

      {/* Attribute Grid */}
      {attributes.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border/60 pt-3 text-xs">
          {attributes.map((attr, idx) => (
            <div key={idx} className="min-w-0">
              <span className="block text-[11px] font-medium text-muted-foreground">
                {attr.label}
              </span>
              <span className="block font-medium text-foreground truncate mt-0.5">
                {attr.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Custom Body Children */}
      {children && <div className="mt-3">{children}</div>}

      {/* Card Actions (minimum 40-44px touch targets) */}
      {actions && (
        <div
          data-no-row-click
          className="mt-3.5 flex items-center justify-end gap-2 border-t border-border/60 pt-3"
        >
          {actions}
        </div>
      )}
    </div>
  );
}
