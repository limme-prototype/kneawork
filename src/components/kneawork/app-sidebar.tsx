import { Link, useRouterState } from "@tanstack/react-router";
import {
  FileText,
  Home,
  Inbox,
  LayoutDashboard,
  Layers,
  Settings,
  Users,
  Shield,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { personById } from "@/lib/kneawork/data";
import { needsActionFrom, useKneaState } from "@/lib/kneawork/store";
import { cn } from "@/lib/utils";

export interface AppSidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileDrawer?: boolean;
  onItemClick?: () => void;
}

export function AppSidebar({
  collapsed = false,
  onToggleCollapse,
  isMobileDrawer = false,
  onItemClick,
}: AppSidebarProps) {
  const { requests, currentUserId } = useKneaState();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const me = personById(currentUserId);
  const actionCount = needsActionFrom(requests, currentUserId).length;

  const isStaff = currentUserId === "u_staff";
  const isAdmin =
    currentUserId === "u_admin" ||
    currentUserId === "u_director" ||
    currentUserId === "u_finance";

  const isCollapsed = collapsed && !isMobileDrawer;

  const navItem = (
    label: string,
    to: string,
    Icon: React.ElementType,
    badgeCount?: number,
    exact = false,
  ) => {
    const isActive = exact
      ? currentPath === to
      : currentPath === to || (to !== "/" && currentPath.startsWith(to));

    const content = (
      <Link
        to={to}
        onClick={onItemClick}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "flex min-h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors select-none",
          isCollapsed ? "justify-center px-0 w-10 mx-auto" : "w-full justify-between",
          isActive
            ? "bg-accent text-accent-foreground font-semibold shadow-2xs"
            : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Icon className={cn("size-4.5 shrink-0", isActive ? "text-primary" : "")} />
          {!isCollapsed && <span className="truncate">{label}</span>}
        </div>
        {!isCollapsed && badgeCount && badgeCount > 0 ? (
          <span
            className="flex size-5 items-center justify-center rounded-full bg-attention text-xs font-bold text-attention-foreground shadow-2xs shrink-0"
            aria-label={`${badgeCount} requests requiring your decision`}
          >
            {badgeCount}
          </span>
        ) : null}
      </Link>
    );

    if (isCollapsed) {
      return (
        <Tooltip key={to}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="font-semibold text-xs flex items-center gap-2">
            <span>{label}</span>
            {badgeCount && badgeCount > 0 ? (
              <span className="flex size-4.5 items-center justify-center rounded-full bg-attention text-[10px] font-bold text-attention-foreground">
                {badgeCount}
              </span>
            ) : null}
          </TooltipContent>
        </Tooltip>
      );
    }

    return <div key={to}>{content}</div>;
  };

  return (
    <TooltipProvider delayDuration={150}>
      <aside
        className={cn(
          "flex flex-col border-r border-border bg-card transition-all duration-200 select-none",
          isMobileDrawer
            ? "w-full h-full border-r-0"
            : isCollapsed
              ? "w-16 shrink-0"
              : "w-64 shrink-0",
        )}
      >
        {/* Workspace Identity Block */}
        <div
          className={cn(
            "flex h-14 items-center border-b border-border px-4",
            isCollapsed ? "justify-center px-2" : "justify-between",
          )}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-sm shadow-2xs">
              K
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <span className="font-bold text-foreground text-sm tracking-tight block truncate">
                  KneaWork
                </span>
                <span className="text-[11px] text-muted-foreground block truncate">
                  Operations
                </span>
              </div>
            )}
          </div>

          {!isCollapsed && onToggleCollapse && !isMobileDrawer ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className="size-7 text-muted-foreground hover:text-foreground shrink-0"
              aria-label="Collapse sidebar (Ctrl+B)"
            >
              <PanelLeftClose className="size-4" />
            </Button>
          ) : null}
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 px-2.5 py-4 space-y-6 overflow-y-auto overflow-x-hidden">
          {/* Group 1: WORKSPACE */}
          <div className="space-y-1">
            {!isCollapsed && (
              <p className="px-3 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Workspace
              </p>
            )}
            <nav className="space-y-1" aria-label="Workspace navigation">
              {navItem("Home", "/", Home, undefined, true)}
              {!isStaff && navItem("My Action", "/action", Inbox, actionCount)}
              {navItem(
                isStaff ? "My Requests" : "All Requests",
                "/requests",
                FileText,
              )}
            </nav>
          </div>

          {/* Group 2: MANAGE (Admins & Managers) */}
          {!isStaff && (
            <div className="space-y-1">
              {!isCollapsed && (
                <p className="px-3 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Manage
                </p>
              )}
              <nav className="space-y-1" aria-label="Management navigation">
                {navItem("Operations Overview", "/admin", LayoutDashboard, undefined, true)}
                {navItem("Templates", "/templates", Layers)}
                {navItem("Team & Roles", "/team", Users)}
              </nav>
            </div>
          )}

          {/* Group 3: SETTINGS */}
          <div className="space-y-1">
            {!isCollapsed && (
              <p className="px-3 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Settings
              </p>
            )}
            <nav className="space-y-1" aria-label="Settings navigation">
              {isAdmin && navItem("Workspace Settings", "/settings", Settings)}
              {navItem("My Profile", "/profile", Shield)}
            </nav>
          </div>
        </div>

        {/* Footer: User Account / Expand button */}
        <div className="border-t border-border p-2">
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    to="/profile"
                    className="flex size-9 items-center justify-center rounded-md hover:bg-accent text-foreground transition-colors"
                  >
                    <span className="flex size-7 items-center justify-center rounded-full bg-muted font-bold text-xs text-foreground">
                      {me.initials}
                    </span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="font-semibold text-xs">{me.name}</p>
                  <p className="text-[11px] text-muted-foreground">{me.role}</p>
                </TooltipContent>
              </Tooltip>
              {onToggleCollapse && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggleCollapse}
                  className="size-8 text-muted-foreground hover:text-foreground"
                  aria-label="Expand sidebar (Ctrl+B)"
                >
                  <PanelLeft className="size-4" />
                </Button>
              )}
            </div>
          ) : (
            <Link
              to="/profile"
              onClick={onItemClick}
              className="flex items-center gap-2.5 rounded-md p-2 hover:bg-accent transition-colors"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted font-bold text-xs text-foreground">
                {me.initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-foreground">{me.name}</p>
                <p className="truncate text-[13px] text-muted-foreground">{me.role}</p>
              </div>
            </Link>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
