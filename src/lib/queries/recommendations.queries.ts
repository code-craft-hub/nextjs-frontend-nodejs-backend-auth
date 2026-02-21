import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { recommendationsApi, RecommendationsResponse } from "@/lib/api/recommendations.api";
import { queryKeys } from "@/lib/query/keys";

const POLLING_INTERVAL_MS = 3_000;

export const recommendationsQueries = {
  /**
   * Infinite query for the user's saved AI job recommendations.
   *
   * Behaviour:
   *  - Pages sorted by match score DESC (best matches first).
   *  - Auto-polls every 3 s while `status` is "queued"/"processing"
   *    OR while `isGenerating` is true (covers the "recommend more" flow).
   *  - Polling stops automatically once the pipeline goes idle.
   */
  userRecommendations: () =>
    infiniteQueryOptions({
      queryKey: queryKeys.recommendations.user(),
      queryFn: ({ pageParam }) =>
        recommendationsApi.getUserRecommendations({ page: pageParam as number }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => {
        const d = lastPage.data;
        return d.hasMore ? d.page + 1 : undefined;
      },
      /**
       * Poll while the backend is generating recommendations.
       * TQ evaluates this after every successful fetch, so polling stops
       * automatically once `isGenerating` becomes false.
       */
      refetchInterval: (query) => {
        const pages = query.state.data?.pages as
          | { data: RecommendationsResponse }[]
          | undefined;
        if (!pages?.length) return false;
        const last = pages[pages.length - 1]?.data;
        if (!last) return false;
        const { status, isGenerating } = last;
        const isActive =
          isGenerating || status === "queued" || status === "processing";
        return isActive ? POLLING_INTERVAL_MS : false;
      },
      staleTime: 5 * 60 * 1000,
    }),

  quickSearch: (jobTitle: string, skills?: string, limit = 10) =>
    queryOptions({
      queryKey: queryKeys.recommendations.quickSearch(jobTitle),
      queryFn: () =>
        recommendationsApi.quickSearch({ jobTitle, skills, limit }),
      staleTime: 30 * 1000,
      enabled: !!jobTitle && jobTitle.length > 1,
    }),

  similar: (jobId: string, limit = 10) =>
    queryOptions({
      queryKey: queryKeys.recommendations.similar(jobId),
      queryFn: () => recommendationsApi.getSimilarJobs(jobId, { limit }),
      staleTime: 5 * 60 * 1000,
      enabled: !!jobId,
    }),

  byTitle: (title: string, limit = 20) =>
    queryOptions({
      queryKey: queryKeys.recommendations.byTitle(title),
      queryFn: () => recommendationsApi.getJobsByTitle({ title, limit }),
      staleTime: 5 * 60 * 1000,
      enabled: !!title,
    }),

  bySkills: (skills: string, limit = 20) =>
    queryOptions({
      queryKey: queryKeys.recommendations.bySkills(skills),
      queryFn: () => recommendationsApi.getJobsBySkills({ skills, limit }),
      staleTime: 5 * 60 * 1000,
      enabled: !!skills,
    }),
};

export default recommendationsQueries;
