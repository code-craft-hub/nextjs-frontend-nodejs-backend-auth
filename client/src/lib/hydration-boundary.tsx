'use client';

import { QueryClient, HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { ReactNode } from 'react';

interface HydrationBoundaryWrapperProps {
  children: ReactNode;
  queries?: Array<{
    queryKey: any[];
    queryFn: () => Promise<any>;
  }>;
}

export default function HydrationBoundaryWrapper({ 
  children, 
  queries = [] 
}: HydrationBoundaryWrapperProps) {
  const queryClient = new QueryClient();

  // Pre-populate queries on server
  queries.forEach(({ queryKey, queryFn }) => {
    queryClient.prefetchQuery({ queryKey, queryFn });
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}