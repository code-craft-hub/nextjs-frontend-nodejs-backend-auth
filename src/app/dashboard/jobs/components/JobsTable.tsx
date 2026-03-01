"use client";

import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { flexRender, Row, Table as TanstackTable } from "@tanstack/react-table";
import { OverviewEmpty, OverviewSkeleton } from "./OverviewColumn";

interface JobsTableProps<T extends object> {
  table: TanstackTable<T>;
  isLoading: boolean;
  hasNoResults: boolean;
  /** Shown in the empty state message */
  searchValue?: string;
  /** Called when the user clicks "Reset Search" in the empty state */
  onResetSearch?: () => void;
  /** Navigation / action to take when a row is clicked */
  onRowClick: (row: Row<T>) => void;
  /** Number of skeleton rows shown during initial load */
  skeletonCount?: number;
}

/**
 * Shared desktop-only job list table.
 * Hidden on mobile — pair with MobileOverview for small screens.
 *
 * Handles three states internally:
 *   1. Loading  → skeleton rows
 *   2. Empty    → empty-state illustration + optional reset
 *   3. Data     → rendered rows with click navigation
 */
export function JobsTable<T extends object>({
  table,
  isLoading,
  hasNoResults,
  searchValue,
  onResetSearch,
  onRowClick,
  skeletonCount = 5,
}: JobsTableProps<T>) {
  const visibleRows = table.getRowModel().rows;

  return (
    <div className="overflow-hidden border-none hidden lg:grid grid-cols-1">
      <Table>
        <TableBody>
          {isLoading ? (
            <td className="grid gap-4">
              {Array.from({ length: skeletonCount }).map((_, i) => (
                <OverviewSkeleton key={i} />
              ))}
            </td>
          ) : hasNoResults ? (
            <td className="flex flex-col gap-1 text-muted-foreground">
              <OverviewEmpty
                searchValue={searchValue}
                resetSearchToDefault={onResetSearch}
              />
            </td>
          ) : (
            visibleRows.map((row) => (
              <TableRow
                key={row.id}
                onClick={() => onRowClick(row)}
                data-state={row.getIsSelected() ? "selected" : undefined}
                className="hover:bg-white border-b rounded-3xl! hover:border-primary hover:border-2 hover:rounded-2xl hover:cursor-pointer"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
