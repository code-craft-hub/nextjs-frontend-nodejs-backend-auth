// lib/query/prefetch.ts
import {
  QueryClient,
  QueryFunction,
  QueryKey,
  dehydrate,
  type DehydratedState,
} from "@tanstack/react-query";

export function createServerQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000,
      },
    },
  });
}

/**
 * Prefetch multiple queries in parallel and return dehydrated state.
 * Filters out any queries with undefined queryFn to prevent runtime errors.
 *
 * @param queryClient - TanStack Query client instance
 * @param queries - Array of query definitions with optional queryFn
 * @returns Dehydrated state for hydration boundary
 */
export async function prefetchQueries(
  queryClient: QueryClient,
  queries: Array<{
    queryKey: QueryKey;
    queryFn?: QueryFunction<any, any>;
  }>
): Promise<DehydratedState> {
  // Filter out queries with undefined queryFn
  const validQueries = queries.filter(
    (query): query is Required<typeof query> => {
      if (!query.queryFn) {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            "[prefetchQueries] Skipping query with undefined queryFn:",
            query.queryKey
          );
        }
        return false;
      }
      return true;
    }
  );

  // Prefetch all valid queries in parallel
  await Promise.all(
    validQueries.map(({ queryKey, queryFn }) =>
      queryClient.prefetchQuery({
        queryKey,
        queryFn,
      })
    )
  );

  return dehydrate(queryClient);
}

/**
 * Prefetch a single query and return dehydrated state
 */
export async function prefetchQuery<T>(
  queryClient: QueryClient,
  queryKey: unknown[],
  queryFn: () => Promise<T>
): Promise<DehydratedState> {
  await queryClient.prefetchQuery({
    queryKey,
    queryFn,
  });

  return dehydrate(queryClient);
}

/**
 * Helper to ensure data is fetched on server and available immediately on client
 */
export async function ensureQueryData<T>(
  queryClient: QueryClient,
  queryKey: unknown[],
  queryFn: () => Promise<T>
): Promise<T> {
  return queryClient.ensureQueryData({
    queryKey,
    queryFn,
  });
}
