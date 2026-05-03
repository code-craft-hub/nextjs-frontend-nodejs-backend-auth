"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { API_URL } from "@/shared/api/client";
import type { IUser } from "@/shared/types";
import { queryKeys } from "@/shared/query/keys";
import type { JobPost } from "@/features/job-posts";
import {
  useSubmitBrowserApplicationMutation,
  useResumeBrowserApplicationMutation,
  type BotStatusEvent,
} from "@/features/browser-automation";
import { useUpdateJobApplicationHistoryMutation } from "@/features/jobs/mutations/jobs.mutations";
import { gmailApi } from "@/features/email-application/api/gmail.api";
import { buildAutoApplyStartUrl } from "@/lib/utils/ai-apply-navigation";
import { useExtension, type ExtensionState, type ExtensionProfile } from "./useExtension";
import {
  TERMINAL_STATUSES,
  type ApplySession,
  type ApplyStatus,
  type ApplyStrategy,
} from "../types/apply-session.types";

// ─── Constants ────────────────────────────────────────────────────────────────

const MANUAL_DOMAINS = ["linkedin.com", "glassdoor.com", "indeed.com"];

// ─── Pure utilities (no hooks) ────────────────────────────────────────────────

/**
 * Converts the React app's cached IUser into the slim profile object the
 * Gemini agent reads to fill contact and professional fields.
 *
 * Only includes fields the agent can act on — name, contact, title, and a
 * summary. The richer CV data (work experience, education) lives in the
 * user's data sources and would need a separate fetch; for now the agent
 * uses whatever the user has stored in the extension side panel for those.
 */
export function buildExtensionProfile(user: Partial<IUser>): ExtensionProfile {
  const name =
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.displayName ||
    user.name ||
    "";
  const address = [user.address, user.state, user.country]
    .filter(Boolean)
    .join(", ");
  return {
    name,
    email: user.email ?? "",
    phone: user.phoneNumber ?? "",
    ...(address && { address }),
    ...(user.cvJobTitle && { title: user.cvJobTitle }),
    ...(user.website && { website: user.website }),
    ...(user.portfolio && { website: user.portfolio }),
    ...(user.linkedin && { linkedin: user.linkedin }),
    // profile is the user's professional summary stored on the IUser record.
    ...(user.profile && { profileSummary: user.profile }),
  };
}

function isChromiumDesktop(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return (
    /Chrome\/\d/.test(ua) &&
    !/OPR\/|Opera\/|SamsungBrowser\/|UCBrowser\//.test(ua) &&
    !/Android|iPhone|iPad|iPod|Mobile/i.test(ua)
  );
}

function isManualDomain(url: string): boolean {
  return MANUAL_DOMAINS.some((d) => url.includes(d));
}

/**
 * Selects the highest-priority strategy for a given job + browser context.
 *
 * Priority (highest → fallback):
 *   1. email      — job.emailApply is set (recruiter-direct compose)
 *   2. manual     — apply URL is LinkedIn / Glassdoor / Indeed (must open in browser)
 *   3. extension  — Chromium desktop AND extension confirmed installed
 *   4. cloud_bot  — default: backend browser-use cloud session
 */
function selectStrategy(job: JobPost, extState: ExtensionState): ApplyStrategy {
  if (job.emailApply) return "email";
  const link = job.applyUrl ?? job.link;
  if (link && isManualDomain(link)) return "manual";
  // Both conditions required: Chromium desktop (capability) AND extension
  // detected via data-cverai-ext marker (actually installed). Without the
  // second check we'd queue jobs to "ext:queued" with no listener to pick them up.
  if (isChromiumDesktop() && extState === "installed") return "extension";
  return "cloud_bot";
}

/**
 * Maps raw SSE status strings from the server to unified ApplyStatus values.
 * "initializing" → "cloud:starting" keeps the UI spinner during handshake.
 */
function mapCloudStatus(raw: string): ApplyStatus {
  switch (raw) {
    case "initializing":          return "cloud:starting";
    case "running":               return "cloud:running";
    case "awaiting_human":        return "cloud:paused";
    case "resuming":              return "cloud:resuming";
    case "completed":             return "applied";
    case "recruiter_email_found": return "recruiter_email";
    case "failed":
    case "not_found":             return "failed";
    default:                      return "cloud:running";
  }
}

