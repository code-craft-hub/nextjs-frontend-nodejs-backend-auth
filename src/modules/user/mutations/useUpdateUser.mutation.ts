import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "../api/user.api";
import { invalidateUserDetail, invalidateUserLists } from "../queries/user.queryOptions";

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data }: { data: any }) => userApi.updateUser(data),
    onSettled: (_data, _error) => {
      invalidateUserDetail(queryClient);
      invalidateUserLists(queryClient);
    },
  });
}
