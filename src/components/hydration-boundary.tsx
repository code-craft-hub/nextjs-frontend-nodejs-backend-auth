// components/hydration-boundary.tsx
'use client';

import { HydrationBoundary as TanstackHydrationBoundary, type DehydratedState } from '@tanstack/react-query';
import { type ReactNode } from 'react';

interface HydrationBoundaryProps {
  state: DehydratedState;
  children: ReactNode;
}

/**
 * Wrapper around TanStack's HydrationBoundary for SSR hydration
 * Passes server-fetched data to client components seamlessly
 */
export function HydrationBoundary({ state, children }: HydrationBoundaryProps) {
  return (
    <TanstackHydrationBoundary state={state}>
      {children}
    </TanstackHydrationBoundary>
  );
}