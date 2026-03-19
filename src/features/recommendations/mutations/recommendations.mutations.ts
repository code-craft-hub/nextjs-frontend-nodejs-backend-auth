import { useMutation, useQueryClient } from "@tanstack/react-query";
import { recommendationsApi } from "@/lib/api/recommendations.api";
import { queryKeys } from "@/lib/query/keys";

export const useTriggerJobRecommendationsMutation = () => {
  return useMutation({
    mutationFn: () => recommendationsApi.getUserRecommendations(),
    onError: (error) => {
      console.error("Error triggering job recommendations:", error);
    },
  });
};

export const useGetRecommendationsMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) =>
      recommendationsApi.getRecommendations(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.recommendations.user() });
    },
    onError: (err) => console.error("Failed to get recommendations:", err),
  });
};
