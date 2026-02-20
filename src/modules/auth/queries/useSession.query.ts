import { useQuery } from "@tanstack/react-query";
import { authQueries } from "./auth.queryOptions";

export const useSessionQuery = () => {
  return useQuery(authQueries.session());
};
