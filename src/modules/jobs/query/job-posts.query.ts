import jobPostsApi from "@/lib/api/job-posts.api";
import { useInfiniteQuery } from "@tanstack/react-query";

export function useInfiniteJobs(query?: string) {
  return useInfiniteQuery({
    queryKey: ["jobs", query],
    queryFn: ({ pageParam }) => jobPostsApi.query({ query, cursor: pageParam }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage: any) => lastPage.nextCursor ?? undefined,
    getPreviousPageParam: (firstPage: any) => firstPage.prevCursor ?? undefined,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    select: (data) => ({
      pages: data.pages.flatMap((page) => page.items),
      pageParams: data.pageParams,
    }),
    placeholderData: (previousData: any) => previousData,
  }) as any;
}
