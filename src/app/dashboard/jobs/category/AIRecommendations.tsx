"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
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
import { jobsQueries } from "@/lib/queries/jobs.queries";
import { getDataSource } from "@/lib/utils/helpers";
import { jobMatcher } from "@/services/job-matcher";
import { JobType } from "@/types";
import MobileOverview from "../components/MobileOverview";
import { sendGTMEvent } from "@next/third-parties/google";
import { OverviewColumn, OverviewEmpty, OverviewSkeleton } from "../components/OverviewColumn";
import { useApplyJob } from "@/hooks/useApplyJob";

export const AIRecommendations = ({ children }: { children: ReactNode }) => {
  const { data: user } = useQuery(userQueries.detail());
  const userDataSource = getDataSource(user);
  const userJobTitlePreference =
    userDataSource?.key || userDataSource?.title || "";
  const [searchValue, _setSearchValue] = useState(() => ({
    title: userJobTitlePreference,
  }));
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const [rowSelection, setRowSelection] = useState({});

  useEffect(() => {
    if (user?.firstName)
      sendGTMEvent({
        event: `AI Recommendations Page`,
        value: `${user?.firstName} viewed AI Recommendations Page`,
      });
  }, [user?.firstName]);

  const updateJobs = useUpdateJobMutation();
  const { applyToJob: handleApply } = useApplyJob();

  const router = useRouter();


  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetching,
    isRefetching,
    isFetchingNextPage,
  } = useInfiniteQuery(
    jobsQueries.infinite({
      title: searchValue.title || userJobTitlePreference,
    })
  );


  const allJobs = useMemo(() => {
    const jobs = data?.pages.flatMap((page) => page.data) ?? [];

    return jobs.map((job) => {
      const jobContent = job?.title + " " + job?.descriptionText;

      const completeMatch = jobMatcher.calculateMatch(
        userJobTitlePreference,
        jobContent || ""
      );
      return {
        ...job,
        matchPercentage: completeMatch?.score?.toString(),
        matchDetails: completeMatch,
      };
    });
    // .sort((a, b) => {
    //   return parseInt(b?.createdAt) - parseInt(a?.createdAt);
    // });
  }, [data,]);

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
          AI Recommendations
        </h1>

        {children}

        <div className="w-full flex flex-col gap-6">
          <div className="overflow-hidden border-none hidden lg:grid grid-cols-1">
            <Table>
              <TableBody className="">
                {isSearching ? (
                  <div className="grid gap-4">
                    {Array.from({ length: 10 }).map((_, index) => (
                      <OverviewSkeleton key={index} />
                    ))}
                  </div>
                ) : hasNoResults ? (
                  <div className="flex flex-col gap-1 text-muted-foreground">
                    <OverviewEmpty
                      searchValue={searchValue.title}
                      // resetSearchToDefault={resetSearchToDefault}
                    />
                  </div>
                ) : (
                  visibleRows.map((row) => (
                    <TableRow
                      onClick={() => {
                        router.push(
                          `/dashboard/jobs/${row.original.id}?referrer=ai-recommendations&title=${row.original.title}`
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
