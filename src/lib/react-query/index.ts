'use client';

import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // staleTime: 5 * 60 * 1000,
        // gcTime: 10 * 60 * 1000,
        retry: (failureCount, error) => {
          if (error && typeof error === 'object' && 'status' in error) {
            const status = (error as { status: number }).status;
            if (status >= 400 && status < 500) return false;
          }
          return failureCount < 3;
        },
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        refetchOnReconnect: 'always',
      },
      mutations: {
        retry: 1,
        retryDelay: 1000,
      },
    },
  });
}

// Module-scope cache for client re-use
let browserQueryClient: QueryClient | null = null;

export function getQueryClient() {
  if (typeof window === 'undefined') {
    return createQueryClient(); // fresh on server
  }
  if (!browserQueryClient) {
    browserQueryClient = createQueryClient();
  }
  return browserQueryClient;
}

// Helpers for SSR hydration
export { dehydrate, HydrationBoundary };
