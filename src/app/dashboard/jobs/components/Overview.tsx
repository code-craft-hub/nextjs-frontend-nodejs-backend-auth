"use client";
import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { jobsQueries } from "@/lib/queries/jobs.queries";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { leftMenuItems } from "@/lib/utils/constants";
import { v4 as uuidv4 } from "uuid";
import { ColumnDef } from "@tanstack/react-table";
import {
  BookmarkIcon,
  Calendar,
  DollarSign,
  MapPin,
  ArrowRight,
  Sparkles,
  SearchIcon,
  Loader2,
} from "lucide-react";
import { formatAppliedDate, getDataSource } from "@/lib/utils/helpers";
import { JobType } from "@/types";
import { Toggle } from "@/components/ui/toggle";
import { apiService } from "@/hooks/use-auth";
import { toast } from "sonner";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { userQueries } from "@/lib/queries/user.queries";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useForm } from "react-hook-form";
import {
  useUpdateJobApplicationHistoryMutation,
  useUpdateJobMutation,
} from "@/lib/mutations/jobs.mutations";
import { ReportCard } from "./ReportCard";

export default function Overview() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [isAutoFetching, setIsAutoFetching] = useState(false);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const infiniteFilters = useMemo(
    () => ({
      limit: 20,
      title: searchValue.trim() || undefined,
    }),
    [searchValue]
  );

  const updateJobs = useUpdateJobMutation();
  const updateJobApplicationHistory = useUpdateJobApplicationHistoryMutation();
  const { data: user } = useQuery(userQueries.detail());
  const userDataSource = getDataSource(user);
  const userJobTitlePreference =
    userDataSource?.key || userDataSource?.title || "";

  const form = useForm<any>({
    defaultValues: {
      username: "",
    },
  });

  const bookmarkedIds = (user?.bookmarkedJobs || []) as string[];

  const bookmarkedIdSet = useMemo(() => {
    return new Set(bookmarkedIds);
  }, [bookmarkedIds]);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery(jobsQueries?.infinite(infiniteFilters));

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

  const commend = useMemo(() => {
    return (
      data?.pages.flatMap((page) =>
        page.data?.map((job) => job?.title + " " + job?.descriptionText)
      ) ?? []
    );
  }, [data]);

  const totalJobs = (data?.pages[0] as any)?.totalCount ?? allJobs.length ?? 0;

  const matchPercentage = Number(
    (totalJobs > 0
      ? Math.ceil(
          Math.max(
            10,
            Math.min(
              100,
              (commend.filter((score) =>
                score
                  .toLowerCase()
                  .includes(userJobTitlePreference.toLowerCase())
              ).length /
                totalJobs) *
                100
            )
          )
        )
      : 0
    )?.toFixed(0) || 0
  );

  const columns = getFindJobsColumns({
    router,
    matchPercentage,
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

  const onSubmit = async ({ username }: any) => {
    const trimmedSearch = username.trim();
    setSearchValue(trimmedSearch);
    table.getColumn("title")?.setFilterValue(trimmedSearch);

    const currentSearchValue = table
      .getColumn("title")
      ?.getFilterValue() as string;
    if (!currentSearchValue || currentSearchValue.trim() === "") {
      setIsAutoFetching(false);
      return;
    }
    setIsAutoFetching(false);
  };
  const visibleRows = table.getRowModel().rows;
  const hasNoResults = visibleRows.length === 0;
  const isSearching = isAutoFetching || isFetchingNextPage;

  return (
    <div className="lg:gap-6 lg:flex ">
      <div className="bg-white p-3 h-fit rounded-md hidden lg:flex lg:flex-col gap-1">
        {leftMenuItems.map((item) => (
          <div
            onClick={() => router.push(item.url)}
            key={item.id}
            className={cn(
              "group flex gap-2 data-[state=active]:bg-primary  data-[state=active]:text-white  p-2 hover:bg-primary hover:text-white hover-cursor-pointer items-center justify-start rounded-md w-44  hover:shadow-sm hover:cursor-pointer",
              item.isActive && "bg-blue-500 text-white"
            )}
          >
            <div className="size-fit rounded-sm">
              <img
                src={item.icon}
                alt={item.label}
                className={cn(
                  "size-4 group-hover:brightness-0 group-hover:invert group-data-[state=active]:brightness-0 group-data-[state=active]:invert",
                  item.isActive && "brightness-0 invert"
                )}
              />
            </div>
            <div className="">
              <p className="text-xs">{item.label}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="w-full flex flex-col gap-6">
        <ReportCard matchPercentage={matchPercentage} />
        <div className="bg-white shadow-lg px-2 flex gap-4 justify-between rounded-lg">
          <div className="flex items-center gap-2 w-full">
            <SearchIcon className="size-4" />
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex gap-2 w-full  justify-between items-center "
              >
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem className=" w-full">
                      <FormControl>
                        <input
                          className="border-none focus:border-none focus:outline-none w-full !bg-white focus:!bg-white h-14"
                          placeholder="Job title / Company name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={hasNoResults || isSearching}>
                  Search
                </Button>
              </form>
            </Form>
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
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    {isSearching || isFetchingNextPage ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Searching for matching jobs...</span>
                      </div>
                    ) : hasNoResults && !hasNextPage ? (
                      isSearching ? (
                        "Searching ... "
                      ) : (
                        <span>
                          No results found. All data has been searched.
                        </span>
                      )
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
    </div>
  );
}

export const getFindJobsColumns = ({
  router,
  matchPercentage,
  updateJobs,
  updateJobApplicationHistory,
}: {
  router: AppRouterInstance;
  matchPercentage?: number;
  updateJobs?: any;
  updateJobApplicationHistory?: any;
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
            <div className="font-medium text-xs max-w-sm overflow-hidden">
              {row.getValue("title")}
            </div>
            <div className="bg-blue-50 rounded text-blue-600 px-2 py-1">
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
              <DollarSign className="size-3" />
              <span className="text-2xs">
                {!!row.original?.salary
                  ? row.original?.salary
                  : "Not disclosed"}
              </span>
            </p>
            <p className="flex gap-1 text-gray-400 items-center">
              <Calendar className="size-3" />
              <span className="text-2xs">
                {formatAppliedDate(
                  row.original?.scrapedAt ||
                    row.original?.postedAt ||
                    row.original?.updatedAt
                )}
              </span>
            </p>
            <p className="text-2xs text-green-400">
              {row.original.matchPercentage}%
            </p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "isBookmarked",
    cell: ({ row }) => {
      const isBookmarked = row.original.isBookmarked || false;

      return (
        <div
          onClick={() => {
            updateJobs.mutate({
              id: String(row.original.id),
              data: {
                isBookmarked: !isBookmarked,
              },
            });
          }}
          className="flex justify-end"
        >
          <Toggle
            pressed={isBookmarked || false}
            aria-label="Toggle bookmark"
            size="sm"
            variant="outline"
            className="data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-blue-500 data-[state=on]:*:[svg]:stroke-blue-500"
          >
            <BookmarkIcon />
          </Toggle>
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
            className="w-full"
            onClick={async () => {
              if (!row.original?.emailApply) {
                updateJobApplicationHistory.mutate({
                  id: String(row.original.id),
                  data: {
                    appliedJobs: row.original.id,
                  },
                });
                window.open(row.original.link, "__blank");
                return;
              }

              const { isAuthorized } = await apiService.gmailOauthStatus();

              if (!isAuthorized) {
                toast.error(
                  "✨ Go to the Settings page and enable authorization for Cverai to send emails on your behalf. This option is located in the second card.",
                  {
                    action: {
                      label: "Authorize now",
                      onClick: () =>
                        router.push(
                          `/dashboard/settings?tab=ai-applypreference`
                        ),
                    },
                    classNames: {
                      actionButton:
                        "!bg-blue-600 hover:!bg-blue-700 !text-white !h-8",
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
              params.set(
                "recruiterEmail",
                encodeURIComponent(row.original?.emailApply)
              );

              updateJobApplicationHistory.mutate({
                id: String(row.original.id),
                data: {
                  appliedJobs: row.original.id,
                },
              });
              router.push(
                `/dashboard/tailor-cover-letter/${uuidv4()}?${params}&aiApply=true`
              );
            }}
            variant={"button"}
          >
            {row.original?.emailApply ? "Auto Apply" : "Apply Now"}
            {row.original?.emailApply && (
              <Sparkles className="text-3 text-yellow" />
            )}
          </Button>
        </div>
      );
    },
  },
];
