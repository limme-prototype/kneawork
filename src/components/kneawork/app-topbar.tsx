import { Link, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  Check,
  ChevronDown,
  Command as CommandIcon,
  FileText,
  Home,
  Inbox,
  LayoutDashboard,
  Layers,
  LogOut,
  Menu,
  PanelLeft,
  PanelLeftClose,
  Plus,
  Search,
  Settings,
  Shield,
  User,
  Users,
} from "lucide-react";
import * as React from "react";

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
import { PEOPLE, personById } from "@/lib/kneawork/data";
import { needsActionFrom, setCurrentUser, useKneaState } from "@/lib/kneawork/store";

export interface AppTopbarProps {
  breadcrumbs?: { label: string; to?: string }[] | undefined;
  contextTitle?: string | undefined;
  contextSubtitle?: string | undefined;
  isSidebarCollapsed: boolean;
  onToggleSidebarCollapse: () => void;
  onOpenMobileMenu: () => void;
}

export function AppTopbar({
  breadcrumbs,
  contextTitle,
  contextSubtitle,
  isSidebarCollapsed,
  onToggleSidebarCollapse,
  onOpenMobileMenu,
}: AppTopbarProps) {
  const { requests, currentUserId } = useKneaState();
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

  // Cmd+K listener
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

  return (
    <>
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-card/95 px-3 sm:px-6 lg:px-8 backdrop-blur gap-2 sm:gap-4 select-none">
        {/* Left: Mobile trigger, Desktop collapse toggle & Breadcrumb/Context */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          {/* Mobile Drawer Trigger */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenMobileMenu}
            className="size-8 lg:hidden text-foreground hover:bg-muted shrink-0"
            aria-label="Open navigation menu"
          >
            <Menu className="size-4.5" />
          </Button>

          {/* Desktop Sidebar Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebarCollapse}
            className="hidden lg:flex size-8 text-muted-foreground hover:text-foreground shrink-0"
            aria-label={
              isSidebarCollapsed
                ? "Expand sidebar (Ctrl+B)"
                : "Collapse sidebar (Ctrl+B)"
            }
          >
            {isSidebarCollapsed ? (
              <PanelLeft className="size-4" />
            ) : (
              <PanelLeftClose className="size-4" />
            )}
          </Button>

          {/* Breadcrumb or Context */}
          <div className="min-w-0 flex-1">
            {breadcrumbs && breadcrumbs.length > 0 ? (
              <nav
                aria-label="Topbar Breadcrumb"
                className="flex items-center gap-1.5 text-xs text-muted-foreground overflow-hidden"
              >
                {breadcrumbs.map((b, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1.5 shrink-0 last:shrink last:truncate min-w-0"
                  >
                    {b.to ? (
                      <Link to={b.to} className="hover:text-foreground font-medium truncate">
                        {b.label}
                      </Link>
                    ) : (
                      <span className="font-semibold text-foreground truncate">{b.label}</span>
                    )}
                    {i < breadcrumbs.length - 1 ? (
                      <span className="text-muted-foreground/60 select-none">/</span>
                    ) : null}
                  </span>
                ))}
              </nav>
            ) : (
              <div className="min-w-0">
                <span className="text-sm font-bold text-foreground truncate block">
                  {contextTitle || "KneaWork"}
                </span>
                {contextSubtitle ? (
                  <span className="text-xs text-muted-foreground truncate hidden sm:block">
                    {contextSubtitle}
                  </span>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* Right: Global Utilities (Search/⌘K, Notifications, User Menu) */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Global Command / Quick Search button */}
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

          {/* Notifications Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="relative flex size-8 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
                className="flex items-center gap-1.5 sm:gap-2 rounded-md border border-border bg-card px-2 sm:px-2.5 py-1 text-xs font-medium text-foreground hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <span className="size-2 rounded-full bg-success shrink-0" />
                <span className="max-w-[75px] sm:max-w-28 truncate font-semibold">
                  {me.name}
                </span>
                <ChevronDown className="size-3 text-muted-foreground hidden sm:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-1 shadow-lg">
              {/* Account Identity */}
              <div className="px-2.5 py-2">
                <p className="text-xs font-bold text-foreground truncate">{me.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">{me.title ?? me.role}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-success" />
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {me.department} · KneaWork
                  </span>
                </div>
              </div>

              <DropdownMenuSeparator />

              {/* Persona Switcher for SME Testing */}
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

              {/* Account Links */}
              <DropdownMenuItem asChild className="cursor-pointer text-xs">
                <Link to="/profile" className="flex items-center gap-2">
                  <Shield className="size-3.5 text-muted-foreground" />
                  <span>My Profile</span>
                </Link>
              </DropdownMenuItem>

              {isAdmin ? (
                <DropdownMenuItem asChild className="cursor-pointer text-xs">
                  <Link to="/settings" className="flex items-center gap-2">
                    <Settings className="size-3.5 text-muted-foreground" />
                    <span>Workspace Settings</span>
                  </Link>
                </DropdownMenuItem>
              ) : null}
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
