import { Link } from "@tanstack/react-router";
import { FileText, Home, Inbox, LayoutDashboard, Shield } from "lucide-react";
import * as React from "react";

import { AppSidebar } from "@/components/kneawork/app-sidebar";
import { AppTopbar } from "@/components/kneawork/app-topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { needsActionFrom, useKneaState } from "@/lib/kneawork/store";
import { cn } from "@/lib/utils";

export interface AppShellProps {
  title?: string | undefined;
  subtitle?: string | undefined;
  breadcrumbs?: { label: string; to?: string }[] | undefined;
  children: React.ReactNode;
  hideMobileNav?: boolean;
}

export function AppShell({
  title,
  subtitle,
  breadcrumbs,
  children,
  hideMobileNav = false,
}: AppShellProps) {
  const { requests, currentUserId } = useKneaState();
  const isStaff = currentUserId === "u_staff";
  const actionCount = needsActionFrom(requests, currentUserId).length;

  return (
    <SidebarProvider defaultOpen={true}>
      {/* 1. Official shadcn Collapsible / Mobile Sheet AppSidebar */}
      <AppSidebar />

      {/* 2. Main Inset Container */}
      <SidebarInset className="min-w-0 flex flex-col bg-background">
        {/* Topbar: Global Utilities, SidebarTrigger & RouteBreadcrumbs */}
        <AppTopbar
          breadcrumbs={breadcrumbs}
          contextTitle={title}
          contextSubtitle={subtitle}
        />

        {/* Page Content Body */}
        <main
          className={cn(
            "flex-1 w-full min-w-0 max-w-full p-3.5 sm:p-6 lg:p-8",
            hideMobileNav ? "pb-8" : "pb-24 lg:pb-8",
          )}
        >
          <div className="mx-auto w-full min-w-0 max-w-7xl">{children}</div>
        </main>

        {/* 3. Mobile Bottom Navigation (Ergonomic thumb reach on phone, hidden during focused editing) */}
        {!hideMobileNav ? (
          <nav
            aria-label="Mobile Main Navigation"
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
        ) : null}
      </SidebarInset>
    </SidebarProvider>
  );
}
