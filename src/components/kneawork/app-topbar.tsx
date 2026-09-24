import * as React from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  Check,
  FileText,
  Home,
  Inbox,
  LayoutDashboard,
  Layers,
  Plus,
  Search,
  Settings,
  Shield,
  Users,
} from "lucide-react";

import { RouteBreadcrumbs } from "@/components/kneawork/route-breadcrumbs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { PEOPLE, personById } from "@/lib/kneawork/data";
import { resolveBreadcrumbs } from "@/lib/kneawork/route-meta";
import { needsActionFrom, setCurrentUser, useKneaState } from "@/lib/kneawork/store";

export interface AppTopbarProps {
  breadcrumbs?: { label: string; to?: string }[] | undefined;
  contextTitle?: string | undefined;
  contextSubtitle?: string | undefined;
  isSidebarCollapsed?: boolean;
  onToggleSidebarCollapse?: () => void;
  onOpenMobileMenu?: () => void;
}

export function AppTopbar({
  breadcrumbs,
  contextTitle,
}: AppTopbarProps) {
  const { requests, currentUserId } = useKneaState();
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const navigate = useNavigate();
  const [commandOpen, setCommandOpen] = React.useState(false);

  const me = personById(currentUserId);
  const actionItems = needsActionFrom(requests, currentUserId);
  const actionCount = actionItems.length;

  const isStaff = currentUserId === "u_staff";
  const isAdmin =
    currentUserId === "u_admin" ||
    currentUserId === "u_director" ||
    currentUserId === "u_finance";

  // Cmd+K / Ctrl+K listener
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelectCommand = (to: string) => {
    setCommandOpen(false);
    navigate({ to });
  };

  const breadcrumbSegments = resolveBreadcrumbs(pathname, breadcrumbs, contextTitle);

  return (
    <>
      <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-border bg-card/95 px-3 sm:px-4 lg:px-6 backdrop-blur gap-2 select-none">
        {/* Left: Sidebar trigger, separator, and centralized breadcrumb */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
          <Separator orientation="vertical" className="mr-2 h-4 hidden sm:block" />

          <div className="min-w-0 flex-1">
            <RouteBreadcrumbs segments={breadcrumbSegments} />
          </div>
        </div>

        {/* Right: Global Utilities (Search/⌘K, Notifications, User Menu) */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Global Search Button */}
          <button
            type="button"
            onClick={() => setCommandOpen(true)}
            className="hidden md:flex items-center gap-2 rounded-md border border-border bg-muted/40 px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            aria-label="Search or jump to command (Ctrl+K)"
          >
            <Search className="size-3.5" />
            <span>Search or jump to...</span>
            <kbd className="pointer-events-none ml-1.5 rounded border border-border bg-card px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
              ⌘K
            </kbd>
          </button>

          {/* Action Notifications Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="relative flex size-8 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                aria-label={
                  actionCount > 0
                    ? `Notifications: ${actionCount} actionable requests`
                    : "Notifications"
                }
              >
                <Bell className="size-4" />
                {actionCount > 0 ? (
                  <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-attention text-[10px] font-bold text-attention-foreground shadow-2xs">
                    {actionCount}
                  </span>
                ) : null}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0 shadow-lg">
              <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                <span className="text-xs font-bold text-foreground">Action Notifications</span>
                {actionCount > 0 ? (
                  <span className="rounded bg-attention-soft px-1.5 py-0.5 text-[10px] font-bold text-attention">
                    {actionCount} pending
                  </span>
                ) : null}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-border">
                {actionItems.length === 0 ? (
                  <div className="p-4 text-center text-xs text-muted-foreground">
                    All caught up! No requests require your action.
                  </div>
                ) : (
                  actionItems.slice(0, 5).map((req) => (
                    <Link
                      key={req.id}
                      to="/requests/$requestId"
                      params={{ requestId: req.id }}
                      className="block p-3 hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-foreground truncate">
                          {req.title}
                        </span>
                        <span className="text-[10px] text-attention font-bold shrink-0">
                          Due today
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                        {req.code} · {req.valueLabel} · Requires your decision
                      </p>
                    </Link>
                  ))
                )}
              </div>
              {actionItems.length > 0 ? (
                <div className="border-t border-border p-2">
                  <Button asChild variant="ghost" size="sm" className="w-full text-xs font-semibold">
                    <Link to="/action">View all actions ({actionCount})</Link>
                  </Button>
                </div>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User & Workspace Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="relative flex size-8 sm:size-8.5 items-center justify-center rounded-full border border-border bg-card hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0 cursor-pointer"
                aria-label={`Account menu for ${me.name}`}
              >
                <Avatar className="size-full">
                  <AvatarFallback className="bg-muted text-foreground font-bold text-xs select-none">
                    {me.initials}
                  </AvatarFallback>
                </Avatar>
                <span
                  className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-success ring-2 ring-card"
                  title="Online"
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-1 shadow-lg">
              <div className="flex items-center gap-2.5 px-2.5 py-2.5">
                <Avatar className="size-9 shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xs">
                    {me.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-foreground truncate">{me.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{me.title ?? me.role}</p>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-success" />
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      {me.department} · KneaWork
                    </span>
                  </div>
                </div>
              </div>

              <DropdownMenuSeparator />

              <DropdownMenuLabel className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1">
                Switch Test Role
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
                <Link to="/profile" className="flex items-center gap-2">
                  <Shield className="size-3.5 text-muted-foreground" />
                  <span>My Profile</span>
                </Link>
              </DropdownMenuItem>

              {isAdmin && (
                <DropdownMenuItem asChild className="cursor-pointer text-xs">
                  <Link to="/settings" className="flex items-center gap-2">
                    <Settings className="size-3.5 text-muted-foreground" />
                    <span>Workspace Settings</span>
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Global Command Dialog (Cmd+K / Ctrl+K) */}
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Type a destination or command..." />
        <CommandList>
          <CommandEmpty>No matching pages found.</CommandEmpty>
          <CommandGroup heading="Quick Actions">
            <CommandItem
              onSelect={() => handleSelectCommand("/requests/new")}
              className="cursor-pointer"
            >
              <Plus className="mr-2 size-4 text-primary" />
              <span>Create new request</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => handleSelectCommand("/")} className="cursor-pointer">
              <Home className="mr-2 size-4 text-muted-foreground" />
              <span>Home</span>
            </CommandItem>
            {!isStaff && (
              <CommandItem
                onSelect={() => handleSelectCommand("/action")}
                className="cursor-pointer"
              >
                <Inbox className="mr-2 size-4 text-attention" />
                <span>My Action</span>
              </CommandItem>
            )}
            <CommandItem
              onSelect={() => handleSelectCommand("/requests")}
              className="cursor-pointer"
            >
              <FileText className="mr-2 size-4 text-muted-foreground" />
              <span>{isStaff ? "My Requests" : "All Requests"}</span>
            </CommandItem>
            {!isStaff && (
              <>
                <CommandItem
                  onSelect={() => handleSelectCommand("/admin")}
                  className="cursor-pointer"
                >
                  <LayoutDashboard className="mr-2 size-4 text-muted-foreground" />
                  <span>Operations Overview</span>
                </CommandItem>
                <CommandItem
                  onSelect={() => handleSelectCommand("/templates")}
                  className="cursor-pointer"
                >
                  <Layers className="mr-2 size-4 text-muted-foreground" />
                  <span>Templates</span>
                </CommandItem>
                <CommandItem
                  onSelect={() => handleSelectCommand("/team")}
                  className="cursor-pointer"
                >
                  <Users className="mr-2 size-4 text-muted-foreground" />
                  <span>Team & Roles</span>
                </CommandItem>
              </>
            )}
            {isAdmin && (
              <CommandItem
                onSelect={() => handleSelectCommand("/settings")}
                className="cursor-pointer"
              >
                <Settings className="mr-2 size-4 text-muted-foreground" />
                <span>Workspace Settings</span>
              </CommandItem>
            )}
            <CommandItem
              onSelect={() => handleSelectCommand("/profile")}
              className="cursor-pointer"
            >
              <Shield className="mr-2 size-4 text-muted-foreground" />
              <span>My Profile</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
