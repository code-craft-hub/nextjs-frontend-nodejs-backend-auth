import { api, BACKEND_API_VERSION } from "./client";

const JOB_RECOMMENDATION_API = `/${BACKEND_API_VERSION}/recommendations`;

export const recommendationsApi = {
  /**
   * Trigger job recommendations for the current user
   */
  triggerJobRecommendations: async () => {
    return api.get(JOB_RECOMMENDATION_API);
  },
};
