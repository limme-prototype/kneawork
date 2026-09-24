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

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { PEOPLE, personById } from "@/lib/kneawork/data";
import { needsActionFrom, setCurrentUser, useKneaState } from "@/lib/kneawork/store";
import { cn } from "@/lib/utils";

function isNavItemActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

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

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* 1. Header: Workspace Identity */}
      <SidebarHeader className="border-b border-sidebar-border px-3 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="cursor-default select-none data-[state=open]:bg-sidebar-accent hover:bg-transparent"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm shadow-xs">
                K
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-bold text-foreground">KneaWork</span>
                <span className="truncate text-xs text-muted-foreground font-normal">
                  Operations
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* 2. Content: Nav Groups */}
      <SidebarContent className="px-2 py-3 space-y-4">
        {/* Workspace Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Home */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isNavItemActive(pathname, "/")}
                  tooltip="Home"
                >
                  <Link
                    to="/"
                    onClick={handleLinkClick}
                    aria-current={isNavItemActive(pathname, "/") ? "page" : undefined}
                  >
                    <Home className="size-4" />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* My Action (Approvers/Managers) */}
              {!isStaff && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isNavItemActive(pathname, "/action")}
                    tooltip="My Action"
                  >
                    <Link
                      to="/action"
                      onClick={handleLinkClick}
                      aria-current={isNavItemActive(pathname, "/action") ? "page" : undefined}
                    >
                      <Inbox className="size-4" />
                      <span>My Action</span>
                      {actionCount > 0 ? (
                        <SidebarMenuBadge className="ml-auto bg-attention text-attention-foreground font-bold">
                          {actionCount}
                        </SidebarMenuBadge>
                      ) : null}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {/* Requests */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isNavItemActive(pathname, "/requests")}
                  tooltip={isStaff ? "My Requests" : "All Requests"}
                >
                  <Link
                    to="/requests"
                    onClick={handleLinkClick}
                    aria-current={isNavItemActive(pathname, "/requests") ? "page" : undefined}
                  >
                    <FileText className="size-4" />
                    <span>{isStaff ? "My Requests" : "All Requests"}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Manage Navigation (Hide for staff without access) */}
        {!isStaff && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Manage
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {/* Operations Overview */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isNavItemActive(pathname, "/admin")}
                    tooltip="Operations Overview"
                  >
                    <Link
                      to="/admin"
                      onClick={handleLinkClick}
                      aria-current={isNavItemActive(pathname, "/admin") ? "page" : undefined}
                    >
                      <LayoutDashboard className="size-4" />
                      <span>Operations Overview</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Templates */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isNavItemActive(pathname, "/templates")}
                    tooltip="Templates"
                  >
                    <Link
                      to="/templates"
                      onClick={handleLinkClick}
                      aria-current={isNavItemActive(pathname, "/templates") ? "page" : undefined}
                    >
                      <Layers className="size-4" />
                      <span>Templates</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Team & Roles */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isNavItemActive(pathname, "/team")}
                    tooltip="Team & Roles"
                  >
                    <Link
                      to="/team"
                      onClick={handleLinkClick}
                      aria-current={isNavItemActive(pathname, "/team") ? "page" : undefined}
                    >
                      <Users className="size-4" />
                      <span>Team & Roles</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Settings Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            Settings
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isNavItemActive(pathname, "/settings")}
                    tooltip="Workspace Settings"
                  >
                    <Link
                      to="/settings"
                      onClick={handleLinkClick}
                      aria-current={isNavItemActive(pathname, "/settings") ? "page" : undefined}
                    >
                      <Settings className="size-4" />
                      <span>Workspace Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isNavItemActive(pathname, "/profile")}
                  tooltip="My Profile"
                >
                  <Link
                    to="/profile"
                    onClick={handleLinkClick}
                    aria-current={isNavItemActive(pathname, "/profile") ? "page" : undefined}
                  >
                    <Shield className="size-4" />
                    <span>My Profile</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* 3. Footer: User Menu Dropdown */}
      <SidebarFooter className="border-t border-sidebar-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="size-8 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-muted text-foreground font-bold text-xs">
                      {me.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-xs leading-tight">
                    <span className="truncate font-semibold text-foreground">{me.name}</span>
                    <span className="truncate text-[11px] text-muted-foreground">
                      {me.role}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg p-1"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <div className="flex items-center gap-2.5 px-2.5 py-2">
                  <Avatar className="size-8 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-primary text-primary-foreground font-bold text-xs">
                      {me.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-xs leading-tight">
                    <span className="truncate font-semibold text-foreground">{me.name}</span>
                    <span className="truncate text-[11px] text-muted-foreground">
                      {me.department} · {me.role}
                    </span>
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
