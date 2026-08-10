import type { RequestHandler } from "msw";

/**
 * Default MSW handlers, applied to every test run.
 *
 * Intentionally empty: `vitest.setup.ts` starts the server with
 * `onUnhandledRequest: "warn"`, so a test that performs an unmocked request is
 * surfaced as a warning rather than silently hitting the network. Tests that
 * need a response register it themselves via `server.use(...)`, which keeps the
 * mock next to the assertion that depends on it.
 */
export const handlers: RequestHandler[] = [];
