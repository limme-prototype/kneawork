import * as React from "react";
import type { Table, Row } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import { DataTableMobileCard } from "./data-table-mobile-card";

interface DataTableMobileListProps<TData> {
  table: Table<TData>;
  renderMobileCard?: ((row: TData, index: number) => React.ReactNode) | undefined;
  onRowClick?: ((row: TData) => void) | undefined;
}

export function DataTableMobileList<TData>({
  table,
  renderMobileCard,
  onRowClick,
}: DataTableMobileListProps<TData>) {
  const rows = table.getRowModel().rows;

  return (
    <div className="space-y-3 p-3">
      {rows.map((row, index) => {
        if (renderMobileCard) {
          return <div key={row.id}>{renderMobileCard(row.original, index)}</div>;
        }

        // Automatic fallback card generation using visible columns
        const visibleCells = row
          .getVisibleCells()
          .filter((c) => c.column.id !== "select" && c.column.id !== "__rowNumber");
        const firstCell = visibleCells[0];
        const secondCell = visibleCells[1];
        const remainingCells = visibleCells.slice(2);

        return (
          <DataTableMobileCard
            key={row.id}
            selected={row.getIsSelected()}
            onSelectChange={
              table.options.enableRowSelection
                ? (checked) => row.toggleSelected(checked)
                : undefined
            }
            onClick={onRowClick ? () => onRowClick(row.original) : undefined}
            title={
              firstCell
                ? flexRender(firstCell.column.columnDef.cell, firstCell.getContext())
                : `Item ${index + 1}`
            }
            subtitle={
              secondCell
                ? flexRender(secondCell.column.columnDef.cell, secondCell.getContext())
                : undefined
            }
            attributes={remainingCells.map((cell) => {
              const header = cell.column.columnDef.header;
              const headerTitle = typeof header === "string" ? header : cell.column.id;
              return {
                label: headerTitle,
                value: flexRender(cell.column.columnDef.cell, cell.getContext()),
              };
            })}
          />
        );
      })}
    </div>
  );
}
