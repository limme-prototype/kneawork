import { Link } from "@tanstack/react-router";
import { FileText, Home, Inbox, LayoutDashboard, Shield } from "lucide-react";
import * as React from "react";

import { AppSidebar } from "@/components/kneawork/app-sidebar";
import { AppTopbar } from "@/components/kneawork/app-topbar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { needsActionFrom, useKneaState } from "@/lib/kneawork/store";

export interface AppShellProps {
  title?: string | undefined;
  subtitle?: string | undefined;
  breadcrumbs?: { label: string; to?: string }[] | undefined;
  children: React.ReactNode;
}

export function AppShell({
  title,
  subtitle,
  breadcrumbs,
  children,
}: AppShellProps) {
  const { requests, currentUserId } = useKneaState();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("kneawork:sidebar_collapsed") === "true";
    }
    return false;
  });

  const isStaff = currentUserId === "u_staff";
  const actionCount = needsActionFrom(requests, currentUserId).length;

  const toggleCollapse = React.useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("kneawork:sidebar_collapsed", String(next));
      }
      return next;
    });
  }, []);

  // Global Ctrl+B / Cmd+B keyboard shortcut for sidebar collapse
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "b" || e.key === "B") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleCollapse();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleCollapse]);

  return (
    <div className="flex min-h-screen w-full bg-background font-sans text-foreground antialiased overflow-x-hidden">
      {/* 1. Desktop Left Sidebar */}
      <div className="hidden lg:flex shrink-0">
        <AppSidebar
          collapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
        />
      </div>

      {/* 2. Mobile / Tablet Drawer Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-72 p-0 flex flex-col bg-card">
          <SheetHeader className="border-b border-border px-5 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-sm shadow-2xs">
                K
              </div>
              <SheetTitle className="text-sm font-bold tracking-tight">KneaWork</SheetTitle>
            </div>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto">
            <AppSidebar
              isMobileDrawer
              onItemClick={() => setMobileMenuOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* 3. Main Content Column */}
      <div className="flex flex-1 flex-col min-w-0 w-full max-w-full overflow-x-hidden">
        {/* Topbar: Global Utilities */}
        <AppTopbar
          breadcrumbs={breadcrumbs}
          contextTitle={title}
          contextSubtitle={subtitle}
          isSidebarCollapsed={isCollapsed}
          onToggleSidebarCollapse={toggleCollapse}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        {/* Page Content Body */}
        <main className="flex-1 w-full min-w-0 max-w-full overflow-x-hidden p-3.5 sm:p-6 lg:p-8 pb-24 lg:pb-8">
          <div className="mx-auto w-full min-w-0 max-w-7xl">{children}</div>
        </main>

        {/* 4. Mobile Bottom Navigation (Strictly max 5 items for mobile phone ergonomics) */}
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
      </div>
    </div>
  );
}
