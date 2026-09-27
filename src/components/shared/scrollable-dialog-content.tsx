/**
 * ScrollableDialogContent
 *
 * A generic, reusable dialog shell that uses shadcn ScrollArea for the body.
 * The header and footer stay pinned; only the body scrolls.
 *
 * WHY CSS GRID instead of flexbox:
 *   With `flex-1 min-h-0`, the ScrollArea Root gets a flex-computed height,
 *   but the Radix Viewport's `h-full` resolves to the Root's content height
 *   (not the flex track height) in some browsers, so scroll never activates.
 *
 *   With CSS Grid `grid-template-rows: auto minmax(0, 1fr) auto`:
 *   - Row 1 (header): auto          → exactly as tall as its content
 *   - Row 2 (body):   minmax(0, 1fr) → fills remaining space, but can shrink
 *                                  to 0 so overflow is clamped by the dialog's
 *                                  max-height instead of growing the dialog
 *   - Row 3 (footer): auto          → exactly as tall as its content
 *   The ScrollArea lives in the middle row, so its computed height = remaining
 *   space. The Radix Viewport's `h-full` then correctly equals that computed
 *   height, and scroll activates as soon as content overflows it.
 *
 *   The `minmax(0, 1fr)` minimum is load-bearing: a bare `1fr` track uses an
 *   automatic minimum size, so the track would size to its content and the
 *   dialog would grow past `maxHeight` instead of scrolling.
 *
 *   The row template is set as an inline style, so it must be a real CSS value
 *   — rows separated by spaces. Underscores are Tailwind arbitrary-value syntax
 *   only and would make the whole declaration invalid.
 *
 * Usage:
 *   <ScrollableDialogContent
 *     maxWidth="sm:max-w-xl"
 *     maxHeight="85vh"
 *     header={<DialogHeader>…</DialogHeader>}
 *     footer={<DialogFooter>…</DialogFooter>}
 *   >
 *     <div className="p-5 space-y-4">…body content…</div>
 *   </ScrollableDialogContent>
 */

import * as React from "react";
import { DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export interface ScrollableDialogContentProps
  extends Omit<React.ComponentPropsWithoutRef<typeof DialogContent>, "children"> {
  /** Tailwind max-width class. e.g. "sm:max-w-xl". Default: "sm:max-w-lg". */
  maxWidth?: string;
  /**
   * CSS value for the dialog's max height. Applied as an inline style.
   * Default: "85vh".
   */
  maxHeight?: string;
  /** Sticky header (title, description, tab switchers, etc.). Always visible. */
  header?: React.ReactNode;
  /** Sticky footer (action buttons). Always visible. Optional. */
  footer?: React.ReactNode;
  /** Scrollable body content. */
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
  // Build the correct grid-rows template based on which slots are provided.
  // NOTE: rows are separated by a SPACE, not an underscore — "_" is only
  // Tailwind arbitrary-value syntax and is invalid in a real inline style.
  // The middle row MUST be minmax(0, 1fr): a bare 1fr track has an automatic
  // minimum size, so it would still grow to fit its content and never scroll.
  const gridTemplateRows = [
    header ? "auto" : null,
    "minmax(0, 1fr)",
    footer ? "auto" : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <DialogContent
      className={cn(
        // p-0 / gap-0: remove default dialog padding — sections own their own padding
        // overflow-hidden: hard-clip the dialog; scroll happens only inside ScrollArea
        // grid + dynamic rows: gives the 1fr row a REAL computed pixel height,
        //   which the Radix ScrollArea Viewport can resolve h-full against
        "p-0 gap-0 overflow-hidden grid",
        maxWidth,
        className,
      )}
      style={{
        maxHeight,
        gridTemplateRows,
        ...style,
      }}
      {...props}
    >
      {/* ── Sticky header ── */}
      {header && (
        <div className="border-b border-border">
          {header}
        </div>
      )}

      {/* ── Scrollable body ──
          The grid minmax(0, 1fr) row gives this a definite, capped pixel height.
          ScrollArea Root: overflow-hidden (already set by shadcn) + min-h-0
          ScrollArea Viewport: h-full → equals the track height → scroll works */}
      <ScrollArea className="min-h-0 overflow-hidden">
        {children}
      </ScrollArea>

      {/* ── Sticky footer ── */}
      {footer && (
        <div className="border-t border-border">
          {footer}
        </div>
      )}
    </DialogContent>
  );
}
