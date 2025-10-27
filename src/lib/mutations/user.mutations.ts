// lib/mutations/user.mutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  userApi,
  type CreateUserData,
} from "@/lib/api/user.api";
import { queryKeys } from "@/lib/query/keys";
import type { User, PaginatedResponse } from "@/lib/types";

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
      queryClient.setQueriesData<PaginatedResponse<User>>(
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
              } as User,
              ...old.data,
            ],
            total: old.total + 1,
          };
        }
      );

      return { previousUsers };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousUsers) {
        queryClient.setQueriesData(
          { queryKey: queryKeys.users.lists() },
          context.previousUsers
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
    mutationFn: ({ data }: {data: any }) =>
      userApi.updateUser(data),
    // onMutate: async ({ id, data }) => {
    //   await queryClient.cancelQueries({ queryKey: queryKeys.users.detail() });

    //   const previousUser = queryClient.getQueryData(queryKeys.users.detail());

    //   // Optimistically update detail
    //   queryClient.setQueryData<User>(queryKeys.users.detail(), (old) => {
    //     if (!old) return old;
    //     return { ...old, ...data, updatedAt: new Date().toISOString() };
    //   });

    //   // Update in lists
    //   queryClient.setQueriesData<PaginatedResponse<User>>(
    //     { queryKey: queryKeys.users.lists() },
    //     (old) => {
    //       if (!old) return old;
    //       return {
    //         ...old,
    //         data: old.data.map((user) =>
    //           user.id === id
    //             ? { ...user, ...data, updatedAt: new Date().toISOString() }
    //             : user
    //         ),
    //       };
    //     }
    //   );

    //   return { previousUser };
    // },
    // onError: (_err, _data, context) => {
    //   if (context?.previousUser) {
    //     queryClient.setQueryData(
    //       queryKeys.users.detail(),
    //       context.previousUser
    //     );
    //   }
    // },
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
      queryClient.setQueriesData<PaginatedResponse<User>>(
        { queryKey: queryKeys.users.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.filter((user) => user.id !== id),
            total: old.total - 1,
          };
        }
      );

      return { previousUsers };
    },
    onError: (_err, _id, context) => {
      if (context?.previousUsers) {
        queryClient.setQueriesData(
          { queryKey: queryKeys.users.lists() },
          context.previousUsers
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
  });
}
