"use client";

import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { sendGTMEvent } from "@next/third-parties/google";

import { userQueries } from "@module/user";
import { useUpdateJobMutation } from "@/lib/mutations/jobs.mutations";
import { useApplyJob } from "@/hooks/useApplyJob";
import { bookmarksQueries } from "@/lib/queries/bookmarks.queries";
import { JobType } from "@/types";

import { OverviewColumn } from "../components/OverviewColumn";
import { useJobsTable } from "../_hooks/useJobsTable";
import { JobsTable } from "../components/JobsTable";
import { LoadMoreButton } from "../components/LoadMoreButton";
import MobileOverview from "../../../../modules/job-posts/components/MobileOverview";
import { SearchBar, SearchBarRef } from "./JobSearchBar";

export const SavedJobs = ({ children }: { children?: ReactNode }) => {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const searchBarRef = useRef<SearchBarRef>(null);

  const { data: user } = useQuery(userQueries.detail());

  useEffect(() => {
    if (user?.firstName) {
      sendGTMEvent({
        event: "Saved Jobs Page",
        value: `${user.firstName} viewed Saved Jobs Page`,
      });
    }
  }, [user?.firstName]);

  const updateJobs = useUpdateJobMutation();
  const { applyToJob: handleApply } = useApplyJob();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
    isRefetching,
  } = useInfiniteQuery(bookmarksQueries.infiniteList());

  const allJobs = useMemo<JobType[]>(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data],
  );

  const columns = OverviewColumn({ router, updateJobs, handleApply });
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
          <JobsTable
            table={table}
            isLoading={isSearching}
            hasNoResults={hasNoResults}
            searchValue={searchValue}
            onResetSearch={resetSearch}
            skeletonCount={5}
            onRowClick={(row) =>
              router.push(
                `/dashboard/jobs/${row.original.id}?referrer=saved-jobs&title=${encodeURIComponent(row.original.title ?? "")}`,
              )
            }
          />

          <MobileOverview
            allJobs={allJobs}
            updateJobs={updateJobs}
            handleApply={handleApply}
            referrer="saved-jobs"
          />

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
