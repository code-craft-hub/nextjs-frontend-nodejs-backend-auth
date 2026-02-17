import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  aiSettingsApi,
  type CreateAISettingsData,
  type UpdateAISettingsData,
} from "@/lib/api/ai-settings.api";
import { aiSettingsKeys } from "@/lib/query/ai-settings.keys";

export function useCreateOrUpdateAISettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAISettingsData) =>
      aiSettingsApi.createOrUpdateSettings(data),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: aiSettingsKeys.detail(),
      });
    },
  });
}

export function useUpdateAISettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateAISettingsData) =>
      aiSettingsApi.updateSettings(data),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: aiSettingsKeys.detail(),
      });
    },
  });
}

export function useToggleAutoApplyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (enabled: boolean) =>
      aiSettingsApi.toggleAutoApply(enabled),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: aiSettingsKeys.detail(),
      });
    },
  });
}

export function useDeleteAISettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => aiSettingsApi.deleteSettings(),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: aiSettingsKeys.detail(),
      });
    },
  });
}
