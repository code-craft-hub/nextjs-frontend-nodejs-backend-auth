import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  autoApplyApi,
  type CreateAutoApplyData,
  type UpdateAutoApplyData,
} from "@/lib/api/auto-apply.api";
import { autoApplyKeys } from "@/lib/query/auto-apply.keys";

export function useCreateAutoApplyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAutoApplyData) => autoApplyApi.create(data),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: autoApplyKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: autoApplyKeys.count(),
      });
    },
  });
}

export function useUpdateAutoApplyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAutoApplyData }) =>
      autoApplyApi.update(id, data),
    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries({
        queryKey: autoApplyKeys.detail(id),
      });
      queryClient.invalidateQueries({
        queryKey: autoApplyKeys.lists(),
      });
    },
  });
}

export function useDeleteAutoApplyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => autoApplyApi.delete(id),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: autoApplyKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: autoApplyKeys.count(),
      });
    },
  });
}
