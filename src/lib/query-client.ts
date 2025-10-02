import { QueryClient } from "@tanstack/react-query";

let browserQueryClient: QueryClient | undefined = undefined;

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Aggressive stale times to prevent unnecessary refetches
        staleTime: 10 * 60 * 1000, // 10 minute
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)

        // Retry configuration
        retry: (failureCount, error: any) => {
          // Don't retry on 4xx errors (client errors)
          if (error?.status >= 400 && error?.status < 500) return false;
          // Retry up to 3 times for network errors
          return failureCount < 3;
        },

        // Network mode for offline support
        networkMode: "offlineFirst",

        // Refetch behavior
        refetchOnWindowFocus: false, // Prevents unnecessary refetches
        refetchOnReconnect: "always",
        // refetchOnMount: true,
      },
      mutations: {
        networkMode: "offlineFirst",
        retry: 1,
      },
    },
  });
}

export function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}
