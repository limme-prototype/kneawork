import * as React from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface DataTableRowAction {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: "default" | "destructive";
  disabled?: boolean;
  separator?: boolean;
}

interface DataTableRowActionsProps {
  actions: DataTableRowAction[];
  ariaLabel?: string;
}

export function DataTableRowActions({
  actions,
  ariaLabel = "Open row actions menu",
}: DataTableRowActionsProps) {
  if (actions.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="size-8 p-0 text-muted-foreground hover:text-foreground data-[state=open]:bg-muted"
          aria-label={ariaLabel}
          data-no-row-click
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {actions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <React.Fragment key={idx}>
              {action.separator && idx > 0 && <DropdownMenuSeparator />}
              <DropdownMenuItem
                onClick={action.onClick}
                disabled={action.disabled ?? false}
                className={
                  action.variant === "destructive"
                    ? "text-destructive focus:bg-destructive/10 focus:text-destructive text-xs"
                    : "text-xs"
                }
              >
                {Icon && <Icon className="mr-2 size-3.5" />}
                {action.label}
              </DropdownMenuItem>
            </React.Fragment>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
