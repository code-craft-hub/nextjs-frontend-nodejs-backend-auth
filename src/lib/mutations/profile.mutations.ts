import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { profileApi } from "../api/profile.api";
import { userQueries } from "@module/user";
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
      // Reset (not just invalidate) autoApply queries to clear cached data
      // This restarts the polling logic since it checks for empty recommendations
      queryClient.resetQueries({
        queryKey: jobsQueries.autoApply().queryKey,
      });
      queryClient.resetQueries({
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
