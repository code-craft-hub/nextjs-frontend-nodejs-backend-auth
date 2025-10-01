"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";

// Create a stable query client instance
const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Global query defaults
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors
          if (error && typeof error === "object" && "status" in error) {
            const status = error.status as number;
            if (status >= 400 && status < 500) {
              return false;
            }
          }

          return failureCount < 3;
        },
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        refetchOnReconnect: "always",
      },
      mutations: {
        // Global mutation defaults
        retry: 1,
        retryDelay: 1000,
      },
    },
  });
};

// Initialize query client outside component to prevent recreation
let queryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always create a new query client
    console.log("QUERYCLIENT IN QUERYCLIENT IN SERVER CONTEXT");

    return createQueryClient();
  }

  // Client: create query client if not already created
  if (!queryClient) {
    console.log("QUERYCLIENT IN QUERYCLIENT IN CLIENT CONTEXT");
    queryClient = createQueryClient();
  }

  return queryClient;
}

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} position="right" />
      )}
      <Toaster richColors={true} />
    </QueryClientProvider>
  );
}
