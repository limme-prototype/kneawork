import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: string;
  count?: number | undefined;
  icon?: React.ComponentType<{ className?: string }> | undefined;
}

export interface ScrollableTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
  ariaLabel?: string;
}

export function ScrollableTabs({
  tabs,
  activeTab,
  onTabChange,
  className,
  ariaLabel = "Navigation Tabs",
}: ScrollableTabsProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  const checkScroll = React.useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  }, []);

  React.useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [checkScroll, tabs]);

  const scroll = (direction: "left" | "right") => {
    const el = containerRef.current;
    if (!el) return;
    const distance = 160;
    el.scrollBy({ left: direction === "left" ? -distance : distance, behavior: "smooth" });
    setTimeout(checkScroll, 250);
  };

  return (
    <div className={cn("relative w-full group", className)}>
      {/* Scroll Left Cue Button (Desktop & Tablet) */}
      {canScrollLeft ? (
        <button
          type="button"
          onClick={() => scroll("left")}
          aria-label="Scroll tabs left"
          className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 size-7 items-center justify-center rounded-full bg-card/95 border border-border shadow-md text-foreground hover:bg-muted"
        >
          <ChevronLeft className="size-4" />
        </button>
      ) : null}

      {/* Tabs Container */}
      <div
        ref={containerRef}
        onScroll={checkScroll}
        role="tablist"
        aria-label={ariaLabel}
        className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-1 px-0.5"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <Button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => {
                onTabChange(tab.id);
                // Ensure selected tab is visible
                const el = containerRef.current;
                if (el) {
                  // Slight delay for active state
                  setTimeout(checkScroll, 100);
                }
              }}
              className={cn(
                "h-9 min-h-[36px] sm:h-8 px-3 text-xs sm:text-[13px] font-medium shrink-0 transition-all rounded-md gap-1.5",
                isActive
                  ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                  : "border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/70",
              )}
            >
              {Icon ? <Icon className="size-3.5 shrink-0" /> : null}
              <span>{tab.label}</span>
              {typeof tab.count === "number" ? (
                <span
                  className={cn(
                    "ml-1 rounded-full px-1.5 py-0.2 text-[11px] font-mono",
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {tab.count}
                </span>
              ) : null}
            </Button>
          );
        })}
      </div>

      {/* Scroll Right Cue Button (Desktop & Tablet) */}
      {canScrollRight ? (
        <button
          type="button"
          onClick={() => scroll("right")}
          aria-label="Scroll tabs right"
          className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 size-7 items-center justify-center rounded-full bg-card/95 border border-border shadow-md text-foreground hover:bg-muted"
        >
          <ChevronRight className="size-4" />
        </button>
      ) : null}
    </div>
  );
}
