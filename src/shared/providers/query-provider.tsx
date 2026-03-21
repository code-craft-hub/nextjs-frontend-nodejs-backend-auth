"use client";

import GoogleAnalyticsProvider from "@/components/GoogleAnalyticsProvider";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";
import { useHeartbeat } from "@/features/presence";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { userQueries } from "@features/user";
import { Analytics } from "@/lib/analytics";

/**
 * Mounts the presence heartbeat for any authenticated user.
 * Must live INSIDE QueryClientProvider so useUserQuery has access to the cache.
 * Returns null — purely a side-effect component.
 */
function HeartbeatRunner() {
  useHeartbeat();
  return null;
}

/**
 * Sets GA4 user_id once the authenticated user is known.
 * This lets GA4 stitch cross-device sessions and lets you JOIN
 * ga_sessions_* BigQuery tables to your own user records by user_id.
 * Returns null — purely a side-effect component.
 */
function AnalyticsIdentifier() {
  const { data: user } = useQuery({ ...userQueries.detail(), retry: false });
  useEffect(() => {
    if (user?.id) Analytics.identify(user.id);
  }, [user?.id]);
  return null;
}

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

    return createQueryClient();
  }

  // Client: create query client if not already created
  if (!queryClient) {
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
    <GoogleAnalyticsProvider>
      <QueryClientProvider client={queryClient}>
        <GoogleOAuthProvider
          clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}
        >
          <HeartbeatRunner />
          <AnalyticsIdentifier />
          {children}
          {process.env.NODE_ENV === "development" && (
            <ReactQueryDevtools initialIsOpen={false} position="right" />
          )}
          <Toaster richColors={true} position="top-right" />
        </GoogleOAuthProvider>
      </QueryClientProvider>
    </GoogleAnalyticsProvider>
  );
}
