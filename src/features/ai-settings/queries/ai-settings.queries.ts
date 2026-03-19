import { queryOptions } from "@tanstack/react-query";
import { aiSettingsApi } from "@/lib/api/ai-settings.api";
import { aiSettingsKeys } from "@/lib/query/ai-settings.keys";

export const aiSettingsQueries = {
  detail: (token?: string) =>
    queryOptions({
      queryKey: aiSettingsKeys.detail(),
      queryFn: () => aiSettingsApi.getSettings(token),
      staleTime: 10 * 60 * 1000,
    }),
};
