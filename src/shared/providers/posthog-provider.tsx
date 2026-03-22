'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'

/**
 * Client-side PostHog provider.
 *
 * - Initialises posthog-js once on mount (idempotent: PostHog guards against
 *   double-init internally, so StrictMode double-invocation is safe).
 * - `defaults: '2026-01-30'` activates all recommended SDK settings for new
 *   projects including automatic SPA pageview capture on history changes,
 *   so no manual <SuspensePageView> wrapper is required.
 * - Exposes the posthog client instance to the React tree via context so
 *   child components can call `usePostHog()` without importing the singleton.
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      // Route through our own domain so ad-blockers can't block PostHog.
      // The /ingest rewrites in next.config.ts proxy to us.i.posthog.com.
      api_host: '/ingest',
      // ui_host points to the PostHog UI so toolbar / session replay links
      // resolve correctly despite the proxied api_host.
      ui_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      defaults: '2026-01-30',
    })
  }, [])

  return <PHProvider client={posthog}>{children}</PHProvider>
}
