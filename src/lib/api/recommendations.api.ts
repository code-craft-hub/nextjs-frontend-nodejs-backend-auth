import { api } from "./client";

const JOB_RECOMMENDATION_API = `/recommendations`;

export const recommendationsApi = {
  /**
   * Trigger job recommendations for the current user
   */
  triggerJobRecommendations: async () => {
    return api.get(JOB_RECOMMENDATION_API);
  },
};
