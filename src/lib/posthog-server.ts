import { PostHog } from 'posthog-node'

/**
 * Creates a per-request PostHog Node client for use in API Routes and
 * Server Actions.
 *
 * Why per-request instead of a module-level singleton?
 * In serverless / edge environments the process may be cold-started for every
 * request, so a shared singleton offers no reuse benefit while introducing
 * the risk of one request's shutdown() flushing another's in-flight events.
 * Per-request instances are isolated and always fully flushed.
 *
 * Usage — API Route:
 *   const ph = createServerPostHog()
 *   ph.capture({ distinctId: userId, event: 'my_event', properties: { ... } })
 *   await ph.shutdown()          // ← always flush before the response returns
 *
 * Usage — Server Action:
 *   'use server'
 *   const ph = createServerPostHog()
 *   ph.capture({ distinctId: userId, event: 'server_action_completed' })
 *   await ph.shutdown()
 *
 * flushAt:1 + flushInterval:0 ensures events are sent immediately rather than
 * waiting for a batch threshold that would never be reached in short-lived
 * serverless invocations.
 */
export function createServerPostHog(): PostHog {
  return new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    flushAt: 1,
    flushInterval: 0,
  })
}
