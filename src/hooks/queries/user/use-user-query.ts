import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { userQueries } from "@/lib/queries/user.queries";

/**
 * Custom hook for fetching user details with proper typing
 */
export const useUserQuery = (_options?: Partial<UseQueryOptions>) => {
  return useQuery(userQueries.detail());
};
