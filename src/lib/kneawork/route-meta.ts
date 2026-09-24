export interface RouteMeta {
  label: string;
  href?: string;
  parent?: string;
  group?: "workspace" | "manage" | "settings";
}

export const ROUTE_META: Record<string, RouteMeta> = {
  "/": { label: "Home", href: "/", group: "workspace" },
  "/action": { label: "My Action", href: "/action", parent: "/", group: "workspace" },
  "/requests": { label: "All Requests", href: "/requests", parent: "/", group: "workspace" },
  "/requests/new": { label: "Create Request", href: "/requests/new", parent: "/requests", group: "workspace" },
  "/requests/$requestId": { label: "Request Details", href: "/requests", parent: "/requests", group: "workspace" },
  "/templates": { label: "Templates", href: "/templates", parent: "/", group: "manage" },
  "/team": { label: "Team & Roles", href: "/team", parent: "/", group: "manage" },
  "/admin": { label: "Operations Overview", href: "/admin", parent: "/", group: "manage" },
  "/settings": { label: "Workspace Settings", href: "/settings", parent: "/", group: "settings" },
  "/profile": { label: "My Profile", href: "/profile", parent: "/", group: "settings" },
};

export interface BreadcrumbSegment {
  label: string;
  to?: string;
  isCurrent?: boolean;
}

/**
 * Resolves a hierarchical trail of breadcrumbs from a given pathname.
 * Accepts optional manual overrides or dynamic item labels (e.g. for dynamic request IDs/titles).
 */
export function resolveBreadcrumbs(
  pathname: string,
  customTrail?: { label: string; to?: string }[],
  dynamicLabel?: string,
): BreadcrumbSegment[] {
  if (customTrail && customTrail.length > 0) {
    return customTrail.map((item, idx) => ({
      ...item,
      isCurrent: idx === customTrail.length - 1,
    }));
  }

  // Check exact match first
  let matchedPattern = pathname;
  if (!ROUTE_META[matchedPattern]) {
    // Check dynamic routes
    if (pathname.startsWith("/requests/") && pathname !== "/requests/new") {
      matchedPattern = "/requests/$requestId";
    }
  }

  const meta = ROUTE_META[matchedPattern];
  if (!meta) {
    return [
      { label: "Home", to: "/" },
      { label: pathname.replace("/", ""), isCurrent: true },
    ];
  }

  const trail: BreadcrumbSegment[] = [];

  let currentKey: string | undefined = matchedPattern;
  while (currentKey) {
    const currentMeta: RouteMeta | undefined = ROUTE_META[currentKey];
    if (!currentMeta) break;

    const isCurrent = currentKey === matchedPattern;
    const label = isCurrent && dynamicLabel ? dynamicLabel : currentMeta.label;

    trail.unshift({
      label,
      to: isCurrent ? undefined : (currentMeta.href ?? currentKey),
      isCurrent,
    });

    currentKey = currentMeta.parent;
  }

  // Ensure "Home" is always at the root if not present
  if (trail.length > 0 && trail[0]?.to !== "/" && trail[0]?.label !== "Home") {
    trail.unshift({ label: "Home", to: "/" });
  }

  return trail;
}
