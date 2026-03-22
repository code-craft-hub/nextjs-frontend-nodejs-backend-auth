/**
 * Unified Analytics — GA4 + PostHog dual-write for Cver AI
 *
 * Architecture:
 *  - GA4: all events call window.gtag() (loaded via Script in layout.tsx)
 *  - PostHog: all events call posthog.capture() (initialised in PostHogProvider)
 *  - UTM params are captured on first load and persisted to sessionStorage
 *  - Every GA4 event receives: platform, source, utm_* params
 *  - user_id / PostHog identity is set via AnalyticsIdentifier in query-provider
 *  - Conversion events: gmail_connect_success, payment_success (mark in GA4 UI
 *    and set as PostHog actions)
 */

import posthog from "posthog-js";

// ─── Type declarations ────────────────────────────────────────────────────────

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
  }
}

// ─── UTM capture & retrieval ──────────────────────────────────────────────────

const UTM_SESSION_KEY = "cver_utm";

export type UtmParams = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
};

/**
 * Call once on app load (GoogleAnalyticsProvider) to read UTM params from the
 * URL and store them in sessionStorage for the duration of the session.
 * Only overwrites if the current URL actually contains UTM params.
 */
export function captureUtm(): void {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  const keys = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
  ] as const;

  const utm: UtmParams = {};
  let hasUtm = false;

  for (const key of keys) {
    const val = url.searchParams.get(key);
    if (val) {
      utm[key] = val;
      hasUtm = true;
    }
  }

  if (hasUtm) {
    try {
      sessionStorage.setItem(UTM_SESSION_KEY, JSON.stringify(utm));
    } catch {
      // sessionStorage unavailable (e.g. private browsing restrictions) — skip
    }
  }
}

/** Returns stored UTM params, or an empty object if none were captured. */
export function getUtm(): UtmParams {
  if (typeof window === "undefined") return {};
  try {
    const stored = sessionStorage.getItem(UTM_SESSION_KEY);
    return stored ? (JSON.parse(stored) as UtmParams) : {};
  } catch {
    return {};
  }
}

// ─── Core tracker ─────────────────────────────────────────────────────────────

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-CDMCYEXE2W";

/**
 * Builds the shared parameter block appended to every event:
 *   platform  — always "web"
 *   source    — utm_source or "direct"
 *   utm_*     — forwarded as-is so GA4 can join to traffic sources
 */
function buildBaseParams(extra?: Record<string, unknown>): Record<string, unknown> {
  const utm = getUtm();
  return {
    platform: "web",
    source: utm.utm_source || "direct",
    ...utm,
    ...extra,
  };
}

/**
 * Fire a GA4 event.  Safe to call server-side (no-ops when window is absent).
 */
export function track(
  eventName: string,
  params?: Record<string, unknown>,
): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", eventName, { send_to: GA_ID, ...buildBaseParams(params) });
}

/**
 * Fire a PostHog event.  posthog-js queues calls made before init() and
 * no-ops in SSR, so this is safe to call anywhere in the client bundle.
 */
function phTrack(
  eventName: string,
  params?: Record<string, unknown>,
): void {
  posthog.capture(eventName, params);
}

// ─── Funnel event helpers ─────────────────────────────────────────────────────

/**
 * All named funnel events in one place.
 * Import `Analytics` wherever you need to fire an event.
 *
 * GA4 Conversions to mark in the GA4 UI (Admin → Events → Mark as conversion):
 *   - gmail_connect_success
 *   - payment_success
 */
export const Analytics = {
  // ── Identity ───────────────────────────────────────────────────────────────

  /**
   * Associate the authenticated user with their GA4 session.
   * PostHog identity (with full traits) is handled separately in
   * AnalyticsIdentifier inside query-provider so we have access to the full
   * UserProfile object from React Query.
   */
  identify(userId: string) {
    if (typeof window === "undefined" || typeof window.gtag !== "function") return;
    window.gtag("config", GA_ID, { user_id: userId });
  },

  // ── Acquisition ────────────────────────────────────────────────────────────

  /**
   * User successfully created an account.
   * @param method  "email" | "google"
   */
  signupComplete(method: "email" | "google" = "email") {
    track("signup_complete", { method });
    phTrack("signup_complete", { method });
  },

  // ── Activation ─────────────────────────────────────────────────────────────

  /**
   * User finished all onboarding steps and reaches the dashboard / gmail step.
   */
  onboardingComplete() {
    track("onboarding_complete", {});
    phTrack("onboarding_complete");
  },

  // ── Job engagement ─────────────────────────────────────────────────────────

  /** User opened the full job detail page. */
  jobView(jobId: string, jobTitle?: string) {
    track("job_view", { job_id: jobId, job_title: jobTitle ?? "" });
    phTrack("job_view", { job_id: jobId, job_title: jobTitle ?? "" });
  },

  /** User bookmarked / saved a job. */
  jobSave(jobId: string) {
    track("job_save", { job_id: jobId });
    phTrack("job_save", { job_id: jobId });
  },

  // ── Gmail connect ───────────────────────────────────────────────────────────

  /**
   * User initiated the Gmail OAuth flow.
   * @param trigger  Where the flow was triggered from.
   */
  gmailConnectStart(trigger: "onboarding" | "settings" | "toggle" = "settings") {
    track("gmail_connect_start", { trigger });
    phTrack("gmail_connect_start", { trigger });
  },

  /**
   * User saw the Gmail permissions / warning screen before connecting.
   * (fires when OnBoardingForm8 mounts)
   */
  gmailConnectWarningView() {
    track("gmail_connect_warning_view", {});
    phTrack("gmail_connect_warning_view");
  },

  /**
   * Gmail OAuth completed successfully.
   * ★ Mark as conversion in GA4 Admin → Events.
   * ★ Mark as PostHog Action for funnel analysis.
   */
  gmailConnectSuccess() {
    track("gmail_connect_success", {});
    phTrack("gmail_connect_success");
  },

  // ── Auto-apply ─────────────────────────────────────────────────────────────

  /**
   * User started an auto-apply session (documents began generating).
   */
  autoApplyEnable(jobId?: string) {
    track("auto_apply_enable", { job_id: jobId ?? "" });
    phTrack("auto_apply_enable", { job_id: jobId ?? "" });
  },

  /**
   * An auto-apply record was saved (application ready to send / sent).
   */
  autoApplyRun(jobId?: string) {
    track("auto_apply_run", { job_id: jobId ?? "" });
    phTrack("auto_apply_run", { job_id: jobId ?? "" });
  },

  // ── Monetisation ───────────────────────────────────────────────────────────

  /**
   * User clicked "Upgrade" — entering the payment flow / trial period.
   */
  trialStart() {
    track("trial_start", {});
    phTrack("trial_start");
  },

  /**
   * Paystack payment was verified as successful.
   * ★ Mark as conversion in GA4 Admin → Events.
   * ★ Mark as PostHog Action for revenue funnel.
   * @param plan      e.g. "pro"
   * @param amount    numeric amount (e.g. 4999)
   * @param currency  ISO 4217 (e.g. "NGN")
   */
  paymentSuccess(plan: string, amount: number, currency: string) {
    track("payment_success", { plan, value: amount, currency });
    phTrack("payment_success", { plan, amount, currency });
  },
} as const;
