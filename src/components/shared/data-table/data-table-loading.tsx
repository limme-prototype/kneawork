import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { TableRow, TableCell } from "@/components/ui/table";

export interface DataTableLoadingProps {
  columnsCount: number;
  rowCount?: number;
}

export function DataTableLoadingRows({ columnsCount, rowCount = 5 }: DataTableLoadingProps) {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, rIdx) => (
        <TableRow key={`loading-row-${rIdx}`}>
          {Array.from({ length: columnsCount }).map((__, cIdx) => (
            <TableCell key={`loading-cell-${rIdx}-${cIdx}`} className="py-3.5">
              <Skeleton className="h-4 w-full max-w-[120px]" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

export function DataTableLoadingCards({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3 p-3">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={`card-skel-${idx}`}
          className="rounded-lg border border-border bg-card p-4 space-y-3 shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-4 w-28" />
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-7 w-20 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
