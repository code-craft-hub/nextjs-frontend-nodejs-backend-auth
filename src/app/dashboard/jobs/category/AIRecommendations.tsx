"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { v4 as uuidv4 } from "uuid";
import { userQueries } from "@/lib/queries/user.queries";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import {
  useUpdateJobApplicationHistoryMutation,
  useUpdateJobMutation,
} from "@/lib/mutations/jobs.mutations";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { jobsQueries } from "@/lib/queries/jobs.queries";
import { getFindJobsColumns } from "../components/Overview";
import { getDataSource } from "@/lib/utils/helpers";
import { jobMatcher } from "@/services/job-matcher";
import { apiService } from "@/hooks/use-auth";
import { toast } from "sonner";
import { JobType } from "@/types";
import MobileOverview from "../components/MobileOverview";
import { sendGTMEvent } from "@next/third-parties/google";

export const AIRecommendations = ({
  children,
}: {
  children: React.ReactNode;
}) => {
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

  useEffect(() => {
    if (user?.firstName)
      sendGTMEvent({
        event: `AI Recommendations Page`,
        value: `${user?.firstName} viewed AI Recommendations Page`,
      });
  }, [user?.firstName]);

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

  const bookmarkedIdSet = useMemo(() => {
    return new Set(bookmarkedIds);
  }, [bookmarkedIds]);

  const allJobs = useMemo(() => {
    const jobs = data?.pages.flatMap((page) => page.data) ?? [];

    return jobs
      .map((job) => {
        const jobContent = job?.title + " " + job?.descriptionText;

        const completeMatch = jobMatcher.calculateMatch(
          userJobTitlePreference,
          jobContent || ""
        );
        return {
          ...job,
          isBookmarked: bookmarkedIdSet?.has(job?.id),
          matchPercentage: completeMatch?.score?.toString(),
          matchDetails: completeMatch,
        };
      })
      .sort((a, b) => {
        return parseInt(b?.matchPercentage) - parseInt(a?.matchPercentage);
      });
  }, [data, user?.bookmarkedJobs?.length, user?.appliedJobs?.length]);

  const handleApply = async ({
    event,
    row,
  }: {
    event: any;
    row: Row<JobType>;
  }) => {
    event.preventDefault();
    event.stopPropagation();
    if (!row.original?.emailApply) {
      updateJobApplicationHistory.mutate({
        id: String(row.original.id),
        data: {
          appliedJobs: row.original.id,
        },
      });
      window.open(
        !!row.original?.applyUrl ? row.original?.applyUrl : row.original?.link,
        "__blank"
      );
      return;
    }

    const { isAuthorized } = await apiService.gmailOauthStatus();

    if (!isAuthorized) {
      toast.error(
        "✨ Go to the Settings page and enable authorization for Cver AI to send emails on your behalf. This option is located in the second card.",
        {
          action: {
            label: "Authorize now",
            onClick: () =>
              router.push(`/dashboard/settings?tab=ai-applypreference`),
          },
          classNames: {
            actionButton: "!bg-blue-600 hover:!bg-blue-700 !text-white !h-8",
          },
        }
      );
      return;
    }

    const params = new URLSearchParams();
    params.set(
      "jobDescription",
      JSON.stringify(row.original?.descriptionText || "")
    );
    params.set("recruiterEmail", encodeURIComponent(row.original?.emailApply));

    updateJobApplicationHistory.mutate({
      id: String(row.original.id),
      data: {
        appliedJobs: row.original.id,
      },
    });
    router.push(
      `/dashboard/tailor-cover-letter/${uuidv4()}?${params}&aiApply=true`
    );
  };

  const columns = getFindJobsColumns({
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
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      onClick={() => {
                        router.push(
                          `/dashboard/jobs/${row.original.id}?referrer=ai-recommendations&title=${row.original.title}`
                        );
                      }}
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
