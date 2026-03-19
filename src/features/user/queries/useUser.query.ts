import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { userQueries } from "./user.queryOptions";

/**
 * Custom hook for fetching user details with proper typing
 */
export const useUserQuery = (_options?: Partial<UseQueryOptions>) => {
  return useQuery(userQueries.detail());
};
