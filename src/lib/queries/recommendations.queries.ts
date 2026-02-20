import { queryOptions } from "@tanstack/react-query";
import { recommendationsApi } from "@/lib/api/recommendations.api";
import { queryKeys } from "@/lib/query/keys";

export const recommendationsQueries = {
  userRecommendations: (token?: string) =>
    queryOptions({
      queryKey: queryKeys.recommendations.user(),
      queryFn: () => recommendationsApi.getUserRecommendations(token),
      staleTime: 10 * 60 * 1000,
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
