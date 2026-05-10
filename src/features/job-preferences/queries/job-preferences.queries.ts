import { queryOptions } from "@tanstack/react-query";
import { jobPreferencesApi } from "../api/job-preferences.api";

export const JOB_PREFERENCES_KEY = ["job-preferences"] as const;

export const jobPreferencesQueries = {
  detail: () =>
    queryOptions({
      queryKey: JOB_PREFERENCES_KEY,
      queryFn: () => jobPreferencesApi.get(),
      staleTime: 5 * 60 * 1000,
    }),
};
