import { ArrowRight, Loader2 } from "lucide-react";
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
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { JobType } from "@/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { jobsQueries } from "@/lib/queries/jobs.queries";
import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { JobFilters } from "@/lib/types/jobs";
import { ReportCard } from "@/app/dashboard/jobs/components/ReportCard";
import JobSearchInput from "@/components/shared/JobSearchInput";

export default function JobDashboard({
  hideToMenus,
  initialJobs,
  fingJobsColumns,
  filters,
}: {
  initialJobs: JobType[];
  fingJobsColumns: any;
  filters: Omit<JobFilters, "page">;
  hideToMenus?: boolean;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [searchValue, setSearchValue] = useState(() => {
    return filters;
  });
  const [isAutoFetching, setIsAutoFetching] = useState(false);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery(jobsQueries.infinite(searchValue));

  const allJobs = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? initialJobs;
  }, [data, initialJobs]);

  console.count("FINDJOB CLIENT RENDER");

  const table = useReactTable({
    data: allJobs,
    columns: fingJobsColumns,
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

  useEffect(() => {
    const checkAndFetchMore = async () => {
      const currentSearchValue = table
        .getColumn("title")
        ?.getFilterValue() as string;

      if (!currentSearchValue || currentSearchValue.trim() === "") {
        setIsAutoFetching(false);
        return;
      }

      const filteredRows = table.getFilteredRowModel().rows;

      if (filteredRows.length === 0 && hasNextPage && !isFetchingNextPage) {
        setIsAutoFetching(true);
        await fetchNextPage();
      } else {
        setIsAutoFetching(false);
      }
    };
    checkAndFetchMore();
  }, [
    table.getColumn("title")?.getFilterValue(),
    table.getFilteredRowModel().rows.length,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  ]);

  const visibleRows = table.getRowModel().rows;
  const hasNoResults = visibleRows.length === 0;

  const handleSearchSubmit = (data: any) => {
    setSearchValue((prev) => ({ ...prev, title: data }));
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {!hideToMenus && <ReportCard />}
      <JobSearchInput table={table} handleSearchSubmit={handleSearchSubmit} />
      <div className="flex flex-col gap-4">
        <div className="flex justify-between">
          <div className="">All Jobs</div>
          <p className="text-xs flex gap-1 text-gray-400">
            <span className="">View all</span>
            <ArrowRight className="size-4" />
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 ">
        <Table>
          <TableBody>
            {visibleRows.length ? (
              visibleRows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-white border-b !rounded-3xl hover:border-primary hover:border-[2px] hover:rounded-2xl hover:cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={fingJobsColumns.length}
                  className="h-24 text-center"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Searching for matching jobs...</span>
                    </div>
                  ) : hasNoResults && !hasNextPage ? (
                    <span>No results found. All data has been searched.</span>
                  ) : (
                    <span>No results.</span>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {hasNextPage && !isAutoFetching && (
        <div className="flex justify-center">
          <Button
            onClick={() => fetchNextPage()}
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
      )}
    </div>
  );
}
