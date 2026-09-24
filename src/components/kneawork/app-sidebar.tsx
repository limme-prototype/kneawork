import * as React from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Check,
  ChevronsUpDown,
  FileText,
  Home,
  Inbox,
  LayoutDashboard,
  Layers,
  Settings,
  Shield,
  Users,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { PEOPLE, personById } from "@/lib/kneawork/data";
import { needsActionFrom, setCurrentUser, useKneaState } from "@/lib/kneawork/store";
import { cn } from "@/lib/utils";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { requests, currentUserId } = useKneaState();
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const { isMobile, setOpenMobile } = useSidebar();

  const me = personById(currentUserId);
  const actionCount = needsActionFrom(requests, currentUserId).length;

  const isStaff = currentUserId === "u_staff";
  const isAdmin =
    currentUserId === "u_admin" ||
    currentUserId === "u_director" ||
    currentUserId === "u_finance";

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const navItem = (
    label: string,
    to: string,
    Icon: React.ElementType,
    badgeCount?: number,
    exact = false,
  ) => {
    const isActive = exact
      ? pathname === to
      : pathname === to || (to !== "/" && pathname.startsWith(to));

    return (
      <SidebarMenuItem key={to}>
        <SidebarMenuButton
          asChild
          isActive={isActive}
          tooltip={label}
          className={cn(
            "flex min-h-10 h-10 w-full items-center justify-between gap-3 rounded-md px-3 text-sm font-medium transition-colors select-none",
            "group-data-[collapsible=icon]:!size-10 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mx-auto",
            isActive
              ? "!bg-accent !text-accent-foreground font-semibold shadow-2xs hover:!bg-accent hover:!text-accent-foreground"
              : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
          )}
        >
          <Link
            to={to}
            onClick={handleLinkClick}
            aria-current={isActive ? "page" : undefined}
            className="flex w-full items-center justify-between gap-3 min-w-0"
          >
            <div className="flex items-center gap-3 min-w-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-full">
              <Icon
                className={cn(
                  "size-4.5 shrink-0 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
              />
              <span className="truncate group-data-[collapsible=icon]:hidden">{label}</span>
            </div>
            {!isMobile && badgeCount && badgeCount > 0 ? (
              <span
                className="flex size-5 items-center justify-center rounded-full bg-attention text-xs font-bold text-attention-foreground shadow-2xs shrink-0 group-data-[collapsible=icon]:hidden"
                aria-label={`${badgeCount} requests requiring your decision`}
              >
                {badgeCount}
              </span>
            ) : null}
            {isMobile && badgeCount && badgeCount > 0 ? (
              <span
                className="flex size-5 items-center justify-center rounded-full bg-attention text-xs font-bold text-attention-foreground shadow-2xs shrink-0"
                aria-label={`${badgeCount} requests requiring your decision`}
              >
                {badgeCount}
              </span>
            ) : null}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* 1. Header: Workspace Identity matching the exact original design */}
      <SidebarHeader className="border-b border-border p-0">
        <div className="flex h-14 items-center px-4 justify-between group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-sm shadow-2xs">
              K
            </div>
            <div className="min-w-0 group-data-[collapsible=icon]:hidden">
              <span className="font-bold text-foreground text-sm tracking-tight block truncate">
                KneaWork
              </span>
              <span className="text-[11px] text-muted-foreground block truncate">
                Operations
              </span>
            </div>
          </div>
        </div>
      </SidebarHeader>

      {/* 2. Content: Nav Groups matching exact spacing, typography, and buttons */}
      <SidebarContent className="px-2.5 py-4 space-y-6 overflow-y-auto overflow-x-hidden">
        {/* Workspace Navigation */}
        <SidebarGroup className="p-0 space-y-1">
          <p className="px-3 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider group-data-[collapsible=icon]:hidden">
            Workspace
          </p>
          <SidebarMenu className="space-y-1">
            {navItem("Home", "/", Home, undefined, true)}
            {!isStaff && navItem("My Action", "/action", Inbox, actionCount)}
            {navItem(isStaff ? "My Requests" : "All Requests", "/requests", FileText)}
          </SidebarMenu>
        </SidebarGroup>

        {/* Manage Navigation */}
        {!isStaff && (
          <SidebarGroup className="p-0 space-y-1">
            <p className="px-3 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider group-data-[collapsible=icon]:hidden">
              Manage
            </p>
            <SidebarMenu className="space-y-1">
              {navItem("Operations Overview", "/admin", LayoutDashboard, undefined, true)}
              {navItem("Templates", "/templates", Layers)}
              {navItem("Team & Roles", "/team", Users)}
            </SidebarMenu>
          </SidebarGroup>
        )}

        {/* Settings Navigation */}
        <SidebarGroup className="p-0 space-y-1">
          <p className="px-3 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider group-data-[collapsible=icon]:hidden">
            Settings
          </p>
          <SidebarMenu className="space-y-1">
            {isAdmin && navItem("Workspace Settings", "/settings", Settings)}
            {navItem("My Profile", "/profile", Shield)}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* 3. Footer: User Menu matching exact original design */}
      <SidebarFooter className="border-t border-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex w-full items-center gap-2.5 rounded-md p-2 hover:bg-accent transition-colors text-left outline-none cursor-pointer group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-1"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted font-bold text-xs text-foreground">
                    {me.initials}
                  </span>
                  <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                    <p className="truncate text-xs font-semibold text-foreground">{me.name}</p>
                    <p className="truncate text-[13px] text-muted-foreground">{me.role}</p>
                  </div>
                  <ChevronsUpDown className="size-4 text-muted-foreground shrink-0 group-data-[collapsible=icon]:hidden" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg p-1 shadow-lg"
                side="top"
                align="start"
                sideOffset={8}
              >
                <div className="flex items-center gap-2.5 px-2.5 py-2">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-xs text-primary-foreground">
                    {me.initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-foreground">{me.name}</p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {me.department} · {me.role}
                    </p>
                  </div>
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuLabel className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1">
                  Switch Test Persona
                </DropdownMenuLabel>
                <DropdownMenuGroup>
                  {PEOPLE.map((p) => {
                    const isCurrent = p.id === currentUserId;
                    return (
                      <DropdownMenuItem
                        key={p.id}
                        onClick={() => setCurrentUser(p.id)}
                        className="flex items-center justify-between text-xs py-1.5 cursor-pointer"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="flex size-5 items-center justify-center rounded-full bg-muted text-[10px] font-bold">
                            {p.initials}
                          </span>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">{p.name}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{p.role}</p>
                          </div>
                        </div>
                        {isCurrent ? <Check className="size-3.5 text-primary shrink-0" /> : null}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild className="cursor-pointer text-xs">
                  <Link to="/profile" onClick={handleLinkClick} className="flex items-center gap-2">
                    <Shield className="size-3.5 text-muted-foreground" />
                    <span>My Profile</span>
                  </Link>
                </DropdownMenuItem>

                {isAdmin && (
                  <DropdownMenuItem asChild className="cursor-pointer text-xs">
                    <Link to="/settings" onClick={handleLinkClick} className="flex items-center gap-2">
                      <Settings className="size-3.5 text-muted-foreground" />
                      <span>Workspace Settings</span>
                    </Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      {/* 4. Rail for hovering/toggling */}
      <SidebarRail />
    </Sidebar>
  );
}
