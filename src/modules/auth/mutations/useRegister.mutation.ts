import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";
import { authQueryKeys } from "../queries/auth.queryKeys";
import type { RegisterData } from "../api/auth.api.types";

export function useRegisterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterData) => authApi.register(data),
    onSuccess: (data) => {
      queryClient.setQueryData(authQueryKeys.session(), data);
      queryClient.setQueryData(authQueryKeys.profile(), data.user);
    },
  });
}
