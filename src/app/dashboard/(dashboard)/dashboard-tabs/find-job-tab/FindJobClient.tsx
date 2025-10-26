import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ArrowRight, SearchIcon, Loader2 } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { JobType } from "@/types";
import { useRouter } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { jobsQueries } from "@/lib/queries/jobs.queries";
import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { JobFilters } from "@/lib/types/jobs";
import { menuItems } from "@/lib/utils/constants";

export default function JobDashboard({
  initialJobs,
  fingJobsColumns,
  filters,
}: {
  initialJobs: JobType[];
  fingJobsColumns: any;
  filters: Omit<JobFilters, "page">;
}) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [searchValue, setSearchValue] = useState("");
  const [isAutoFetching, setIsAutoFetching] = useState(false);

  // Remove 'page' from filters if present
  const { page, ...infiniteFilters } = filters as any;

  // Use infinite query
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery(jobsQueries.infinite(infiniteFilters));

  // Flatten all pages into a single array
  const allJobs = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? initialJobs;
  }, [data, initialJobs]);

  const table = useReactTable({
    data: allJobs,
    columns: fingJobsColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    // REMOVED: getPaginationRowModel() - This was limiting display to 10 items
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

  // Auto-fetch logic when search returns no results
  useEffect(() => {
    const checkAndFetchMore = async () => {
      const currentSearchValue = table
        .getColumn("title")
        ?.getFilterValue() as string;

      // Only proceed if there's a search value
      if (!currentSearchValue || currentSearchValue.trim() === "") {
        setIsAutoFetching(false);
        return;
      }

      const filteredRows = table.getFilteredRowModel().rows;

      // If no results found and there are more pages, fetch next page
      if (filteredRows.length === 0 && hasNextPage && !isFetchingNextPage) {
        setIsAutoFetching(true);
        await fetchNextPage();
      } else {
        setIsAutoFetching(false);
      }
    };

    // Debounce the check to avoid too many calls
    const timeoutId = setTimeout(checkAndFetchMore, 300);

    return () => clearTimeout(timeoutId);
  }, [
    table.getColumn("title")?.getFilterValue(),
    table.getFilteredRowModel().rows.length,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  ]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchValue(value);
    table.getColumn("title")?.setFilterValue(value);
  };

  const visibleRows = table.getRowModel().rows;
  const hasNoResults = visibleRows.length === 0;
  const isSearching = isAutoFetching || isFetchingNextPage;

  return (
    <div className="w-full flex flex-col gap-6">
      <ScrollArea className="grid grid-cols-1">
        <div className="flex flex-row gap-4 py-4 mx-auto w-fit">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className={cn(
                item.bgColor,
                "flex justify-between p-4 items-center rounded-md w-64 hover:shadow-sm hover:cursor-pointer"
              )}
              onClick={() => {
                router.push(item.url);
              }}
            >
              <div className="">
                <h1 className="font-bold mb-1">{item.count}</h1>
                <p className="text-xs">{item.label}</p>
              </div>
              <div className="bg-white p-3 size-fit rounded-sm">
                <img src={item.icon} alt={item.label} className="size-4" />
              </div>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <div className="bg-white shadow-lg p-4 flex gap-4 justify-between rounded-lg">
        <div className="flex items-center gap-2 w-full">
          <SearchIcon />
          <input
            type="text"
            value={searchValue}
            onChange={handleSearchChange}
            placeholder="Job title / Company name"
            className={cn(
              "focus-visible:border-none focus-visible:outline-none w-full"
            )}
          />
          {isSearching || isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
        <div>
          <Button>Search</Button>
        </div>
      </div>
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
                  {isSearching ? (
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