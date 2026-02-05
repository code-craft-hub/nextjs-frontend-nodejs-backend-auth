import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { profileApi } from "../api/profile.api";
import { userQueries } from "../queries/user.queries";
import { jobsQueries } from "../queries/jobs.queries";

// Query keys
export const profileKeys = {
  all: ["profile"] as const,
  detail: () => [...profileKeys.all, "user"] as const,
};

// Custom hooks
export const useProfile = (userId: string) => {
  return useQuery({
    queryKey: profileKeys.detail(),
    queryFn: () => profileApi.getProfile(),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateDataSource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: profileApi.updateDataSource,
    onSuccess: (data, _variables) => {
      queryClient.invalidateQueries({
        queryKey: profileKeys.detail(),
      });
      queryClient.invalidateQueries({
        queryKey: userQueries.detail().queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: jobsQueries.autoApply().queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: jobsQueries.autoApplyInfinite().queryKey,
      });
      queryClient.setQueryData(profileKeys.detail(), data);
    },
    onError: (error: any) => {
      console.error("Failed to update profile:", error);
    },
  });
};

export const useSetDefaultDataSource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: profileApi.setDefaultDataSource,
    onSuccess: (data, _variables) => {
      queryClient.invalidateQueries({
        queryKey: profileKeys.detail(),
      });
      queryClient.invalidateQueries({
        queryKey: userQueries.detail().queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: jobsQueries.autoApply().queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: jobsQueries.autoApplyInfinite().queryKey,
      });
      queryClient.setQueryData(profileKeys.detail(), data);
    },
    onError: (error: any) => {
      console.error("Failed to update profile:", error);
    },
  });
};
export const useDeleteDataSource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: profileApi.deleteDataSource,
    onSuccess: (_data, _variables) => {
      queryClient.invalidateQueries({
        queryKey: profileKeys.detail(),
      });
      queryClient.invalidateQueries({
        queryKey: jobsQueries.autoApply().queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: jobsQueries.autoApplyInfinite().queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: userQueries.detail().queryKey,
      });
    },
    onError: (error: any) => {
      console.error("Failed to update profile:", error);
    },
  });
};
export const useDeleteDataSourceWithGCS = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { profileId: string }) =>
      profileApi.deleteDataSourceWithGCS(data),
    onSuccess: (_data, _variables) => {
      queryClient.invalidateQueries({
        queryKey: profileKeys.detail(),
      });
      queryClient.invalidateQueries({
        queryKey: jobsQueries.autoApply().queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: jobsQueries.autoApplyInfinite().queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: userQueries.detail().queryKey,
      });
    },
    onError: (error: any) => {
      console.error("Failed to update profile:", error);
    },
  });
};

export const useCreateDataSource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: profileApi.createDataSource,
    onSuccess: (_data, _variables) => {
      // Invalidate and refetch profile query
      queryClient.invalidateQueries({
        queryKey: profileKeys.detail(),
      });
      queryClient.invalidateQueries({
        queryKey: jobsQueries.autoApply().queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: jobsQueries.autoApplyInfinite().queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: userQueries.detail().queryKey,
      });
    },
    onError: (error: any) => {
      console.error("Failed to create profile:", error);
    },
  });
};

// // lib/mutations/user.mutations.ts
// import { useMutation, useQueryClient } from '@tanstack/react-query';
// import { userApi, type CreateUserData, type UpdateUserData } from '@/lib/api/user.api';
// import { queryKeys } from '@/lib/query/keys';
// import type { User, PaginatedResponse } from '@/lib/types';

// export function useCreateUserMutation() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (data: CreateUserData) => userApi.createUser(data),
//     onMutate: async (newUser) => {
//       // Cancel outgoing refetches
//       await queryClient.cancelQueries({ queryKey: queryKeys.users.lists() });

//       // Snapshot previous value
//       const previousUsers = queryClient.getQueryData(queryKeys.users.lists());

//       // Optimistically update lists
//       queryClient.setQueriesData<PaginatedResponse<User>>(
//         { queryKey: queryKeys.users.lists() },
//         (old) => {
//           if (!old) return old;
//           return {
//             ...old,
//             data: [{ id: 'temp-' + Date.now(), ...newUser, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as User, ...old.data],
//             total: old.total + 1,
//           };
//         }
//       );

//       return { previousUsers };
//     },
//     onError: (err, variables, context) => {
//       // Rollback on error
//       if (context?.previousUsers) {
//         queryClient.setQueriesData(
//           { queryKey: queryKeys.users.lists() },
//           context.previousUsers
//         );
//       }
//     },
//     onSettled: () => {
//       // Always refetch after mutation
//       queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
//     },
//   });
// }

// export function useUpdateUserMutation() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: ({ id, data }: { id: string; data: UpdateUserData }) =>
//       userApi.updateUser(id, data),
//     onMutate: async ({ id, data }) => {
//       await queryClient.cancelQueries({ queryKey: queryKeys.users.detail(id) });

//       const previousUser = queryClient.getQueryData(queryKeys.users.detail(id));

//       // Optimistically update detail
//       queryClient.setQueryData<User>(queryKeys.users.detail(id), (old) => {
//         if (!old) return old;
//         return { ...old, ...data, updatedAt: new Date().toISOString() };
//       });

//       // Update in lists
//       queryClient.setQueriesData<PaginatedResponse<User>>(
//         { queryKey: queryKeys.users.lists() },
//         (old) => {
//           if (!old) return old;
//           return {
//             ...old,
//             data: old.data.map((user) =>
//               user.id === id ? { ...user, ...data, updatedAt: new Date().toISOString() } : user
//             ),
//           };
//         }
//       );

//       return { previousUser };
//     },
//     onError: (err, { id }, context) => {
//       if (context?.previousUser) {
//         queryClient.setQueryData(queryKeys.users.detail(id), context.previousUser);
//       }
//     },
//     onSettled: (data, error, { id }) => {
//       queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) });
//       queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
//     },
//   });
// }

// export function useDeleteUserMutation() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (id: string) => userApi.deleteUser(id),
//     onMutate: async (id) => {
//       await queryClient.cancelQueries({ queryKey: queryKeys.users.lists() });

//       const previousUsers = queryClient.getQueryData(queryKeys.users.lists());

//       // Optimistically remove from lists
//       queryClient.setQueriesData<PaginatedResponse<User>>(
//         { queryKey: queryKeys.users.lists() },
//         (old) => {
//           if (!old) return old;
//           return {
//             ...old,
//             data: old.data.filter((user) => user.id !== id),
//             total: old.total - 1,
//           };
//         }
//       );

//       return { previousUsers };
//     },
//     onError: (err, id, context) => {
//       if (context?.previousUsers) {
//         queryClient.setQueriesData(
//           { queryKey: queryKeys.users.lists() },
//           context.previousUsers
//         );
//       }
//     },
//     onSettled: () => {
//       queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
//     },
//   });
// }
