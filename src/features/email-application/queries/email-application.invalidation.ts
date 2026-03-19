import { QueryClient } from "@tanstack/react-query";
import { emailApplicationKeys } from "./email-application.queryKeys";

/**
 * Email Application Query Invalidation Helpers
 * Centralized cache invalidation for email application operations
 */

export const invalidateEmailApplicationQueries = (queryClient: QueryClient) => {
  return Promise.all([
    queryClient.invalidateQueries({
      queryKey: emailApplicationKeys.lists(),
    }),
    queryClient.invalidateQueries({
      queryKey: emailApplicationKeys.details(),
    }),
  ]);
};

export const invalidateEmailApplicationDetail = (
  queryClient: QueryClient,
  applicationId: string,
) => {
  return queryClient.invalidateQueries({
    queryKey: emailApplicationKeys.detail(applicationId),
  });
};

export const invalidateEmailApplicationLists = (queryClient: QueryClient) => {
  return queryClient.invalidateQueries({
    queryKey: emailApplicationKeys.lists(),
  });
};
