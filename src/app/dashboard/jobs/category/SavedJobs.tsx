"use client";

import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
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

import { userQueries } from "@module/user";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useUpdateJobMutation } from "@/lib/mutations/jobs.mutations";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { SearchBar, SearchBarRef } from "./JobSearchBar";
import MobileOverview from "../components/MobileOverview";
import { sendGTMEvent } from "@next/third-parties/google";
import { OverviewColumn, OverviewEmpty, OverviewSkeleton } from "../components/OverviewColumn";
import { useApplyJob } from "@/hooks/useApplyJob";
import { bookmarksQueries } from "@/lib/queries/bookmarks.queries";

export const SavedJobs = ({ children }: { children: ReactNode }) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [searchValue, setSearchValue] = useState("");

  const [rowSelection, setRowSelection] = useState({});

  const { data: user } = useQuery(userQueries.detail());

  useEffect(() => {
    if (user?.firstName)
      sendGTMEvent({
        event: `Saved Jobs Page`,
        value: `${user?.firstName} viewed Saved Jobs Page`,
      });
  }, [user?.firstName]);
 
  
  const updateJobs = useUpdateJobMutation();
  const { applyToJob: handleApply } = useApplyJob();

  const router = useRouter();


  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
    isRefetching,
  } = useInfiniteQuery(bookmarksQueries.infiniteList());



  const allJobs = useMemo(() => {
    const jobs = data?.pages.flatMap((page) => page.data) ?? [];
    return jobs
      .map((job) => {

       
        return {
          ...job,
         
        };
      })
      
  }, [data]);

  const columns = OverviewColumn({
    router,
    updateJobs,
    handleApply,
  });

  const table = useReactTable({
    data: allJobs,
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

  const searchBarRef = useRef<SearchBarRef>(null);

  const resetSearchToDefault = () => {
    searchBarRef.current?.handleClear();
  };

  const visibleRows = table.getRowModel().rows;
  const isSearching =
    isLoading || isFetching || isRefetching || isFetchingNextPage;
  const hasNoResults =
    !isSearching &&
    ((data?.pages?.[0]?.data?.length ?? 0) === 0 || visibleRows.length === 0);

  return (
    <div className="font-inter grid grid-cols-1 w-full overflow-hidden gap-4 xl:gap-8">
      <div className="space-y-4 w-full">
        <h1 className="text-3xl text-center mb-8 font-medium font-inter">
          Saved Jobs
        </h1>
        {children}
        <SearchBar
          ref={searchBarRef}
          allJobs={allJobs}
          table={table}
          onSearchValueChange={setSearchValue}
        />

        <div className="w-full bg-[#F1F2F4] p-2 px-4 rounded-sm sm:flex justify-between hidden font-roboto">
          <p className="text-[#474C54]">Job</p>
          <p className="text-[#474C54]">Date Applied</p>
          <p className="text-[#474C54]">Action</p>
        </div>
        <div className="w-full flex flex-col gap-6">
          <div className="overflow-hidden border-none hidden lg:grid grid-cols-1">
            <Table>
              <TableBody className="">
                {isSearching ? (
                  <div className="grid gap-4">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <OverviewSkeleton key={index} />
                    ))}
                  </div>
                ) : hasNoResults ? (
                  <div className="flex flex-col gap-1 text-muted-foreground">
                    <OverviewEmpty
                      searchValue={searchValue}
                      resetSearchToDefault={resetSearchToDefault}
                    />
                  </div>
                ) : (
                  visibleRows.map((row) => (
                    <TableRow
                      onClick={() => {
                        router.push(
                          `/dashboard/jobs/${row.original.id}?referrer=saved-jobs&title=${row.original.title}`
                        );
                      }}
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="hover:bg-white border-b rounded-3xl! hover:border-primary hover:border-2 hover:rounded-2xl hover:cursor-pointer"
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
                )}
              </TableBody>
            </Table>
          </div>
          <MobileOverview
            allJobs={allJobs}
            updateJobs={updateJobs}
            handleApply={handleApply}
          />
          {hasNextPage && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {isFetchingNextPage ? "Loading more..." : "Load More"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
