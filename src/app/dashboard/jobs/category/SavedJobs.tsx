"use client";
import React, { useState } from "react";
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
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useUpdateJobMutation } from "@/lib/mutations/jobs.mutations";
import { getFindJobsColumns } from "../components/Overview";
import { userQueries } from "@/lib/queries/user.queries";
import { jobsQueries } from "@/lib/queries/jobs.queries";

import { SearchBar } from "./JobSearchBar";

export const SavedJobs = () => {
  const { data: user } = useQuery(userQueries.detail());
  const [searchValue, setSearchValue] = useState("");

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  const [rowSelection, setRowSelection] = React.useState({});

  const updateJobs = useUpdateJobMutation();

  const router = useRouter();

  const bookmarkedIds = (user?.bookmarkedJobs || []) as string[];

  console.log(bookmarkedIds);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery(jobsQueries.bookmarked(bookmarkedIds, searchValue, 20));

  const allJobs = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? [];
  }, [data]);

  // const totalJobs = (data?.pages[0] as any)?.totalCount ?? allJobs.length ?? 0;

  // const userDataSource = getDataSource(user);
  // const userJobTitlePreference =
  //   userDataSource?.key || userDataSource?.title || "";

  const columns = getFindJobsColumns(router, undefined, updateJobs);

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



  const onSubmit = (data: any) => {
    console.log("Search submitted:", data);
    setSearchValue(data.username);
  }
  return (
    <div className="font-inter grid grid-cols-1 w-full overflow-hidden gap-4 xl:gap-8">
      <div className="space-y-4 w-full">
        <h1 className="text-3xl text-center mb-8 font-medium font-inter">
          Saved Jobs
        </h1>
        <SearchBar
         sendDataToParent={onSubmit}
         allJobs={allJobs}
        />
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
