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
} from "lucide-react";
import type { ReactNode } from "react";

import { personById } from "@/lib/kneawork/data";
import { needsActionFrom, useKneaState } from "@/lib/kneawork/store";

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
  const me = personById(currentUserId);
  const actionCount = needsActionFrom(requests, currentUserId).length;

  const isStaff = currentUserId === "u_staff";
  const isManager = currentUserId === "u_manager";
  const isAdmin =
    currentUserId === "u_admin" || currentUserId === "u_director" || currentUserId === "u_finance";

  return (
    <div className="flex min-h-screen w-full bg-background font-sans text-foreground antialiased">
      {/* 1. Desktop Left Sidebar (HiBob & Sentinel Enterprise Architecture) */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col border-r border-border bg-card">
        {/* Brand */}
        <div className="flex h-14 items-center gap-2.5 border-b border-border px-5">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-sm shadow-2xs">
            K
          </div>
          <div>
            <span className="font-bold text-foreground text-sm tracking-tight">KneaWork</span>
            <span className="ml-1.5 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              Operations
            </span>
          </div>
        </div>

        {/* Navigation list structured into Workspace, Manage, Settings */}
        <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
          {/* Section 1: Workspace */}
          <div>
            <p className="px-3 text-[11px] font-semibold text-muted-foreground">Workspace</p>
            <nav className="mt-1.5 space-y-1">
              {/* Home */}
              <Link
                to="/"
                activeOptions={{ exact: true }}
                activeProps={{ className: "bg-muted text-primary font-semibold" }}
                inactiveProps={{
                  className: "text-muted-foreground hover:bg-accent hover:text-foreground",
                }}
                className="flex items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium transition-colors"
              >
                <Home className="size-4" />
                <span>Home</span>
              </Link>

              {/* My Action (Approvers & Admins only) */}
              {!isStaff ? (
                <Link
                  to="/action"
                  activeOptions={{ exact: false }}
                  activeProps={{ className: "bg-muted text-primary font-semibold" }}
                  inactiveProps={{
                    className: "text-muted-foreground hover:bg-accent hover:text-foreground",
                  }}
                  className="flex items-center justify-between rounded-md px-3 py-2 text-xs font-medium transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Inbox className="size-4" />
                    <span>My Action</span>
                  </div>
                  {actionCount > 0 ? (
                    <span className="flex size-4.5 items-center justify-center rounded-full bg-attention text-[10px] font-bold text-attention-foreground">
                      {actionCount}
                    </span>
                  ) : null}
                </Link>
              ) : null}

              {/* All Requests / Team Requests */}
              <Link
                to="/requests"
                activeOptions={{ exact: false }}
                activeProps={{ className: "bg-muted text-primary font-semibold" }}
                inactiveProps={{
                  className: "text-muted-foreground hover:bg-accent hover:text-foreground",
                }}
                className="flex items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium transition-colors"
              >
                <FileText className="size-4" />
                <span>{isStaff ? "My Requests" : "All Requests"}</span>
              </Link>
            </nav>
          </div>

          {/* Section 2: Manage (Admins & Managers) */}
          {!isStaff ? (
            <div>
              <p className="px-3 text-[11px] font-semibold text-muted-foreground">Manage</p>
              <nav className="mt-1.5 space-y-1">
                {/* Operations Overview */}
                <Link
                  to="/admin"
                  activeOptions={{ exact: true }}
                  activeProps={{ className: "bg-muted text-primary font-semibold" }}
                  inactiveProps={{
                    className: "text-muted-foreground hover:bg-accent hover:text-foreground",
                  }}
                  className="flex items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium transition-colors"
                >
                  <LayoutDashboard className="size-4" />
                  <span>Operations overview</span>
                </Link>

                <Link
                  to="/templates"
                  activeOptions={{ exact: false }}
                  activeProps={{ className: "bg-muted text-primary font-semibold" }}
                  inactiveProps={{
                    className: "text-muted-foreground hover:bg-accent hover:text-foreground",
                  }}
                  className="flex items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium transition-colors"
                >
                  <Layers className="size-4" />
                  <span>Templates</span>
                </Link>
                <Link
                  to="/team"
                  activeOptions={{ exact: false }}
                  activeProps={{ className: "bg-muted text-primary font-semibold" }}
                  inactiveProps={{
                    className: "text-muted-foreground hover:bg-accent hover:text-foreground",
                  }}
                  className="flex items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium transition-colors"
                >
                  <Users className="size-4" />
                  <span>Team & roles</span>
                </Link>
              </nav>
            </div>
          ) : null}

          {/* Section 3: Settings */}
          <div>
            <p className="px-3 text-[11px] font-semibold text-muted-foreground">Settings</p>
            <nav className="mt-1.5 space-y-1">
              {isAdmin ? (
                <Link
                  to="/settings"
                  activeOptions={{ exact: false }}
                  activeProps={{ className: "bg-muted text-primary font-semibold" }}
                  inactiveProps={{
                    className: "text-muted-foreground hover:bg-accent hover:text-foreground",
                  }}
                  className="flex items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium transition-colors"
                >
                  <Settings className="size-4" />
                  <span>Workspace settings</span>
                </Link>
              ) : null}

              <Link
                to="/profile"
                activeOptions={{ exact: false }}
                activeProps={{ className: "bg-muted text-primary font-semibold" }}
                inactiveProps={{
                  className: "text-muted-foreground hover:bg-accent hover:text-foreground",
                }}
                className="flex items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium transition-colors"
              >
                <Shield className="size-4" />
                <span>My profile</span>
              </Link>
            </nav>
          </div>
        </div>

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
                <p className="truncate text-[11px] text-muted-foreground">
                  {me.role.split(" ")[0]}
                </p>
              </div>
            </div>
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </Link>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-card/95 px-4 sm:px-8 backdrop-blur">
          {/* Breadcrumb or Title */}
          <div className="min-w-0">
            {breadcrumbs && breadcrumbs.length > 0 ? (
              <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {breadcrumbs.map((b, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    {b.to ? (
                      <Link to={b.to} className="hover:text-foreground font-medium">
                        {b.label}
                      </Link>
                    ) : (
                      <span className="font-semibold text-foreground">{b.label}</span>
                    )}
                    {i < breadcrumbs.length - 1 ? <span>/</span> : null}
                  </span>
                ))}
              </nav>
            ) : (
              <div>
                <h1 className="text-sm font-bold text-foreground truncate">{title}</h1>
                {subtitle ? (
                  <p className="text-[11px] text-muted-foreground truncate">{subtitle}</p>
                ) : null}
              </div>
            )}
          </div>

          {/* Action area */}
          <div className="flex items-center gap-3">
            {!isStaff ? (
              <Link
                to="/action"
                className="relative flex size-8 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                <Bell className="size-4" />
                {actionCount > 0 ? (
                  <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-attention text-[9px] font-bold text-attention-foreground">
                    {actionCount}
                  </span>
                ) : null}
              </Link>
            ) : null}

            {/* Persona pill */}
            <Link
              to="/profile"
              className="flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground hover:bg-accent transition-colors"
            >
              <span className="size-2 rounded-full bg-success" />
              <span className="max-w-28 truncate">
                {me.name} ({me.role.split(" ")[0]})
              </span>
            </Link>
          </div>
        </header>

        {/* Main Content Body */}
        <main className="flex-1 p-4 sm:p-8 pb-24 lg:pb-8">
          <div className="mx-auto max-w-7xl">{children}</div>
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
                className="flex flex-col items-center gap-1 py-2 text-[10px] font-medium"
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
                  className="relative flex flex-col items-center gap-1 py-2 text-[10px] font-medium"
                >
                  <Inbox className="size-4.5" />
                  <span>Action</span>
                  {actionCount > 0 ? (
                    <span className="absolute top-1 right-1/2 -mr-3 flex size-3.5 items-center justify-center rounded-full bg-attention text-[8px] font-bold text-attention-foreground">
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
                className="flex flex-col items-center gap-1 py-2 text-[10px] font-medium"
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
                  className="flex flex-col items-center gap-1 py-2 text-[10px] font-medium"
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
                className="flex flex-col items-center gap-1 py-2 text-[10px] font-medium"
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
