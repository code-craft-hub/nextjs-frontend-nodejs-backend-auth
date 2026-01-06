"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
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
import { ArrowRight, SearchIcon, Loader2 } from "lucide-react";
import { getDataSource } from "@/lib/utils/helpers";
import { JobType } from "@/types";
import { apiService } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useForm } from "react-hook-form";
import {
  useUpdateJobApplicationHistoryMutation,
  useUpdateJobMutation,
} from "@/lib/mutations/jobs.mutations";
import { ReportCard } from "./ReportCard";
import { jobMatcher } from "@/services/job-matcher";
import { sendGTMEvent } from "@next/third-parties/google";
import InsufficientCreditsModal from "@/components/shared/InsufficientCreditsModal";
import { userQueries } from "@/lib/queries/user.queries";
import {
  OverviewColumn,
  OverviewEmpty,
  OverviewSkeleton,
} from "./OverviewColumn";
import MobileOverview from "./MobileOverview";
import AuthorizeGoogle from "@/hooks/gmail/AuthorizeGoogle";

export default function Overview() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [isAutoFetching, setIsAutoFetching] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const totalScoreRef = useRef<number>(0);
  const { data: user } = useQuery(userQueries.detail());

  useEffect(() => {
    if (user?.firstName)
      sendGTMEvent({
        event: `Job Page`,
        value: `${user?.firstName} viewed Job Page`,
      });
  }, [user?.firstName]);

  const infiniteFilters = useMemo(
    () => ({
      limit: 20,
      title: searchValue.trim() || undefined,
    }),
    [searchValue]
  );

  const updateJobs = useUpdateJobMutation();
  const updateJobApplicationHistory = useUpdateJobApplicationHistoryMutation();
  const userDataSource = getDataSource(user);
  const userJobTitlePreference =
    userDataSource?.key || userDataSource?.title || "";

  const form = useForm<any>({
    defaultValues: {
      username: "",
    },
  });

  const bookmarkedIds = (user?.bookmarkedJobs || []) as string[];
  const appliedJobsIds = (user?.appliedJobs?.map((job) => job.id) ||
    []) as string[];

  const bookmarkedIdSet = useMemo(
    () => new Set(bookmarkedIds),
    [bookmarkedIds]
  );

  const appliedJobsIdSet = useMemo(
    () => new Set(appliedJobsIds),
    [appliedJobsIds]
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetching,
    isRefetching,
    isFetchingNextPage,
  } = useInfiniteQuery(jobsQueries?.infinite(infiniteFilters));

  const allJobs = useMemo(() => {
    const jobs = data?.pages.flatMap((page) => page.data) ?? [];
    const scores = [];

    const jobData = jobs
      .map((job) => {
        const jobContent = job?.title + " " + job?.descriptionText;

        const completeMatch = jobMatcher.calculateMatch(
          userJobTitlePreference,
          jobContent || ""
        );

        if (completeMatch.score >= 50) {
          scores.push(completeMatch.score);
        }
        return {
          ...job,
          isBookmarked: bookmarkedIdSet?.has(job?.id),
          isApplied: appliedJobsIdSet?.has(job?.id),
          matchPercentage: completeMatch?.score?.toString(),
          matchDetails: completeMatch,
        };
      })
      .sort((a, b) => {
        return parseInt(b.matchPercentage) - parseInt(a.matchPercentage);
      });
    totalScoreRef.current = scores.length;
    return jobData;
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

  const resetSearchToDefault = () => {
    setSearchValue("");
    table.getColumn("title")?.setFilterValue(undefined);
    setIsAutoFetching(false);
  };

  const onSubmit = async ({ username }: any) => {
    const trimmedSearch = username.trim();
    sendGTMEvent({
      event: `Job Page Search - ${username}`,
      value: `${user?.firstName} viewed Job Page`,
    });
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
  const isSearching =
    isLoading || isFetching || isRefetching || isFetchingNextPage;
  const hasNoResults =
    !isSearching && (data?.pages?.[0]?.data?.length ?? 0) === 0;

  return (
    <div className="lg:gap-6 lg:flex ">
      <div className="bg-white p-3 h-fit rounded-md hidden lg:flex lg:flex-col gap-1">
        {leftMenuItems.map((item) => (
          <div
            onClick={() => {
              router.push(item.url);
            }}
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
        <ReportCard matchPercentage={totalScoreRef.current} />
        <div className="bg-white shadow-lg px-2 flex gap-4 justify-between rounded-lg">
          <div className="flex items-center gap-2 w-full">
            <SearchIcon className="size-4 " />
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
                          className="border-none focus:border-none focus:outline-none w-full bg-white! focus:bg-white! h-14"
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
        <div className="hidden lg:grid grid-cols-1">
          <Table>
            <TableBody>
              {isSearching ? (
                <div className="grid gap-4">
                  {Array.from({ length: 4 }).map((_, index) => (
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
                    key={row.id}
                    onClick={() =>
                      router.push(
                        `/dashboard/jobs/${row.original.id}?referrer=jobs&title=${row.original.title}`
                      )
                    }
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
        {hasNextPage && !isAutoFetching && (
          <div className="flex justify-center">
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                fetchNextPage();
              }}
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
      <AuthorizeGoogle hidden={true} />
      <InsufficientCreditsModal />
    </div>
  );
}
