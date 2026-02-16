import { useMutation } from "@tanstack/react-query";
import { recommendationsApi } from "../api/recommendations.api";

export const useTriggerJobRecommendationsMutation = () => {
  return useMutation({
    mutationFn: () => recommendationsApi.triggerJobRecommendations(),
    onError: (error) => {
      console.error("Error triggering job recommendations:", error);
    },
  });
};
