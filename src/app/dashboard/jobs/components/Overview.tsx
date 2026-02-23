"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ArrowRight, SearchIcon } from "lucide-react";
import { sendGTMEvent } from "@next/third-parties/google";

import { cn } from "@/lib/utils";
import { leftMenuItems } from "@/lib/utils/constants";
import { getDataSource } from "@/lib/utils/helpers";
import { jobMatcher } from "@/services/job-matcher";
import { userQueries } from "@module/user";
import { useUpdateJobMutation } from "@/lib/mutations/jobs.mutations";
import { useApplyJob } from "@/hooks/useApplyJob";
import { jobPostsQueries } from "@/lib/queries/job-posts.queries";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import InsufficientCreditsModal from "@/components/shared/InsufficientCreditsModal";
import AuthorizeGoogle from "@/hooks/gmail/AuthorizeGoogle";

import { OverviewColumn } from "./OverviewColumn";
import { useJobsTable } from "../_hooks/useJobsTable";
import { JobsTable } from "./JobsTable";
import { LoadMoreButton } from "./LoadMoreButton";
import { ReportCard } from "./ReportCard";
import MobileOverview from "../../../../shared/component/MobileOverview";

export default function Overview() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const goodMatchCountRef = useRef(0);

  const { data: user } = useQuery(userQueries.detail());

  useEffect(() => {
    if (user?.firstName) {
      sendGTMEvent({
        event: "Job Page",
        value: `${user.firstName} viewed Job Page`,
      });
    }
  }, [user?.firstName]);

  const userDataSource = getDataSource(user);
  const userJobTitlePreference =
    userDataSource?.key || userDataSource?.title || "";

  const form = useForm<{ searchQuery: string }>({
    defaultValues: { searchQuery: "" },
  });

  // Server-side search: changing searchValue triggers a fresh API call.
  const infiniteFilters = useMemo(
    () => ({ limit: 20, title: searchValue.trim() || undefined }),
    [searchValue],
  );

  const updateJobs = useUpdateJobMutation();
  const { applyToJob: handleApply } = useApplyJob();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetching,
    isRefetching,
    isFetchingNextPage,
  } = useInfiniteQuery(jobPostsQueries.infinite(infiniteFilters));

  const allJobs = useMemo(() => {
    const jobs = data?.pages.flatMap((page) => page.data) ?? [];
    let goodMatchCount = 0;

    const sorted = jobs
      .map((job) => {
        const content = `${job.title ?? ""} ${job.descriptionText ?? ""}`;
        const match = jobMatcher.calculateMatch(
          userJobTitlePreference,
          content,
        );
        if (match.score >= 50) goodMatchCount++;
        return job;
      })
      .sort(
        (a, b) =>
          parseInt(b.matchPercentage ?? "0") -
          parseInt(a.matchPercentage ?? "0"),
      );

    goodMatchCountRef.current = goodMatchCount;
    return sorted;
  }, [data, userJobTitlePreference]);

  const columns = OverviewColumn({ router, updateJobs, handleApply });
  const table = useJobsTable(allJobs, columns);

  function resetSearch() {
    setSearchValue("");
    table.getColumn("title")?.setFilterValue(undefined);
  }

  function onSubmit({ searchQuery }: { searchQuery: string }) {
    const trimmed = searchQuery.trim();
    sendGTMEvent({
      event: `Job Page Search - ${searchQuery}`,
      value: `${user?.firstName} searched jobs`,
    });
    setSearchValue(trimmed);
    table.getColumn("title")?.setFilterValue(trimmed || undefined);
  }

  const isSearching =
    isLoading || isFetching || isRefetching || isFetchingNextPage;
  const hasNoResults =
    !isSearching && (data?.pages?.[0]?.data?.length ?? 0) === 0;

  return (
    <div className="lg:gap-6 lg:flex">
      {/* Left sidebar nav */}
      <div className="bg-white p-3 h-fit rounded-md hidden lg:flex lg:flex-col gap-1">
        {leftMenuItems.map((item) => (
          <div
            key={item.id}
            onClick={() => router.push(item.url)}
            className={cn(
              "group flex gap-2 p-2 hover:bg-primary hover:text-white items-center justify-start rounded-md w-44 hover:shadow-sm hover:cursor-pointer",
              item.isActive && "bg-blue-500 text-white",
            )}
          >
            <div className="size-fit rounded-sm">
              <img
                src={item.icon}
                alt={item.label}
                className={cn(
                  "size-4 group-hover:brightness-0 group-hover:invert",
                  item.isActive && "brightness-0 invert",
                )}
              />
            </div>
            <p className="text-xs">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="w-full flex flex-col gap-6">
        <ReportCard matchPercentage={goodMatchCountRef.current} />

        {/* Search bar */}
        <div className="bg-white shadow-lg px-2 flex gap-4 justify-between rounded-lg">
          <div className="flex items-center gap-2 w-full">
            <SearchIcon className="size-4" />
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex gap-2 w-full justify-between items-center"
              >
                <FormField
                  control={form.control}
                  name="searchQuery"
                  render={({ field }) => (
                    <FormItem className="w-full">
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
                <Button type="submit" disabled={isSearching}>
                  Search
                </Button>
              </form>
            </Form>
          </div>
        </div>

        <div className="flex justify-between">
          <p>All Jobs</p>
          <p className="text-xs flex gap-1 text-gray-400">
            <span>View all</span>
            <ArrowRight className="size-4" />
          </p>
        </div>

        {/* Desktop table */}
        <JobsTable
          table={table}
          isLoading={isSearching}
          hasNoResults={hasNoResults}
          searchValue={searchValue}
          onResetSearch={resetSearch}
          skeletonCount={4}
          onRowClick={(row) =>
            router.push(
              `/dashboard/jobs/${row.original.id}?referrer=jobs&title=${encodeURIComponent(row.original.title ?? "")}`,
            )
          }
        />

        {/* Mobile list */}
        <MobileOverview
          allJobs={allJobs}
          updateJobs={updateJobs}
          handleApply={handleApply}
          referrer="jobs"
        />

        {/* Pagination */}
        <LoadMoreButton
          hasNextPage={hasNextPage ?? false}
          isFetchingNextPage={isFetchingNextPage}
          onLoadMore={() => fetchNextPage()}
          label="Load More Jobs"
        />
      </div>

      <AuthorizeGoogle hidden={true} />
      <InsufficientCreditsModal />
    </div>
  );
}
