"use client";
import { useState } from "react";
import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useUpdateJobMutation } from "@/lib/mutations/jobs.mutations";
import { useApplyJob } from "@/hooks/useApplyJob";
import { ReportCard } from "@/app/dashboard/jobs/components/ReportCard";
import { OverviewColumn } from "@/app/dashboard/jobs/components/OverviewColumn";
import { OverviewEmpty } from "./column";
import MobileOverview from "@/modules/job-posts/components/MobileOverview";

export default function DisplayTable({
  allJobs,
  // fetchNextPage,
  // hasNextPage,
  isLoading,
  isFetching,
  isRefetching,
  isFetchingNextPage,
  totalScore = 0,
}: {
  allJobs: any[];
  fetchNextPage?: () => void;
  hasNextPage?: boolean;
  isLoading?: boolean;
  isFetching?: boolean;
  isRefetching?: boolean;
  isFetchingNextPage?: boolean;
  totalScore?: number;
}) {
  const router = useRouter();

  const updateJobs = useUpdateJobMutation();
  const { applyToJob: handleApply } = useApplyJob();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const columns = OverviewColumn({
    router,
    updateJobs,
    handleApply,
  });

  const table = useReactTable({
    data: allJobs ?? [],
    columns: columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const visibleRows = table.getRowModel().rows;
  const isSearching =
    isLoading || isFetching || isRefetching || isFetchingNextPage;
  const hasNoResults = !isSearching && (allJobs?.length ?? 0) === 0;

  return (
    <div className="w-full flex flex-col gap-6">
      <ReportCard matchPercentage={totalScore} />

      <div className="hidden lg:grid grid-cols-1">
        <Table>
          <TableBody>
            {hasNoResults ? (
              <div className="flex flex-col gap-1 text-muted-foreground">
                <OverviewEmpty
                  searchValue={undefined}
                  resetSearchToDefault={() => {}}
                />
              </div>
            ) : (
              visibleRows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={() =>
                    router.push(
                      `/dashboard/jobs/${row.original.id}?referrer=jobs&title=${row.original.title}`,
                    )
                  }
                  className="hover:bg-white border-b rounded-3xl! hover:border-primary hover:border-2 hover:rounded-2xl hover:cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <MobileOverview
        allJobs={allJobs}
        updateJobs={updateJobs}
        handleApply={handleApply}
      />

      {/* {hasNextPage && (
        <div className="flex justify-center">
          <Button
            onClick={() => fetchNextPage?.()}
            disabled={isFetchingNextPage}
            variant="outline"
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading more...
              </>
            ) : (
              "Load More Jobs"
            )}
          </Button>
        </div>
      )} */}
    </div>
  );
}
