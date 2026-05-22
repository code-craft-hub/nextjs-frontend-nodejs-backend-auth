import * as Sentry from "@sentry/nextjs";
import { isProduction } from "./config/env";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: isProduction,

  // No replay integration at startup — lazy-loaded after first interaction
  integrations: [],

  tracesSampleRate: 0.1,
  enableLogs: true,

  replaysSessionSampleRate: 0.05,
  replaysOnErrorSampleRate: 1.0,

  sendDefaultPii: true,
});

// Lazy-load Sentry Replay only in production, after first user interaction,
// so the 77 KiB replay bundle does not block the initial page parse.
if (isProduction && typeof window !== "undefined") {
  const loadReplay = () => {
    import("@sentry/nextjs").then(({ replayIntegration }) => {
      Sentry.addIntegration(
        replayIntegration({ maskAllText: false, blockAllMedia: false }),
      );
    });
  };

  window.addEventListener("pointerdown", loadReplay, { once: true });
  window.addEventListener("keydown", loadReplay, { once: true });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
