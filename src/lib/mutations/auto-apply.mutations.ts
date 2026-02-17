import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  autoApplyApi,
  type CreateAutoApplyData,
  type UpdateAutoApplyData,
} from "@/lib/api/auto-apply.api";
import {
  invalidateAutoApplyLists,
  invalidateAutoApplyDetail,
  invalidateAutoApplyCount,
} from "@/lib/query/query-invalidation";

export function useCreateAutoApplyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAutoApplyData) => autoApplyApi.create(data),
    onSettled: () => {
      invalidateAutoApplyLists(queryClient);
      invalidateAutoApplyCount(queryClient);
    },
  });
}

export function useUpdateAutoApplyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAutoApplyData }) =>
      autoApplyApi.update(id, data),
    onSettled: (_data, _error, { id }) => {
      invalidateAutoApplyDetail(queryClient, id);
      invalidateAutoApplyLists(queryClient);
    },
  });
}

export function useDeleteAutoApplyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => autoApplyApi.delete(id),
    onSettled: () => {
      invalidateAutoApplyLists(queryClient);
      invalidateAutoApplyCount(queryClient);
    },
  });
}
