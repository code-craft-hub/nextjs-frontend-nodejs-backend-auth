import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  aiSettingsApi,
  type CreateAISettingsData,
  type UpdateAISettingsData,
} from "@/lib/api/ai-settings.api";
import { invalidateAISettingsQueries } from "@/lib/query/query-invalidation";

export function useCreateOrUpdateAISettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAISettingsData) =>
      aiSettingsApi.createOrUpdateSettings(data),
    onSettled: () => {
      invalidateAISettingsQueries(queryClient);
    },
  });
}

export function useUpdateAISettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateAISettingsData) =>
      aiSettingsApi.updateSettings(data),
    onSettled: () => {
      invalidateAISettingsQueries(queryClient);
    },
  });
}

export function useToggleAutoApplyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (enabled: boolean) =>
      aiSettingsApi.toggleAutoApply(enabled),
    onSettled: () => {
      invalidateAISettingsQueries(queryClient);
    },
  });
}

export function useDeleteAISettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => aiSettingsApi.deleteSettings(),
    onSettled: () => {
      invalidateAISettingsQueries(queryClient);
    },
  });
}
