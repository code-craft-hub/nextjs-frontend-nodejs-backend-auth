import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";
import { authQueryKeys } from "../queries/auth.queryKeys";

export function useRefreshTokenMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.refresh(),
    onSuccess: (data) => {
      queryClient.setQueryData(authQueryKeys.session(), data);
      queryClient.setQueryData(authQueryKeys.profile(), data.user);
    },
  });
}
