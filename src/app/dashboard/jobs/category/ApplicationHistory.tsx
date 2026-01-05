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
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { jobsQueries } from "@/lib/queries/jobs.queries";
import { useRouter } from "next/navigation";
import { SearchBar } from "./JobSearchBar";

import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { DollarSign, MapPin, Sparkles } from "lucide-react";
import { formatAppliedDate } from "@/lib/utils/helpers";
import { JobType } from "@/types";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { userQueries } from "@/lib/queries/user.queries";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import {
  useUpdateJobApplicationHistoryMutation,
  useUpdateJobMutation,
} from "@/lib/mutations/jobs.mutations";
import { PiOfficeChairFill } from "react-icons/pi";
import { usePrefetchJob } from "@/hooks/usePrefetchJob";
import MobileOverview from "../components/MobileOverview";
import { sendGTMEvent } from "@next/third-parties/google";

export const ApplicationHistory = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const { prefetchJob } = usePrefetchJob();

  const { data: user } = useQuery(userQueries.detail());

  useEffect(() => {
    if (user?.firstName)
      sendGTMEvent({
        event: `Application History Page`,
        value: `${user?.firstName} viewed Application History Page`,
      });
  }, [user?.firstName]);

  const appliedJobsMap = useMemo(() => {
    return new Map(
      user?.appliedJobs?.map((job) => [job?.id, job?.appliedDate]) || []
    );
  }, [user?.appliedJobs]);

  const updateJobApplicationHistory = useUpdateJobApplicationHistoryMutation();

  const updateJobs = useUpdateJobMutation();

  const router = useRouter();

  const appliedJobsIds = (user?.appliedJobs?.map((job) => job.id) ||
    []) as string[];

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery(jobsQueries.appliedJobs(appliedJobsIds, "", 20));

  const allJobs = useMemo(() => {
    const jobs = data?.pages.flatMap((page) => page.data) ?? [];
    return jobs.map((job) => ({
      ...job,
      appliedDate: appliedJobsMap?.get(job?.id) || null,
    }));
  }, [data, user?.appliedJobs?.length]);

  const columns = getFindJobsColumns({
    router,
    updateJobs,
    updateJobApplicationHistory,
    prefetchJob,
  });

  const table = useReactTable<(typeof allJobs)[number]>({
    data: allJobs,
    columns: columns as ColumnDef<(typeof allJobs)[number]>[],
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
          Application History
        </h1>
        {children}
        <SearchBar allJobs={allJobs} table={table} />

        <div className="w-full bg-[#F1F2F4] p-2 px-4 rounded-sm sm:flex justify-between hidden font-roboto">
          <p className="text-[#474C54]">Job</p>
          <p className="text-[#474C54]">Date Applied</p>
          <p className="text-[#474C54]">Action</p>
        </div>
        <div className="w-full flex flex-col gap-6">
          <div className="overflow-hidden border-none hidden lg:grid grid-cols-1">
            <Table>
              <TableBody className="">
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      onClick={() => {
                        router.push(
                          `/dashboard/jobs/${row.original.id}?referrer=application-history&title=${row.original.title}`
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
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <MobileOverview
            allJobs={allJobs as JobType[]}
            updateJobs={updateJobs}
            // handleApply={handleApply}
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

const getFindJobsColumns = ({
  router,
  matchPercentage,
  prefetchJob,
}: {
  router: AppRouterInstance;
  matchPercentage?: number;
  updateJobs?: any;
  updateJobApplicationHistory?: any;
  prefetchJob: (jobId: string) => void;
}): ColumnDef<JobType>[] => [
  {
    accessorKey: "companyText",
    header: "Company",
    cell: ({ row }) => (
      <div className="shrink-0 flex items-center justify-center size-16">
        <img
          src={
            !!row.original.companyLogo
              ? row.original.companyLogo
              : "/placeholder.jpg"
          }
          alt={row.original.companyText}
          className="size-12"
        />
      </div>
    ),
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => {
      return (
        <div className="capitalize ">
          <div className="flex gap-4 items-center">
            <div className="font-medium text-xs max-w-44 truncate line-clamp-1 overflow-hidden">
              {row.getValue("title")}
            </div>
            <div className="bg-blue-50 rounded-2xl text-blue-600 px-2 py-1">
              <span className="text-2xs">
                {!!row.original.jobType
                  ? row.original.jobType
                  : row.original.employmentType}
              </span>
            </div>
            <div className="">
              {matchPercentage && matchPercentage > 30 && (
                <Sparkles className="text-yellow-500 size-4" />
              )}
            </div>
          </div>
          <div className="flex gap-x-4 mt-1">
            <p className="flex gap-1 text-gray-400 items-center">
              <MapPin className="size-3" />
              <span className="text-2xs">{row.original.location}</span>
            </p>
            <p className="flex gap-1 text-gray-400 items-center">
              <PiOfficeChairFill className="size-3" />
              <span className="text-2xs">{row.original.companyName}</span>
            </p>
            {!!row.original?.salary && (
              <p className="flex gap-1 text-gray-400 items-center">
                <DollarSign className="size-3" />
                <span className="text-2xs">{row.original?.salary}</span>
              </p>
            )}
          </div>
        </div>
      );
    },
  },
  { accessorKey: "location", cell: () => <div></div> },
  { accessorKey: "jobType", cell: () => <div></div> },
  { accessorKey: "employmentType", cell: () => <div></div> },
  {
    accessorKey: "appliedDate",
    header: "Applied Date",
    cell: ({ row }) => {
      return (
        <div className="capitalize ">
          <div className="flex gap-4 items-center">
            <div className="font-medium text-xs max-w-sm overflow-hidden">
              {formatAppliedDate(row.getValue("appliedDate"))}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <div className="flex justify-end">
          <Button
            className="w-full bg-[#F1F2F4] hover:bg-[#E2E4E8] text-primary border-0"
            onClick={async () => {
              router.push(`/dashboard/jobs/${row.original.id}`);
            }}
            variant={"outline"}
            onMouseEnter={() => prefetchJob(row.original.id)}
            onFocus={() => prefetchJob(row.original.id)}
          >
            View Details
          </Button>
        </div>
      );
    },
  },
];
