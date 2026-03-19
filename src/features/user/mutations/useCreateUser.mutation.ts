import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "../api/user.api";
import type { CreateUserData } from "../api/user.api.types";
import { queryKeys } from "@/lib/query/keys";
import type { PaginatedResponse } from "@/lib/types";
import type { IUser } from "@/types";
import { invalidateUserLists } from "../queries/user.queryOptions";

export function useCreateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserData) => userApi.createUser(data),
    onMutate: async (newUser) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.users.lists() });

      // Snapshot previous value
      const previousUsers = queryClient.getQueryData(queryKeys.users.lists());

      // Optimistically update lists
      queryClient.setQueriesData<PaginatedResponse<Partial<IUser>>>(
        { queryKey: queryKeys.users.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: [
              {
                id: "temp-" + Date.now(),
                ...newUser,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              } as Partial<IUser>,
              ...old.data,
            ],
            total: old.total + 1,
          };
        },
      );

      return { previousUsers };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousUsers) {
        queryClient.setQueriesData(
          { queryKey: queryKeys.users.lists() },
          context.previousUsers,
        );
      }
    },
    onSettled: () => {
      // Always refetch after mutation
      invalidateUserLists(queryClient);
    },
  });
}
