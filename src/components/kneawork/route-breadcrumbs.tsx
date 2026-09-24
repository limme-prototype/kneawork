import * as React from "react";
import { Link } from "@tanstack/react-router";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { BreadcrumbSegment } from "@/lib/kneawork/route-meta";
import { cn } from "@/lib/utils";

export interface RouteBreadcrumbsProps {
  segments: BreadcrumbSegment[];
  className?: string;
}

export function RouteBreadcrumbs({ segments, className }: RouteBreadcrumbsProps) {
  if (!segments || segments.length === 0) return null;

  // Single item (e.g. Home)
  if (segments.length === 1) {
    return (
      <Breadcrumb className={cn("select-none", className)}>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage className="font-semibold text-foreground text-xs sm:text-sm">
              {segments[0]!.label}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  const rootItem = segments[0]!;
  const middleItems = segments.slice(1, -1);
  const currentItem = segments[segments.length - 1]!;

  return (
    <Breadcrumb className={cn("select-none", className)}>
      {/* Mobile view (< sm): show dropdown for middle items or simple parent/current */}
      <div className="flex sm:hidden">
        <BreadcrumbList className="gap-1 text-xs">
          {middleItems.length > 0 ? (
            <>
              {/* Collapsed dropdown for intermediate hierarchy */}
              <BreadcrumbItem>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-1 text-muted-foreground hover:text-foreground outline-none">
                    <BreadcrumbEllipsis className="size-6" />
                    <span className="sr-only">Toggle breadcrumb menu</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link to={rootItem.to || "/"} className="cursor-pointer">
                        {rootItem.label}
                      </Link>
                    </DropdownMenuItem>
                    {middleItems.map((mid, idx) => (
                      <DropdownMenuItem key={idx} asChild>
                        <Link to={mid.to || "/"} className="cursor-pointer">
                          {mid.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          ) : (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    to={rootItem.to || "/"}
                    className="max-w-[90px] truncate text-muted-foreground hover:text-foreground"
                  >
                    {rootItem.label}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          )}

          <BreadcrumbItem>
            <BreadcrumbPage className="font-semibold text-foreground max-w-[150px] truncate">
              {currentItem.label}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </div>

      {/* Desktop view (>= sm): full hierarchical trail */}
      <div className="hidden sm:flex">
        <BreadcrumbList className="gap-1.5 text-xs sm:text-sm">
          {segments.map((seg, idx) => {
            const isLast = idx === segments.length - 1;
            return (
              <React.Fragment key={idx}>
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage className="font-semibold text-foreground max-w-[240px] truncate">
                      {seg.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link
                        to={seg.to || "/"}
                        className="text-muted-foreground hover:text-foreground transition-colors max-w-[160px] truncate"
                      >
                        {seg.label}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </div>
    </Breadcrumb>
  );
}
