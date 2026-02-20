import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@module/user";
import { authQueryKeys } from "../queries/auth.queryKeys";
import type { IUser } from "@/types";

export function useDeleteAccountMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      const profile = queryClient.getQueryData<Partial<IUser>>(
        authQueryKeys.profile(),
      );
      if (!profile?.id) throw new Error("No authenticated user found");
      return userApi.deleteUser(profile.id);
    },
    onSuccess: () => {
      // Wipe entire cache — account no longer exists
      queryClient.clear();
    },
  });
}
