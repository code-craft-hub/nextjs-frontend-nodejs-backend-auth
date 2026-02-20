"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, BACKEND_API_VERSION } from "@/lib/api/client";

interface BookmarkRecord {
  id: string;
  jobId: string;
}

interface GetBookmarksResponse {
  success: boolean;
  data: BookmarkRecord[];
  pagination: { page: number; limit: number; count: number };
}

/**
 * Stable query key exported so the bookmark mutations in useJobActions can
 * invalidate this cache when the user bookmarks / un-bookmarks a job.
 */
export const BOOKMARK_IDS_QUERY_KEY = ["bookmarks", "jobIds"] as const;

/**
 * Fetches the authenticated user's bookmarked job IDs from the dedicated
 * bookmarks API.
 *
 * bookmarkedJobs / appliedJobs are no longer stored on the user document —
 * they now live in their own tables with dedicated APIs. This hook is the
 * single source of truth for bookmark state in the job list.
 *
 * Returns a stable Set<string> that is only recreated when the API data changes.
 */
export function useBookmarkedJobIds(): Set<string> {
  const { data: rawData } = useQuery({
    queryKey: BOOKMARK_IDS_QUERY_KEY,
    queryFn: () =>
      api.get<GetBookmarksResponse>(`${BACKEND_API_VERSION}/users/bookmarks`, {
        params: { limit: 500 },
      }),
    staleTime: 5 * 60 * 1000,
  });

  return useMemo(
    () => new Set(rawData?.data?.map((b) => b.jobId) ?? []),
    [rawData]
  );
}
