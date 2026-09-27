/**
 * ScrollableDialogContent
 *
 * A generic, reusable dialog shell that uses shadcn ScrollArea for the body
 * so the browser never scrolls the entire dialog — only the content area does.
 *
 * How scroll works:
 *   1. DialogContent gets max-h-[85vh] (or custom maxHeight) so it has a hard ceiling.
 *   2. Header + footer are shrink-0 (fixed height).
 *   3. ScrollArea gets flex-1 + min-h-0 so it takes remaining space and scrolls within it.
 *      min-h-0 is REQUIRED in a flex column — without it, flex-1 children won't shrink
 *      below their content height and the scroll will never trigger.
 *
 * Structure:
 *   <DialogContent>  ← max-h-[85vh], flex col, overflow-hidden
 *     [sticky header]  ← shrink-0, always visible
 *     <ScrollArea>     ← flex-1 min-h-0, scrolls independently
 *       {children}
 *     </ScrollArea>
 *     [sticky footer]  ← shrink-0, always visible (optional)
 *   </DialogContent>
 *
 * Usage:
 *   <ScrollableDialogContent
 *     maxWidth="sm:max-w-xl"
 *     maxHeight="85vh"          // optional override, default "85vh"
 *     header={<DialogHeader>…</DialogHeader>}
 *     footer={<DialogFooter>…</DialogFooter>}
 *   >
 *     <div className="p-5 space-y-4">…your content…</div>
 *   </ScrollableDialogContent>
 */

import * as React from "react";
import { DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export interface ScrollableDialogContentProps
  extends Omit<React.ComponentPropsWithoutRef<typeof DialogContent>, "children"> {
  /** Max-width Tailwind class e.g. "sm:max-w-xl". Defaults to "sm:max-w-lg". */
  maxWidth?: string;
  /**
   * Max height CSS value e.g. "85vh" or "600px".
   * Applied to the DialogContent as an inline style.
   * Defaults to "85vh".
   */
  maxHeight?: string;
  /**
   * Sticky header rendered above the scroll area.
   * Typically a <DialogHeader> with title, description, and optional tab switcher.
   */
  header?: React.ReactNode;
  /**
   * Sticky footer rendered below the scroll area.
   * Typically a <DialogFooter> with action buttons.
   */
  footer?: React.ReactNode;
  /** Scrollable body content. Wrap in a <div className="p-5 space-y-…"> as needed. */
  children: React.ReactNode;
}

export function ScrollableDialogContent({
  maxWidth = "sm:max-w-lg",
  maxHeight = "85vh",
  header,
  footer,
  children,
  className,
  style,
  ...props
}: ScrollableDialogContentProps) {
  return (
    <DialogContent
      className={cn(
        // p-0: we control padding per-section
        // flex flex-col: stack header / scroll body / footer vertically
        // overflow-hidden: clip content — scroll happens inside ScrollArea only
        "p-0 gap-0 flex flex-col overflow-hidden",
        maxWidth,
        className,
      )}
      style={{ maxHeight, ...style }}
      {...props}
    >
      {/* ── Sticky header — always visible, never scrolls ── */}
      {header && (
        <div className="shrink-0 border-b border-border">
          {header}
        </div>
      )}

      {/* ── Scrollable body via shadcn ScrollArea ──
          flex-1   → takes all remaining height between header and footer
          min-h-0  → CRITICAL: allows flex-1 child to shrink below content height
                     Without this, the child grows to content height and never scrolls */}
      <ScrollArea className="flex-1 min-h-0">
        {children}
      </ScrollArea>

      {/* ── Sticky footer — always visible, never scrolls ── */}
      {footer && (
        <div className="shrink-0 border-t border-border">
          {footer}
        </div>
      )}
    </DialogContent>
  );
}
