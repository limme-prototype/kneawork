/**
 * ScrollableDialogContent
 *
 * A generic, reusable dialog shell that uses shadcn ScrollArea for the body
 * so the browser never scrolls the entire dialog — only the content area does.
 *
 * Structure:
 *   <DialogContent> (no overflow)
 *     [sticky header]   ← always visible
 *     <ScrollArea>      ← scrolls independently
 *       {children}
 *     </ScrollArea>
 *     [sticky footer]   ← always visible (optional)
 *   </DialogContent>
 *
 * Usage:
 *   <ScrollableDialogContent
 *     maxWidth="sm:max-w-xl"
 *     maxHeight="80vh"          // default "85vh"
 *     header={<DialogHeader>…</DialogHeader>}
 *     footer={<DialogFooter>…</DialogFooter>}
 *   >
 *     <div className="p-5 space-y-4">…your content…</div>
 *   </ScrollableDialogContent>
 */

import * as React from "react";
import {
  DialogContent,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export interface ScrollableDialogContentProps
  extends Omit<React.ComponentPropsWithoutRef<typeof DialogContent>, "children"> {
  /** Max-width Tailwind class e.g. "sm:max-w-xl". Defaults to "sm:max-w-lg". */
  maxWidth?: string;
  /**
   * Max height for the scroll area in CSS value (not Tailwind class) e.g. "calc(85vh - 180px)".
   * Defaults to "calc(85vh - 180px)".
   */
  scrollHeight?: string;
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
  scrollHeight = "calc(85vh - 180px)",
  header,
  footer,
  children,
  className,
  ...props
}: ScrollableDialogContentProps) {
  return (
    <DialogContent
      className={cn(
        // No padding on root — header/footer/scroll area each own their padding
        "p-0 gap-0 flex flex-col overflow-hidden",
        maxWidth,
        className,
      )}
      {...props}
    >
      {/* ── Sticky header ── */}
      {header && (
        <div className="shrink-0 border-b border-border">
          {header}
        </div>
      )}

      {/* ── Scrollable body via shadcn ScrollArea ── */}
      <ScrollArea
        className="flex-1"
        style={{ maxHeight: scrollHeight }}
      >
        {children}
      </ScrollArea>

      {/* ── Sticky footer ── */}
      {footer && (
        <div className="shrink-0 border-t border-border">
          {footer}
        </div>
      )}
    </DialogContent>
  );
}
