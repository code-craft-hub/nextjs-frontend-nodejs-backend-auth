import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "../api/user.api";
import type { UpdateUserData } from "../api/user.api.types";
import { invalidateUserDetail, invalidateUserLists } from "../queries/user.queryOptions";

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data }: { data: UpdateUserData }) =>
      userApi.updateUser(data),
    onSettled: (_data, _error) => {
      invalidateUserDetail(queryClient);
      invalidateUserLists(queryClient);
    },
  });
}
