import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@module/user";
import { useRouter } from "next/navigation";

export function useDeleteAccountMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => userApi.deleteUser(),
    onSuccess: () => {
      queryClient.clear();
      router.push("/register");
    },
  });
}
