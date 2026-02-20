import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      // Wipe entire cache — all data is user-scoped
      queryClient.clear();
    },
  });
}
