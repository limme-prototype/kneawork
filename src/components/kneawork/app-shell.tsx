import { Link } from "@tanstack/react-router";
import {
  FileText,
  Home,
  Inbox,
  LayoutDashboard,
  Layers,
  Settings,
  Users,
  BarChart3,
  Bell,
  ChevronDown,
  LogOut,
  Shield,
  Briefcase,
  Menu,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import { personById } from "@/lib/kneawork/data";
import { needsActionFrom, useKneaState } from "@/lib/kneawork/store";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function AppShell({
  title,
  subtitle,
  children,
  breadcrumbs,
}: {
  title: string;
  subtitle?: string;
  breadcrumbs?: { label: string; to?: string }[];
  children: ReactNode;
}) {
  const { requests, currentUserId } = useKneaState();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const me = personById(currentUserId);
  const actionCount = needsActionFrom(requests, currentUserId).length;

  const isStaff = currentUserId === "u_staff";
  const isManager = currentUserId === "u_manager";
  const isAdmin =
    currentUserId === "u_admin" || currentUserId === "u_director" || currentUserId === "u_finance";

  const renderNavLinks = (onItemClick?: () => void) => (
    <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
      {/* Section 1: Workspace */}
      <div>
        <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Workspace</p>
        <nav className="mt-1.5 space-y-1">
          {/* Home */}
          <Link
            to="/"
            onClick={onItemClick}
            activeOptions={{ exact: true }}
            activeProps={{ className: "bg-muted text-primary font-semibold" }}
            inactiveProps={{
              className: "text-muted-foreground hover:bg-accent hover:text-foreground",
            }}
            className="flex min-h-10 items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors"
          >
            <Home className="size-4.5 shrink-0" />
            <span>Home</span>
          </Link>

          {/* My Action (Approvers & Admins only) */}
          {!isStaff ? (
            <Link
              to="/action"
              onClick={onItemClick}
              activeOptions={{ exact: false }}
              activeProps={{ className: "bg-muted text-primary font-semibold" }}
              inactiveProps={{
                className: "text-muted-foreground hover:bg-accent hover:text-foreground",
              }}
              className="flex min-h-10 items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Inbox className="size-4.5 shrink-0" />
                <span>My Action</span>
              </div>
              {actionCount > 0 ? (
                <span className="flex size-5 items-center justify-center rounded-full bg-attention text-xs font-bold text-attention-foreground">
                  {actionCount}
                </span>
              ) : null}
            </Link>
          ) : null}

          {/* All Requests / Team Requests */}
          <Link
            to="/requests"
            onClick={onItemClick}
            activeOptions={{ exact: false }}
            activeProps={{ className: "bg-muted text-primary font-semibold" }}
            inactiveProps={{
              className: "text-muted-foreground hover:bg-accent hover:text-foreground",
            }}
            className="flex min-h-10 items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors"
          >
            <FileText className="size-4.5 shrink-0" />
            <span>{isStaff ? "My Requests" : "All Requests"}</span>
          </Link>
        </nav>
      </div>

      {/* Section 2: Manage (Admins & Managers) */}
      {!isStaff ? (
        <div>
          <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Manage</p>
          <nav className="mt-1.5 space-y-1">
            {/* Operations Overview */}
            <Link
              to="/admin"
              onClick={onItemClick}
              activeOptions={{ exact: true }}
              activeProps={{ className: "bg-muted text-primary font-semibold" }}
              inactiveProps={{
                className: "text-muted-foreground hover:bg-accent hover:text-foreground",
              }}
              className="flex min-h-10 items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors"
            >
              <LayoutDashboard className="size-4.5 shrink-0" />
              <span>Operations overview</span>
            </Link>

            <Link
              to="/templates"
              onClick={onItemClick}
              activeOptions={{ exact: false }}
              activeProps={{ className: "bg-muted text-primary font-semibold" }}
              inactiveProps={{
                className: "text-muted-foreground hover:bg-accent hover:text-foreground",
              }}
              className="flex min-h-10 items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors"
            >
              <Layers className="size-4.5 shrink-0" />
              <span>Templates</span>
            </Link>
            <Link
              to="/team"
              onClick={onItemClick}
              activeOptions={{ exact: false }}
              activeProps={{ className: "bg-muted text-primary font-semibold" }}
              inactiveProps={{
                className: "text-muted-foreground hover:bg-accent hover:text-foreground",
              }}
              className="flex min-h-10 items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors"
            >
              <Users className="size-4.5 shrink-0" />
              <span>Team & roles</span>
            </Link>
          </nav>
        </div>
      ) : null}

      {/* Section 3: Settings */}
      <div>
        <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Settings</p>
        <nav className="mt-1.5 space-y-1">
          {isAdmin ? (
            <Link
              to="/settings"
              onClick={onItemClick}
              activeOptions={{ exact: false }}
              activeProps={{ className: "bg-muted text-primary font-semibold" }}
              inactiveProps={{
                className: "text-muted-foreground hover:bg-accent hover:text-foreground",
              }}
              className="flex min-h-10 items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors"
            >
              <Settings className="size-4.5 shrink-0" />
              <span>Workspace settings</span>
            </Link>
          ) : null}

          <Link
            to="/profile"
            onClick={onItemClick}
            activeOptions={{ exact: false }}
            activeProps={{ className: "bg-muted text-primary font-semibold" }}
            inactiveProps={{
              className: "text-muted-foreground hover:bg-accent hover:text-foreground",
            }}
            className="flex min-h-10 items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors"
          >
            <Shield className="size-4.5 shrink-0" />
            <span>My profile</span>
          </Link>
        </nav>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full bg-background font-sans text-foreground antialiased overflow-x-hidden">
      {/* 1. Desktop Left Sidebar (HiBob & Sentinel Enterprise Architecture) */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col border-r border-border bg-card">
        {/* Brand */}
        <div className="flex h-14 items-center gap-2.5 border-b border-border px-5">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-sm shadow-2xs">
            K
          </div>
          <div>
            <span className="font-bold text-foreground text-sm tracking-tight">KneaWork</span>
            <span className="ml-1.5 rounded bg-muted px-1.5 py-0.5 text-xs font-semibold text-muted-foreground">
              Operations
            </span>
          </div>
        </div>

        {renderNavLinks()}

        {/* Current user footer in sidebar */}
        <div className="border-t border-border p-3">
          <Link
            to="/profile"
            className="flex items-center justify-between rounded-md p-2 hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted font-bold text-xs text-foreground">
                {me.initials}
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-foreground">{me.name}</p>
                <p className="truncate text-[13px] text-muted-foreground">
                  {me.role.split(" ")[0]}
                </p>
              </div>
            </div>
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </Link>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 w-full max-w-full overflow-x-hidden">
        {/* Top Header */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-card/95 px-3 sm:px-6 lg:px-8 backdrop-blur gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            {/* Mobile & Tablet Drawer Trigger */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="size-8 p-0 lg:hidden text-foreground hover:bg-muted shrink-0"
                  aria-label="Open navigation menu"
                >
                  <Menu className="size-4.5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 flex flex-col bg-card">
                <SheetHeader className="border-b border-border px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-sm shadow-2xs">
                      K
                    </div>
                    <SheetTitle className="text-sm font-bold tracking-tight">KneaWork</SheetTitle>
                  </div>
                </SheetHeader>
                {renderNavLinks(() => setMobileMenuOpen(false))}
                <div className="border-t border-border p-3">
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-md p-2 hover:bg-accent transition-colors"
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted font-bold text-xs text-foreground">
                      {me.initials}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-foreground">{me.name}</p>
                      <p className="truncate text-[13px] text-muted-foreground">{me.role}</p>
                    </div>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>

            {/* Breadcrumb or Title */}
            <div className="min-w-0 flex-1">
              {breadcrumbs && breadcrumbs.length > 0 ? (
                <nav className="flex items-center gap-1.5 text-xs text-muted-foreground overflow-hidden">
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
                      {i < breadcrumbs.length - 1 ? <span className="text-muted-foreground">/</span> : null}
                    </span>
                  ))}
                </nav>
              ) : (
                <div className="min-w-0">
                  <h1 className="text-sm font-bold text-foreground truncate">{title}</h1>
                  {subtitle ? (
                    <p className="text-xs sm:text-[13px] text-muted-foreground truncate hidden sm:block">{subtitle}</p>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          {/* Action area */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {!isStaff ? (
              <Link
                to="/action"
                className="relative flex size-8 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                aria-label="My actions inbox"
              >
                <Bell className="size-4" />
                {actionCount > 0 ? (
                  <span className="absolute -top-1.5 -right-1.5 flex size-4.5 items-center justify-center rounded-full bg-attention text-xs font-bold text-attention-foreground">
                    {actionCount}
                  </span>
                ) : null}
              </Link>
            ) : null}

            {/* Persona pill */}
            <Link
              to="/profile"
              className="flex items-center gap-1.5 sm:gap-2 rounded-md border border-border bg-card px-2 sm:px-2.5 py-1 text-xs font-medium text-foreground hover:bg-accent transition-colors"
            >
              <span className="size-2 rounded-full bg-success shrink-0" />
              <span className="max-w-[75px] sm:max-w-28 truncate">
                {me.name}
              </span>
            </Link>
          </div>
        </header>

        {/* Main Content Body */}
        <main className="flex-1 w-full min-w-0 max-w-full overflow-x-hidden p-3.5 sm:p-6 lg:p-8 pb-24 lg:pb-8">
          <div className="mx-auto w-full min-w-0 max-w-7xl">{children}</div>
        </main>

        {/* Mobile Bottom Navigation (Responsive adaptation) */}
        <nav
          aria-label="Mobile Main"
          className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card lg:hidden"
        >
          <ul className="flex w-full justify-around">
            <li className="flex-1">
              <Link
                to="/"
                activeOptions={{ exact: true }}
                activeProps={{ className: "text-primary" }}
                inactiveProps={{ className: "text-muted-foreground" }}
                className="flex flex-col items-center gap-1 py-2 text-xs font-medium"
              >
                <Home className="size-4.5" />
                <span>Home</span>
              </Link>
            </li>
            {!isStaff ? (
              <li className="flex-1">
                <Link
                  to="/action"
                  activeProps={{ className: "text-primary" }}
                  inactiveProps={{ className: "text-muted-foreground" }}
                  className="relative flex flex-col items-center gap-1 py-2 text-xs font-medium"
                >
                  <Inbox className="size-4.5" />
                  <span>Action</span>
                  {actionCount > 0 ? (
                    <span className="absolute top-0.5 right-1/2 -mr-3.5 flex size-4 items-center justify-center rounded-full bg-attention text-xs font-bold text-attention-foreground">
                      {actionCount}
                    </span>
                  ) : null}
                </Link>
              </li>
            ) : null}
            <li className="flex-1">
              <Link
                to="/requests"
                activeProps={{ className: "text-primary" }}
                inactiveProps={{ className: "text-muted-foreground" }}
                className="flex flex-col items-center gap-1 py-2 text-xs font-medium"
              >
                <FileText className="size-4.5" />
                <span>Requests</span>
              </Link>
            </li>
            {!isStaff ? (
              <li className="flex-1">
                <Link
                  to="/admin"
                  activeProps={{ className: "text-primary" }}
                  inactiveProps={{ className: "text-muted-foreground" }}
                  className="flex flex-col items-center gap-1 py-2 text-xs font-medium"
                >
                  <LayoutDashboard className="size-4.5" />
                  <span>Overview</span>
                </Link>
              </li>
            ) : null}
            <li className="flex-1">
              <Link
                to="/profile"
                activeProps={{ className: "text-primary" }}
                inactiveProps={{ className: "text-muted-foreground" }}
                className="flex flex-col items-center gap-1 py-2 text-xs font-medium"
              >
                <Shield className="size-4.5" />
                <span>Profile</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
