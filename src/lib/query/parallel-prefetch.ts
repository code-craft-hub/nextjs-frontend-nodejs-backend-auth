// lib/query/parallel-prefetch.ts - Advanced prefetching utilities
import { QueryClient, QueryFunction, type QueryKey } from '@tanstack/react-query';

interface PrefetchTask {
  queryKey: QueryKey;
  queryFn?: QueryFunction<any, any>;
  priority?: 'high' | 'medium' | 'low';
}

/**
 * Prefetch queries with priority levels
 * High priority queries run first, then medium, then low
 */
export async function prefetchWithPriority(
  queryClient: QueryClient,
  tasks: PrefetchTask[]
) {
  const high = tasks.filter((t) => t.priority === 'high' || !t.priority);
  const medium = tasks.filter((t) => t.priority === 'medium');
  const low = tasks.filter((t) => t.priority === 'low');

  // Execute high priority in parallel
  await Promise.all(
    high.map((task) =>
      queryClient.prefetchQuery({
        queryKey: task.queryKey,
        queryFn: task.queryFn,
      })
    )
  );

  // Then medium priority
  await Promise.all(
    medium.map((task) =>
      queryClient.prefetchQuery({
        queryKey: task.queryKey,
        queryFn: task.queryFn,
      })
    )
  );

  // Finally low priority (nice-to-have data)
  await Promise.allSettled(
    low.map((task) =>
      queryClient.prefetchQuery({
        queryKey: task.queryKey,
        queryFn: task.queryFn,
      })
    )
  );
}

/**
 * Prefetch with timeout - don't block page render for slow queries
 */
export async function prefetchWithTimeout(
  queryClient: QueryClient,
  tasks: PrefetchTask[],
  timeoutMs: number = 3000
) {
  const prefetchPromise = Promise.all(
    tasks.map((task) =>
      queryClient.prefetchQuery({
        queryKey: task.queryKey,
        queryFn: task.queryFn,
      })
    )
  );

  const timeoutPromise = new Promise((resolve) =>
    setTimeout(resolve, timeoutMs)
  );

  // Race between prefetch and timeout
  await Promise.race([prefetchPromise, timeoutPromise]);
}

/**
 * Prefetch only if not in cache
 */
export async function prefetchIfStale(
  queryClient: QueryClient,
  queryKey: QueryKey,
  queryFn: () => Promise<any>,
  staleTimeMs: number = 5 * 60 * 1000
) {
  const cachedData = queryClient.getQueryData(queryKey);
  const queryState = queryClient.getQueryState(queryKey);

  if (!cachedData || !queryState || Date.now() - queryState.dataUpdatedAt > staleTimeMs) {
    await queryClient.prefetchQuery({
      queryKey,
      queryFn,
    });
  }
}