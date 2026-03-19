import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "../api/user.api";
import { invalidateUserLists } from "../queries/user.queryOptions";

export function useDeleteUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => userApi.deleteUser(),
    onSettled: () => {
      invalidateUserLists(queryClient);
    },
  });
}
