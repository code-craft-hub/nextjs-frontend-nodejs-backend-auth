"use client";

import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { sendGTMEvent } from "@next/third-parties/google";

import { userQueries } from "@module/user";
import { usePrefetchJob } from "@/hooks/usePrefetchJob";
import jobApplicationQueries from "@/lib/queries/application-history.queries";
import { JobType } from "@/types";

import { ApplicationHistoryColumn } from "../components/OverviewColumn";
import { useJobsTable } from "../_hooks/useJobsTable";
import { JobsTable } from "../components/JobsTable";
import { LoadMoreButton } from "../components/LoadMoreButton";
import MobileOverview from "../../../../shared/component/MobileOverview";
import { SearchBar, SearchBarRef } from "./JobSearchBar";

export const ApplicationHistory = ({ children }: { children?: ReactNode }) => {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const searchBarRef = useRef<SearchBarRef>(null);

  const { data: user } = useQuery(userQueries.detail());
  const { prefetchJob } = usePrefetchJob();

  useEffect(() => {
    if (user?.firstName) {
      sendGTMEvent({
        event: "Application History Page",
        value: `${user.firstName} viewed Application History Page`,
      });
    }
  }, [user?.firstName]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
    isRefetching,
  } = useInfiniteQuery(jobApplicationQueries.infiniteList());

  const allJobs = useMemo<JobType[]>(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data],
  );

  const columns = ApplicationHistoryColumn({
    prefetchJob,
    onViewDetails: (jobId) =>
      router.push(`/dashboard/jobs/${jobId}?referrer=application-history`),
  });
  const table = useJobsTable(allJobs, columns);

  function resetSearch() {
    setSearchValue("");
    searchBarRef.current?.handleClear();
  }

  const isSearching =
    isLoading || isFetching || isRefetching || isFetchingNextPage;
  const visibleRows = table.getRowModel().rows;
  const hasNoResults =
    !isSearching &&
    ((data?.pages?.[0]?.data?.length ?? 0) === 0 || visibleRows.length === 0);

  return (
    <div className="font-inter grid grid-cols-1 w-full overflow-hidden gap-4 xl:gap-8">
      <div className="space-y-4 w-full">
        <h1 className="text-3xl text-center mb-8 font-medium font-inter">
          Application History
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
          <JobsTable
            table={table}
            isLoading={isSearching}
            hasNoResults={hasNoResults}
            searchValue={searchValue}
            onResetSearch={resetSearch}
            skeletonCount={5}
            onRowClick={(row) =>
              router.push(
                `/dashboard/jobs/${row.original.id}?referrer=application-history&title=${encodeURIComponent(row.original.title ?? "")}`,
              )
            }
          />

          {/* Mobile view — no apply/bookmark actions for history items */}
          <MobileOverview allJobs={allJobs} referrer="application-history" />

          <LoadMoreButton
            hasNextPage={hasNextPage ?? false}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={() => fetchNextPage()}
          />
        </div>
      </div>
    </div>
  );
};