/**
 * Maps extension status strings to unified ApplyStatus values.
 *
 * Two vocabularies are handled:
 *
 *   background run statuses  — set by background.js on run.status; forwarded
 *                              via page_run_update → window.postMessage →
 *                              cverai:ext-update by useExtension.ts.
 *
 *   legacy content-script    — older strings kept for backward compatibility.
 *
 * "fallback_to_cloud" is handled separately in the onExtUpdate handler and
 * never reaches this mapper.
 */
function mapExtStatus(raw: string): ApplyStatus {
  switch (raw) {
    // ── Background service-worker run statuses (background.js serialiseRun) ──
    case "running":                  return "ext:filling";
    // awaiting_user_input: agent deferred questions — user must answer in the
    // extension side panel. Show ext:reviewing so the row signals user action needed.
    case "awaiting_user_input":      return "ext:reviewing";
    // awaiting_submit_approval: agent filled all fields; user must approve submit.
    case "awaiting_submit_approval": return "ext:reviewing";
    case "complete":                 return "applied";
    case "error":                    return "failed";
    // ── Legacy / content-script status strings ──────────────────────────────
    case "navigating": return "ext:navigating";
    case "analyzing":  return "ext:analyzing";
    case "filling":    return "ext:filling";
    case "applied":    return "applied";
    case "stuck":      return "ext:stuck";
    case "failed":     return "failed";
    default:           return "ext:queued";
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UseApplyOrchestrator {
  /** jobId → current session (undefined if never applied). */
  sessions: Record<string, ApplySession>;
  /** Current extension detection state — forwarded from useExtension. */
  extState: ExtensionState;
  /** jobId whose Q&A drawer should be open, or null. */
  qaJobId: string | null;
  /**
   * Primary entry point for any "Apply Now" / "Retry" click.
   * Guards against double-invocation; creates a fresh session on retry.
   */
  apply: (job: JobPost) => void;
  /** Resume a paused cloud-bot session (cloud:paused → cloud:resuming). */
  resume: (jobId: string) => void;
  /** Open the Q&A answer drawer for a completed cloud-bot session. */
  viewQA: (jobId: string) => void;
  /** Close the Q&A drawer. */
  dismissQA: () => void;
  /** Bring the extension's hidden automation tab to the foreground. */
  focusExtTab: (jobId: string) => void;
  /**
   * Triggered when the user clicks "Send Email Application" after the cloud
   * bot discovers a recruiter email instead of a public form.
   */
  handleEmailApply: (recruiterEmail: string) => void;
}

export function useApplyOrchestrator(): UseApplyOrchestrator {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { state: extState, applyViaExtension, focusExtTab } = useExtension();

  const { mutateAsync: submitBrowserApplication } =
    useSubmitBrowserApplicationMutation();
  const { mutate: resumeApplication } = useResumeBrowserApplicationMutation();
  const { mutate: recordApplication } =
    useUpdateJobApplicationHistoryMutation();

  // ── Core state ───────────────────────────────────────────────────────────

  const [sessions, setSessions] = useState<Record<string, ApplySession>>({});
  const [qaJobId, setQaJobId] = useState<string | null>(null);

  // Always-current mirror of `sessions` — lets event listeners registered via
  // useEffect read the latest session map without stale-closure risk, and
  // without adding `sessions` to the effect dependency array (which would
  // re-register listeners on every session update).
  const sessionsRef = useRef<Record<string, ApplySession>>({});
  sessionsRef.current = sessions;

  // applicationId → EventSource (managed imperatively, not in React state)
  const eventSourcesRef = useRef<Map<string, EventSource>>(new Map());

  // jobId lock: prevents two concurrent apply() calls for the same job from
  // racing through the async sections before the first setSessions settles.
  const inflightRef = useRef<Set<string>>(new Set());

  // ── Cleanup on unmount ───────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      eventSourcesRef.current.forEach((es) => es.close());
      eventSourcesRef.current.clear();
    };
  }, []);

  // ── Session helpers ──────────────────────────────────────────────────────

  const patchSession = useCallback(
    (jobId: string, patch: Partial<Omit<ApplySession, "jobId" | "correlationId" | "startedAt">>) => {
      setSessions((prev) => {
        const s = prev[jobId];
        if (!s) return prev;
        return { ...prev, [jobId]: { ...s, ...patch } };
      });
    },
    [],
  );

  // ── SSE management ───────────────────────────────────────────────────────

  const openCloudSSE = useCallback(
    (jobId: string, applicationId: string) => {
      if (eventSourcesRef.current.has(applicationId)) return;

      const es = new EventSource(
        `${API_URL}/browser-automation/status/${applicationId}`,
        { withCredentials: true },
      );

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as BotStatusEvent;
          const status = mapCloudStatus(data.status);

          setSessions((prev) => {
            const s = prev[jobId];
            if (!s) return prev;
            return {
              ...prev,
              [jobId]: {
                ...s,
                status,
                liveUrl:         data.liveUrl         ?? s.liveUrl,
                stuckReason:     data.stuckReason      ?? undefined,
                lastStepSummary: data.lastStepSummary  ?? undefined,
                applicationQA:   data.applicationQA    ?? undefined,
                recruiterEmail:  data.recruiterEmail   ?? undefined,
              },
            };
          });

          if (TERMINAL_STATUSES.has(status)) {
            es.close();
            eventSourcesRef.current.delete(applicationId);
          }
        } catch {
          // ignore malformed SSE frames
        }
      };

      es.onerror = () => {
        es.close();
        eventSourcesRef.current.delete(applicationId);
      };

      eventSourcesRef.current.set(applicationId, es);
    },
    [],
  );

  // ── Cloud-bot apply (shared between direct apply + fallback) ─────────────

  // Session is already initialized to cloud:starting by the caller (apply).
  // This function only owns the API call + SSE open + inflight cleanup.
  const triggerCloudBot = useCallback(
    async (jobId: string) => {
      try {
        const res = await submitBrowserApplication({ jobId });
        const { jobApplicationId, liveUrl, deduplicated } = res.data;

        if (!jobApplicationId) {
          patchSession(jobId, {
            status: "failed",
            stuckReason: "Server returned no application ID.",
          });
          return;
        }

        recordApplication({ id: String(jobId), data: { appliedJobs: jobId } });

        if (deduplicated) {
          toast.success("Your application is already being processed.", { duration: 4000 });
        } else {
          toast.success("Bot started — watch it apply live.", { duration: 4000 });
        }

        patchSession(jobId, {
          status: "cloud:running",
          applicationId: jobApplicationId,
          liveUrl,
        });

        openCloudSSE(jobId, jobApplicationId);
      } catch {
        patchSession(jobId, {
          status: "failed",
          stuckReason: "Failed to start automation. Please try again.",
        });
        toast.error("Failed to start automation. Please try again.");
      } finally {
        inflightRef.current.delete(jobId);
      }
    },
    [patchSession, submitBrowserApplication, recordApplication, openCloudSSE],
  );

  // ── Extension window-event bus ────────────────────────────────────────────

  useEffect(() => {
    // Regular status updates from extension background → content script → page
    const onExtUpdate = (e: Event) => {
      const detail = (e as CustomEvent<{
        jobId: string;
        status: string;
        stuckReason?: string;
      }>).detail;

      const { jobId, status: rawStatus, stuckReason } = detail;

      // Automatic cloud-bot fallback: extension gave up after all retry attempts.
      // We transparently switch strategy, preserving the correlationId.
      if (rawStatus === "fallback_to_cloud") {
        // Read current session from the always-fresh ref — no stale closure.
        const s = sessionsRef.current[jobId];
        if (!s || inflightRef.current.has(jobId)) return;

        inflightRef.current.add(jobId);

        // State update: mark as switching to cloud bot.
        // NOTE: API call is intentionally OUTSIDE this updater — React may call
        // state updaters multiple times in Strict Mode (dev), so side effects
        // must never live inside them.
        setSessions((prev) => {
          const sess = prev[jobId];
          if (!sess) return prev;
          return {
            ...prev,
            [jobId]: { ...sess, strategy: "cloud_bot", status: "cloud:starting", stuckReason: undefined },
          };
        });

        // API call lives here, outside any state updater.
        submitBrowserApplication({ jobId })
          .then((res) => {
            const { jobApplicationId, liveUrl, deduplicated } = res.data;
            if (!jobApplicationId) {
              setSessions((p) => {
                const sess = p[jobId];
                if (!sess) return p;
                return { ...p, [jobId]: { ...sess, status: "failed", stuckReason: "Cloud bot failed to start." } };
              });
              return;
            }
            if (!deduplicated) {
              toast.info("Extension couldn't reach the form — switched to cloud bot.", { duration: 5000 });
            }
            setSessions((p) => {
              const sess = p[jobId];
              if (!sess) return p;
              return { ...p, [jobId]: { ...sess, status: "cloud:running", applicationId: jobApplicationId, liveUrl } };
            });
            openCloudSSE(jobId, jobApplicationId);
          })
          .catch(() => {
            setSessions((p) => {
              const sess = p[jobId];
              if (!sess) return p;
              return { ...p, [jobId]: { ...sess, status: "failed", stuckReason: "Cloud bot unavailable after extension fallback." } };
            });
          })
          .finally(() => {
            inflightRef.current.delete(jobId);
          });

        return;
      }

      // Regular status update — map to unified status and patch session.
      // Read the current session first (from the always-fresh ref) so we can
      // run side-effects outside the state updater (toast, etc.).
      const currentSession = sessionsRef.current[jobId];
      if (!currentSession || currentSession.strategy !== "extension") return;

      const status = mapExtStatus(rawStatus);

      setSessions((prev) => {
        const s = prev[jobId];
        if (!s || s.strategy !== "extension") return prev;
        return {
          ...prev,
          [jobId]: { ...s, status, stuckReason: stuckReason ?? undefined },
        };
      });

      // Show an actionable toast for terminal extension failures.
      // Soft statuses (navigating, filling…) are silent — only terminal "failed"
      // gets a toast so the user knows to take action.
      if (status === "failed" && stuckReason) {
        const isConfigError = /api\s*key|side\s*panel|settings|gemini/i.test(stuckReason);
        toast.error(
          isConfigError ? "Extension not configured" : "Extension automation failed",
          {
            description: isConfigError
              ? `${stuckReason} Click the extension icon to open it.`
              : stuckReason,
            duration: 8000,
          },
        );
      }
    };

    window.addEventListener("cverai:ext-update", onExtUpdate);
    return () => window.removeEventListener("cverai:ext-update", onExtUpdate);
  }, [submitBrowserApplication, openCloudSSE]);

  // ── Public: apply ────────────────────────────────────────────────────────

  const apply = useCallback(
    (job: JobPost) => {
      // Guard 1: in-flight lock prevents race from rapid double-clicks
      if (inflightRef.current.has(job.id)) return;

      // Guard 2: only allow re-entry when previous session is terminal (retry).
      // Read from sessionsRef (always current) so `sessions` state is NOT in
      // the dep array — apply stays stable across SSE-driven re-renders.
      const existing = sessionsRef.current[job.id];
      if (existing && !TERMINAL_STATUSES.has(existing.status)) return;

      const correlationId = crypto.randomUUID();
      const strategy = selectStrategy(job, extState);

      // ── Manual: open new tab immediately ──────────────────────────────────
      if (strategy === "manual") {
        const link = job.applyUrl ?? job.link ?? "";
        setSessions((prev) => ({
          ...prev,
          [job.id]: { jobId: job.id, strategy, status: "applied", correlationId, startedAt: Date.now() },
        }));
        window.open(link, "_blank", "noopener,noreferrer");
        recordApplication({ id: String(job.id), data: { appliedJobs: job.id } });
        return;
      }

      // ── Email: check Gmail auth then navigate to compose ──────────────────
      if (strategy === "email") {
        setSessions((prev) => ({
          ...prev,
          [job.id]: { jobId: job.id, strategy, status: "routing", correlationId, startedAt: Date.now() },
        }));
        inflightRef.current.add(job.id);

        gmailApi.checkAuthStatus().then(({ authorized }) => {
          if (!authorized) {
            setSessions((prev) => {
              const s = prev[job.id];
              if (!s) return prev;
              return { ...prev, [job.id]: { ...s, status: "failed", stuckReason: "Gmail not authorized" } };
            });
            toast.error("Authorize Gmail in Settings first.", {
              action: {
                label: "Open Settings",
                onClick: () => router.push("/dashboard/settings?tab=ai-applypreference"),
              },
              classNames: { actionButton: "!bg-blue-600 hover:!bg-blue-700 !text-white !h-8" },
            });
            return;
          }
          recordApplication({ id: String(job.id), data: { appliedJobs: job.id } });
          setSessions((prev) => {
            const s = prev[job.id];
            if (!s) return prev;
            return { ...prev, [job.id]: { ...s, status: "applied" } };
          });
          const startUrl = buildAutoApplyStartUrl(
            JSON.stringify(job.descriptionText ?? ""),
            encodeURIComponent(job.emailApply!),
          );
          router.push(startUrl);
        }).catch(() => {
          setSessions((prev) => {
            const s = prev[job.id];
            if (!s) return prev;
            return { ...prev, [job.id]: { ...s, status: "failed" } };
          });
          toast.error("Something went wrong. Please try again.");
        }).finally(() => {
          inflightRef.current.delete(job.id);
        });

        return;
      }

      // ── Extension: postMessage to content-trigger.js → background ───────────
      if (strategy === "extension") {
        setSessions((prev) => ({
          ...prev,
          [job.id]: { jobId: job.id, strategy, status: "ext:queued", correlationId, startedAt: Date.now() },
        }));

        // Read the user from the React Query cache (already fetched since the
        // user is on the dashboard). Build a profile object so the agent can
        // fill contact fields without deferring them to the user.
        const cachedUser = queryClient.getQueryData<Partial<IUser>>(
          queryKeys.users.detail(),
        );
        const profile = cachedUser ? buildExtensionProfile(cachedUser) : null;
        if (!profile) {
          console.warn("[CverAI] apply: no cached user — agent will use chrome.storage profile");
        }

        // Fire-and-forget: inflightRef stays clear so the fallback handler can
        // acquire the lock if the extension reports fallback_to_cloud.
        applyViaExtension({ ...job, correlationId, profile });
        return;
      }

      // ── Cloud bot: POST to server, then open SSE stream ───────────────────
      inflightRef.current.add(job.id);
      setSessions((prev) => ({
        ...prev,
        [job.id]: { jobId: job.id, strategy: "cloud_bot", status: "cloud:starting", correlationId, startedAt: Date.now() },
      }));
      // triggerCloudBot owns the API call, SSE open, and inflightRef cleanup.
      triggerCloudBot(job.id);
    },
    // `sessions` intentionally excluded — we read from sessionsRef instead,
    // keeping `apply` stable across SSE-driven re-renders.
    [extState, applyViaExtension, triggerCloudBot, recordApplication, router],
  );

  // ── Public: resume ────────────────────────────────────────────────────────

  const resume = useCallback(
    (jobId: string) => {
      const session = sessionsRef.current[jobId];
      if (!session?.applicationId || session.status !== "cloud:paused") return;

      patchSession(jobId, { status: "cloud:resuming" });

      resumeApplication(
        { jobApplicationId: session.applicationId },
        {
          onError: () => {
            patchSession(jobId, { status: "cloud:paused" });
            toast.error("Failed to resume. Please try again.");
          },
        },
      );
    },
    // `sessions` excluded — read from sessionsRef for same stability reason as `apply`.
    [patchSession, resumeApplication],
  );

  // ── Public: viewQA / dismissQA ────────────────────────────────────────────

  const viewQA = useCallback((jobId: string) => setQaJobId(jobId), []);
  const dismissQA = useCallback(() => setQaJobId(null), []);

  // ── Public: handleEmailApply (cloud-bot discovered recruiter email) ────────

  const handleEmailApply = useCallback(
    (recruiterEmail: string) => {
      const startUrl = buildAutoApplyStartUrl(
        JSON.stringify(""),
        encodeURIComponent(recruiterEmail),
      );
      router.push(startUrl);
    },
    [router],
  );

  return {
    sessions,
    extState,
    qaJobId,
    apply,
    resume,
    viewQA,
    dismissQA,
    focusExtTab,
    handleEmailApply,
  };
}
