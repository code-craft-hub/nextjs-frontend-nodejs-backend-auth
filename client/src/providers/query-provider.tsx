// app/layout.tsx
'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from '../contexts/AuthContext';

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
          if (error && typeof error === 'object' && 'status' in error) {
            const status = error.status as number;
            if (status >= 400 && status < 500) {
              return false;
            }
          }
          
          return failureCount < 3;
        },
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        refetchOnReconnect: 'always',
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
  if (typeof window === 'undefined') {
    // Server: always create a new query client
    return createQueryClient();
  }
  
  // Client: create query client if not already created
  if (!queryClient) {
    queryClient = createQueryClient();
  }
  
  return queryClient;
}

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const client = getQueryClient();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Enterprise Auth App</title>
      </head>
      <body>
        <QueryClientProvider client={client}>
          <AuthProvider>
            {children}
          </AuthProvider>
          {process.env.NODE_ENV === 'development' && (
            <ReactQueryDevtools 
              initialIsOpen={false}
              position="right"
            />
          )}
        </QueryClientProvider>
      </body>
    </html>
  );
}


interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000,
          gcTime: 10 * 60 * 1000,
          retry: (failureCount, error) => {
            if (error && typeof error === 'object' && 'status' in error) {
              const status = error.status as number;
              if (status >= 400 && status < 500) {
                return false;
              }
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
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools 
            initialIsOpen={false}
            position="right"
          />
        )}
      </AuthProvider>
    </QueryClientProvider>
  );
}