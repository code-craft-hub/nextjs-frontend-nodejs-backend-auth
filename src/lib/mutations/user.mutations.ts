// lib/mutations/user.mutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi, type CreateUserData } from "@/lib/api/user.api";
import { queryKeys } from "@/lib/query/keys";
import type { PaginatedResponse } from "@/lib/types";
import { IUser } from "@/types";

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
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
  });
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data }: { data: any }) => userApi.updateUser(data),
    onSettled: (_data, _error) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail() });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
  });
}
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
            data: old.data.filter((user) => user.uid !== id),
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
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
  });
}
