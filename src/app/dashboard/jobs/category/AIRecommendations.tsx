"use client";

import React, { useMemo, useState } from "react";
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

import { userQueries } from "@/lib/queries/user.queries";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import {
  useUpdateJobApplicationHistoryMutation,
  useUpdateJobMutation,
} from "@/lib/mutations/jobs.mutations";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { jobsQueries } from "@/lib/queries/jobs.queries";

// import { SearchBar } from "./JobSearchBar";
import { getFindJobsColumns } from "../components/Overview";
import { getDataSource } from "@/lib/utils/helpers";

export const AIRecommendations = () => {
  const { data: user } = useQuery(userQueries.detail());
  const userDataSource = getDataSource(user);
  const userJobTitlePreference =
    userDataSource?.key || userDataSource?.title || "";
  const [searchValue, _setSearchValue] = useState(() => ({
    title: userJobTitlePreference,
  }));
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  const [rowSelection, setRowSelection] = React.useState({});

  const updateJobApplicationHistory = useUpdateJobApplicationHistoryMutation();

  const updateJobs = useUpdateJobMutation();

  const router = useRouter();

  const bookmarkedIds = (user?.bookmarkedJobs || []) as string[];

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery(
      jobsQueries.infinite({
        title: searchValue.title || userJobTitlePreference,
      })
    );

  console.log(
    "AI Recommendation : ",
    jobsQueries.infinite({ title: searchValue.title || userJobTitlePreference })
      .queryKey
  );

  const bookmarkedIdSet = useMemo(() => {
    return new Set(bookmarkedIds);
  }, [bookmarkedIds]);

  const allJobs = useMemo(() => {
    const jobs = data?.pages.flatMap((page) => page.data) ?? [];

    return jobs.map((job) => {
      const jobContent = job?.title + " " + job?.descriptionText;
      const match = jobContent
        ?.toLowerCase()
        ?.includes(userJobTitlePreference?.toLowerCase());
      return {
        ...job,
        isBookmarked: bookmarkedIdSet.has(job.id),
        matchPercentage: match
          ? Math.floor(80 + Math.random() * 20).toString()
          : Math.floor(10 + Math.random() * 10).toString(),
      };
    });
  }, [data]);

  const columns = getFindJobsColumns({
    router,
    updateJobs,
    updateJobApplicationHistory,
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

  // const onSubmit = (data: any) => {
  //   console.log("Search submitted:", data);
  //   setSearchValue(data.username);
  // };

  return (
    <div className="font-inter grid grid-cols-1 w-full overflow-hidden gap-4 xl:gap-8">
      <div className="space-y-4 w-full">
        <h1 className="text-3xl text-center mb-8 font-medium font-inter">
          AI Recommendations
        </h1>

        {/* <AdvancedFilterModal /> */}

        <div className="w-full flex flex-col gap-6">
          <div className="overflow-hidden border-none">
            <Table>
              <TableBody className="">
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
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
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No saved jobs found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

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
