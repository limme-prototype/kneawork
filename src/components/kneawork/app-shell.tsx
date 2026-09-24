import * as React from "react";

import { AppSidebar } from "@/components/kneawork/app-sidebar";
import { AppTopbar } from "@/components/kneawork/app-topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export interface AppShellProps {
  title?: string | undefined;
  subtitle?: string | undefined;
  breadcrumbs?: { label: string; to?: string }[] | undefined;
  children: React.ReactNode;
  hideMobileNav?: boolean;
}

export function AppShell({ title, subtitle, breadcrumbs, children }: AppShellProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      {/* 1. Official shadcn Collapsible Desktop & Mobile Sheet AppSidebar */}
      <AppSidebar />

      {/* 2. Main Inset Container */}
      <SidebarInset className="min-w-0 flex flex-col bg-background">
        {/* Topbar: Global Utilities, SidebarTrigger & RouteBreadcrumbs */}
        <AppTopbar breadcrumbs={breadcrumbs} contextTitle={title} contextSubtitle={subtitle} />

        {/* Page Content Body: Clean single-surface without bottom nav clutter */}
        <main className={cn("flex-1 w-full min-w-0 max-w-full p-3.5 sm:p-6 lg:p-8 pb-8 sm:pb-10")}>
          <div className="mx-auto w-full min-w-0 max-w-7xl">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
