import type * as React from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface PageHeaderProps {
  eyebrow?: React.ReactNode;
  breadcrumbs?: { label: string; to?: string }[];
  title: string;
  description?: string;
  actions?: React.ReactNode;
  backHref?: string;
  status?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  eyebrow,
  breadcrumbs,
  title,
  description,
  actions,
  backHref,
  status,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 border-b border-border pb-5 mb-6 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0 flex-1 space-y-1">
        {/* Breadcrumbs or Eyebrow */}
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1 flex-wrap"
          >
            {breadcrumbs.map((b, i) => (
              <span key={i} className="flex items-center gap-1.5 min-w-0">
                {b.to ? (
                  <Link to={b.to} className="hover:text-foreground font-medium transition-colors">
                    {b.label}
                  </Link>
                ) : (
                  <span className="font-semibold text-foreground">{b.label}</span>
                )}
                {i < breadcrumbs.length - 1 ? (
                  <span className="text-muted-foreground/60 select-none">/</span>
                ) : null}
              </span>
            ))}
          </nav>
        ) : eyebrow ? (
          <div className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
            {eyebrow}
          </div>
        ) : null}

        {/* Back Link */}
        {backHref ? (
          <div className="mb-1.5">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="-ml-2 h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
            >
              <Link to={backHref}>
                <ChevronLeft className="size-3.5" />
                Back
              </Link>
            </Button>
          </div>
        ) : null}

        {/* Title & Status */}
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">{title}</h1>
          {status ? <div>{status}</div> : null}
        </div>

        {/* Description */}
        {description ? (
          <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">{description}</p>
        ) : null}
      </div>

      {/* Primary & Contextual Actions */}
      {actions ? (
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:self-start">{actions}</div>
      ) : null}
    </div>
  );
}
