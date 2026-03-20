import { QueryClient } from "@tanstack/react-query";

/**
 * Creates a fresh QueryClient for each test with aggressive no-retry/cache settings
 * so tests are fast and isolated.
 */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
