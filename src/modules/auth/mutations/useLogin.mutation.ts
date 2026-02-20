import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";
import { authQueryKeys } from "../queries/auth.queryKeys";
import type { LoginCredentials } from "../api/auth.api.types";

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (data) => {
      // Seed the cache immediately so consumers don't wait for a refetch
      queryClient.setQueryData(authQueryKeys.session(), data);
      queryClient.setQueryData(authQueryKeys.profile(), data.user);

      // All user-scoped data is now stale — refetch on next access
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      queryClient.invalidateQueries({ queryKey: ["cover-letters"] });
      queryClient.invalidateQueries({ queryKey: ["interview-questions"] });
    },
  });
}
