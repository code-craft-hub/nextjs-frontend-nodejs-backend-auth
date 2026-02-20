import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "../api/user.api";
import { queryKeys } from "@/lib/query/keys";
import type { PaginatedResponse } from "@/lib/types";
import type { IUser } from "@/types";
import { invalidateUserLists } from "../queries/user.queryOptions";

export function useDeleteUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userApi.deleteUser(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.users.lists() });

      const previousUsers = queryClient.getQueryData(queryKeys.users.lists());

      // Optimistically remove from lists
      queryClient.setQueriesData<PaginatedResponse<IUser>>(
        { queryKey: queryKeys.users.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.filter((user) => user.id !== id),
            total: old.total - 1,
          };
        },
      );

      return { previousUsers };
    },
    onError: (_err, _id, context) => {
      if (context?.previousUsers) {
        queryClient.setQueriesData(
          { queryKey: queryKeys.users.lists() },
          context.previousUsers,
        );
      }
    },
    onSettled: () => {
      invalidateUserLists(queryClient);
    },
  });
}
