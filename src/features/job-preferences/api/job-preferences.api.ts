import { api } from "@/shared/api/client";
import type { JobPreferences, JobPreferencesResponse } from "./job-preferences.api.types";

const BASE = `/job-preferences`;

export const jobPreferencesApi = {
  get: () => api.get<JobPreferencesResponse>(BASE),

  save: (data: JobPreferences) =>
    api.patch<JobPreferencesResponse>(BASE, data),

  clear: () => api.delete<{ success: boolean }>(BASE),
};
