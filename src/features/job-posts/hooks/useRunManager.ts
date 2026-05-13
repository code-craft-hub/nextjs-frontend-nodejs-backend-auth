"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ActiveRun } from "../types/apply-session.types";
import type { ExtensionProfile } from "./useExtension";

// ─── Run mode ─────────────────────────────────────────────────────────────────
// Change USE_IFRAME to true to embed job sites in a hidden iframe on this page.
// false (default) opens each job in a collapsed Chrome tab group instead —
// all automation tabs live inside one "cverai jobs" group pill in the tab bar
// so the user's existing tabs stay uncluttered.
//
// Group tab → clean, no extra window, works on every job board (no iframe restrictions).
// Iframe    → faster startup (no new tab), but blocked by sites with X-Frame-Options.
const USE_IFRAME = false;

// ─── Popup-host list ─────────────────────────────────────────────────────────
// Hosts that are always forced to popup regardless of USE_IFRAME — they run
// synchronous frame-busting loops that hang the browser when iframed.
const POPUP_HOSTS: string[] = [
  "careers.opecfund.org",
  "myjobmag.com",
];

export function shouldUsePopup(url: string): boolean {
  if (!USE_IFRAME) return true; // global override: always use popup
  try {
    const host = new URL(url).host.toLowerCase();
    return POPUP_HOSTS.some((h) => host === h || host.endsWith("." + h));
  } catch {
    return false;
  }
}

// ─── CSS helpers (module-level, no React deps) ────────────────────────────────

function hideIframe(iframe: HTMLIFrameElement): void {
  Object.assign(iframe.style, {
    position: "fixed",
    top: "0",
    left: "0",
    transform: "none",
    width: "1280px",
    height: "900px",
    // Keep visible (not display:none) so Chrome doesn't throttle the frame.
    visibility: "visible",
    opacity: "0",
    pointerEvents: "none",
    zIndex: "-100",
    boxShadow: "none",
    border: "none",
  });
}

function showIframe(iframe: HTMLIFrameElement, withLogs = false): void {
  Object.assign(iframe.style, {
    position: "fixed",
    top: "72px",
    left: withLogs ? "24px" : "50%",
    transform: withLogs ? "none" : "translateX(-50%)",
    width: withLogs
      ? "calc(100vw - 24px - min(420px, 40vw))"
      : "min(1100px, calc(100vw - 48px))",
    height: "calc(100vh - 96px)",
    border: "none",
    background: "white",
    visibility: "visible",
    opacity: "1",
    pointerEvents: "auto",
    zIndex: "200",
    borderRadius: "0 0 16px 16px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
  });
}

// ─── Types ─────────────────────────────────────────────────────────────────────

/** A job waiting in the sequential automation queue. */
export interface QueueItem {
  /** job.id — used as queue key and bell display id. */
  id: string;
  job: {
    id: string;
    title?: string | null;
    company?: string | null;
    location?: string | null;
    applyUrl?: string | null;
  };
  profile?: ExtensionProfile | null;
  queuedAt: number;
}

// Run statuses that mean the agent is done (success or failure).
const EXT_TERMINAL = new Set([
  "submitted", "complete", "stopped", "error", "blocked", "max_turns",
]);

export interface UseRunManager {
  /** All active / recently completed runs (not dismissed). */
  runs: Map<string, ActiveRun>;
  /** Jobs waiting to be processed — shown in bell as "In queue". */
  queue: QueueItem[];
  /** runId of the run whose iframe is currently shown in the modal, or null. */
  modalRunId: string | null;
  /** Ref for the hidden iframe stage <div>. Attach to <IframeStage>. */
  iframeStageRef: React.RefObject<HTMLDivElement | null>;
  /**
   * Add a job to the sequential automation queue.
   * If no job is currently being processed the bot starts immediately;
   * otherwise the job waits its turn and shows as "In queue" in the bell.
   */
  enqueueJob: (
    job: {
      id: string;
      title?: string | null;
      company?: string | null;
      location?: string | null;
      applyUrl?: string | null;
    },
    profile?: ExtensionProfile | null,
  ) => void;
  /** Remove a not-yet-started job from the queue (e.g. user dismisses it). */
  dequeueJob: (jobId: string) => void;
  /** Show the iframe for runId in the modal overlay. */
  openRunModal: (runId: string) => void;
  /** Hide the modal and return the iframe to its hidden state. */
  closeRunModal: () => void;
  /** Reposition the active modal iframe (call when log panel is toggled). */
  repositionIframe: (showLogs: boolean) => void;
  /** Mark a run as dismissed (hidden from bell list). */
  dismissRun: (runId: string) => void;
  /** Stop an in-flight run and close its modal. */
  stopRun: (runId: string) => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useRunManager(): UseRunManager {
  const [runsState, setRunsState] = useState<Map<string, ActiveRun>>(new Map());
  const [modalRunId, setModalRunId] = useState<string | null>(null);

  // Dismissed run IDs — kept in a ref so run_update broadcasts can't overwrite
  // the dismissed state (run_update spreads incoming data over existing, which
  // would silently clear dismissed:true on every background broadcast).
  const dismissedRunIds = useRef<Set<string>>(new Set());

  // Imperative refs — DOM elements and token maps that must not trigger
  // re-renders and must be accessible synchronously in event handlers.
  const iframeStageRef = useRef<HTMLDivElement | null>(null);
  const iframesRef = useRef<Map<string, HTMLIFrameElement>>(new Map());
  const tokenToRunIdRef = useRef<Map<string, string>>(new Map());

  // Always-current mirror of React state for use inside event listeners
  // (avoids stale closures without adding `runsState` to effect deps).
  const runsRef = useRef<Map<string, ActiveRun>>(new Map());
  // Same pattern for modalRunId.
  const modalRunIdRef = useRef<string | null>(null);
  modalRunIdRef.current = modalRunId;

  /** Updater that keeps runsRef in sync with state atomically. */
  const setRuns = useCallback(
    (updater: (prev: Map<string, ActiveRun>) => Map<string, ActiveRun>) => {
      setRunsState((prev) => {
        const next = updater(prev);
        runsRef.current = next;
        return next;
      });
    },
    [],
  );

  // ── Job queue ─────────────────────────────────────────────────────────────
  // Jobs are processed one at a time. enqueueJob adds to the waiting list;
  // _tryProcessNext dequeues and starts the next job when the current one
  // reaches a terminal status.

  const [queueState, setQueueState] = useState<QueueItem[]>([]);
  const queueRef = useRef<QueueItem[]>([]);
  const setQueue = useCallback(
    (updater: (prev: QueueItem[]) => QueueItem[]) => {
      setQueueState((prev) => {
        const next = updater(prev);
        queueRef.current = next;
        return next;
      });
    },
    [],
  );

  // Maximum number of simultaneous automation runs.
  const MAX_CONCURRENT = 2;
  // Set of job IDs currently being processed. New jobs start when size < MAX_CONCURRENT.
  const activeJobIdsRef = useRef<Set<string>>(new Set());

  // Stable ref so the message handler (registered once) can always call the
  // latest version of _tryProcessNext without being added to useEffect deps.
  const tryProcessNextRef = useRef<() => void>(() => {});

  // ── Extension message listener ────────────────────────────────────────────

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      const data = e.data as Record<string, unknown> | null;
      if (!data || data.source !== "cverai-extension") return;

      // ── auto_apply_response: background acknowledged the trigger ──────────
      if (data.type === "auto_apply_response") {
        const { token, ok, runId, error } = data as {
          token?: string;
          ok?: boolean;
          runId?: string;
          error?: string;
        };

        if (ok && token && runId) {
          tokenToRunIdRef.current.set(token, runId);

          // Race-safe merge: a run_update for this runId may have arrived
          // BEFORE this response (background broadcasts initial "running"
          // state immediately). Whichever has live data wins; provisional
          // contributes only job info if missing.
          setRuns((prev) => {
            const next = new Map(prev);
            const prov = next.get(token);
            const fromBackground = next.get(runId);
            if (fromBackground) {
              next.set(runId, { ...(prov ?? {}), ...fromBackground, id: runId });
            } else if (prov) {
              next.set(runId, { ...prov, id: runId });
            }
            if (prov) next.delete(token);
            return next;
          });

          // Rebind iframe from token key → runId key.
          const iframe = iframesRef.current.get(token);
          if (iframe) {
            iframesRef.current.set(runId, iframe);
            iframesRef.current.delete(token);
          }
        } else if (!ok && token) {
          // Trigger was rejected — surface error on the provisional run.
          setRuns((prev) => {
            const next = new Map(prev);
            const prov = next.get(token);
            if (prov) {
              next.set(token, {
                ...prov,
                status: "error",
                blockedMessage:
                  (error as string | undefined) ??
                  "Failed to start agent. Check extension settings.",
              });
            }
            return next;
          });
          // If the rejected trigger was for an active queued job (e.g. the tab
          // was killed before background setup completed), no run_update terminal
          // status will ever arrive — release the slot so the next queued job can start.
          if (activeJobIdsRef.current.has(token)) {
            activeJobIdsRef.current.delete(token);
            setTimeout(() => tryProcessNextRef.current(), 1000);
          }
        }
      }

      // ── run_update: agent progress broadcast ──────────────────────────────
      if (data.type === "run_update" && data.run) {
        const run = data.run as ActiveRun;
        // Skip updates for runs the user has explicitly dismissed — background
        // broadcasts have no dismissed field so a naive merge would clear it.
        if (dismissedRunIds.current.has(run.id)) return;
        setRuns((prev) => {
          const next = new Map(prev);
          const existing = next.get(run.id) ?? {};
          next.set(run.id, { ...existing, ...run });
          return next;
        });

        // When an active job finishes (any terminal status), free its slot and
        // try to start the next queued job.
        if (
          EXT_TERMINAL.has(run.status) &&
          run.job?.id &&
          activeJobIdsRef.current.has(run.job.id)
        ) {
          activeJobIdsRef.current.delete(run.job.id);
          // Brief pause so the user can see the terminal status before
          // the next job's "Loading…" replaces it in the bell.
          setTimeout(() => tryProcessNextRef.current(), 1500);
        }

        // Blocked runs auto-dismiss from the bell after 45s — the background
        // tab is already closed by this point, so this just cleans up the UI.
        if (run.status === "blocked") {
          setTimeout(() => {
            if (runsRef.current.get(run.id)?.status === "blocked") {
              dismissedRunIds.current.add(run.id);
              setRuns((prev) => {
                const next = new Map(prev);
                next.delete(run.id);
                return next;
              });
            }
          }, 45_000);
        }
      }
    };

    window.addEventListener("message", handler);

    // Listener is now live — prune orphaned runs first so any windows the
    // user closed while away are stopped, then replay all active runs.
    window.postMessage({ source: "cverai", type: "resync_runs" }, "*");

    // Second resync after a short delay catches the case where the extension
    // service worker was waking up and missed the first resync_runs message.
    const resyncTimer = setTimeout(() => {
      window.postMessage({ source: "cverai", type: "resync_runs" }, "*");
    }, 2000);

    return () => {
      window.removeEventListener("message", handler);
      clearTimeout(resyncTimer);
    };
  }, [setRuns]);

  // ── Queue management ─────────────────────────────────────────────────────

  const enqueueJob = useCallback(
    (
      job: {
        id: string;
        title?: string | null;
        company?: string | null;
        location?: string | null;
        applyUrl?: string | null;
      },
      profile?: ExtensionProfile | null,
    ) => {
      const item: QueueItem = { id: job.id, job, profile: profile ?? null, queuedAt: Date.now() };

      // Add a provisional "queued" entry in runs so the bell shows it immediately.
      setRuns((prev) => {
        const next = new Map(prev);
        if (!next.has(job.id)) {
          next.set(job.id, {
            id: job.id,
            job: { id: job.id, title: job.title ?? "Job", company: job.company ?? "" },
            status: "queued",
            openMode: shouldUsePopup(job.applyUrl ?? "") ? "group_tab" : "iframe",
            log: [{ t: Date.now(), level: "info", text: "Waiting in queue…" }],
            provisional: true,
            createdAt: Date.now(),
          });
        }
        return next;
      });

      setQueue((prev) => {
        const next = [...prev, item];
        queueRef.current = next;
        return next;
      });

      // Start immediately if nothing is running.
      setTimeout(() => tryProcessNextRef.current(), 0);
    },
    [setRuns, setQueue],
  );

  const dequeueJob = useCallback(
    (jobId: string) => {
      setQueue((prev) => prev.filter((item) => item.id !== jobId));
      // Also remove the "queued" provisional run from the bell.
      setRuns((prev) => {
        const run = prev.get(jobId);
        if (run?.status === "queued") {
          const next = new Map(prev);
          next.delete(jobId);
          return next;
        }
        return prev;
      });
    },
    [setQueue, setRuns],
  );

  // ── startIframeApply ──────────────────────────────────────────────────────

  const startIframeApply = useCallback(
    async (
      job: {
        id: string;
        title?: string | null;
        company?: string | null;
        location?: string | null;
        applyUrl?: string | null;
      },
      profile?: ExtensionProfile | null,
    ) => {
      const stage = iframeStageRef.current;
      if (!stage) {
        console.warn("[RunManager] iframe stage not yet mounted — apply ignored");
        return;
      }

      const token = job.id;
      const jobUrl = job.applyUrl ?? "";

      // Create iframe immediately (before load) so it appears hidden right
      // away and Chrome doesn't delay its network request.
      const iframe = document.createElement("iframe");
      iframe.allow =
        "clipboard-read; clipboard-write; geolocation; microphone; camera";
      // Strips our origin from ancestorOrigins inside nested frames (helps
      // reCAPTCHA Enterprise on Greenhouse-embedded pages).
      iframe.referrerPolicy = "no-referrer";
      // CRITICAL: sandbox without allow-top-navigation prevents the job site
      // from running frame-busting JS that navigates the parent (cverai.com)
      // tab to itself. This is a browser-enforced boundary — no JS trick can
      // bypass it, unlike the window.top spoof in iframe-bust.js which Chrome
      // sometimes blocks as non-configurable.
      // allow-same-origin keeps cookies/storage for authenticated ATS forms.
      // allow-popups-to-escape-sandbox lets OAuth flows open real windows.
      // Chrome extensions can still inject into sandboxed frames via the
      // privileged scripting API regardless of sandbox tokens.
      iframe.sandbox.add(
        "allow-scripts",
        "allow-forms",
        "allow-same-origin",
        "allow-popups",
        "allow-popups-to-escape-sandbox",
        "allow-downloads",
        "allow-modals",
      );
      hideIframe(iframe);
      stage.appendChild(iframe);
      iframesRef.current.set(token, iframe);

      // Provisional run so the bell popover shows something immediately.
      setRuns((prev) => {
        const next = new Map(prev);
        next.set(token, {
          id: token,
          job: {
            id: job.id,
            title: job.title ?? "Job",
            company: job.company ?? "",
            location: job.location ?? undefined,
          },
          status: "loading",
          openMode: "iframe",
          jobUrl,
          log: [{ t: Date.now(), level: "info", text: `Loading ${jobUrl}…` }],
          provisional: true,
          createdAt: Date.now(),
        });
        return next;
      });

      // Wait for the iframe to load so background.findIframeFrameId can
      // resolve the frameId. Resolve after 30 s regardless (let agent try).
      await new Promise<void>((resolve) => {
        let done = false;
        iframe.addEventListener(
          "load",
          () => {
            if (!done) {
              done = true;
              resolve();
            }
          },
          { once: true },
        );
        iframe.src = jobUrl;
        setTimeout(() => {
          if (!done) {
            done = true;
            console.warn("[RunManager] iframe load timeout for", jobUrl);
            resolve();
          }
        }, 8_000);
      });

      // Send trigger to content-trigger.js → background.
      window.postMessage(
        {
          source: "cverai",
          type: "auto_apply",
          token,
          payload: {
            job: {
              id: job.id,
              title: job.title ?? "Job",
              company: job.company ?? "",
              location: job.location ?? "",
            },
            jobUrl,
            useIframe: true,
            // Profile so the Gemini agent can fill contact/professional fields
            // without deferring them. Falls back to chrome.storage if omitted.
            ...(profile && { profile }),
          },
        },
        "*",
      );
    },
    [setRuns],
  );

  // ── startPopupApply ──────────────────────────────────────────────────────
  // Opens the job URL in a collapsed Chrome tab group (background tab) so the
  // extension can automate without showing an extra window to the user.
  // Falls back to a minimized popup window when the Tab Groups API is unavailable.

  const startPopupApply = useCallback(
    (
      job: {
        id: string;
        title?: string | null;
        company?: string | null;
        location?: string | null;
        applyUrl?: string | null;
      },
      profile?: ExtensionProfile | null,
    ) => {
      const token = job.id;
      const jobUrl = job.applyUrl ?? "";

      setRuns((prev) => {
        const next = new Map(prev);
        next.set(token, {
          id: token,
          job: {
            id: job.id,
            title: job.title ?? "Job",
            company: job.company ?? "",
            location: job.location ?? undefined,
          },
          status: "loading",
          openMode: "group_tab",
          jobUrl,
          log: [
            {
              t: Date.now(),
              level: "info",
              text: `Opening ${jobUrl} in background tab — will appear in collapsed "cverai jobs" group.`,
            },
          ],
          provisional: true,
          createdAt: Date.now(),
        });
        return next;
      });

      window.postMessage(
        {
          source: "cverai",
          type: "auto_apply",
          token,
          payload: {
            job: {
              id: job.id,
              title: job.title ?? "Job",
              company: job.company ?? "",
              location: job.location ?? "",
            },
            jobUrl,
            useIframe: false,
            ...(profile && { profile }),
          },
        },
        "*",
      );
    },
    [setRuns],
  );

  // ── Queue processor ──────────────────────────────────────────────────────
  // _tryProcessNext is assigned to tryProcessNextRef so the message handler
  // (registered once in useEffect) always calls the latest closure without
  // needing to be in the effect's dependency array.

  const _tryProcessNext = useCallback(() => {
    // Stop if we're already at the concurrency limit or the queue is empty.
    if (activeJobIdsRef.current.size >= MAX_CONCURRENT) return;
    if (queueRef.current.length === 0) return;

    const item = queueRef.current[0];

    // Remove from queue state.
    setQueue((prev) => prev.slice(1));

    // Remove the provisional "queued" run — startIframeApply/startPopupApply
    // will create their own "loading" entry with the correct openMode.
    setRuns((prev) => {
      const run = prev.get(item.id);
      if (run?.status === "queued") {
        const next = new Map(prev);
        next.delete(item.id);
        return next;
      }
      return prev;
    });

    activeJobIdsRef.current.add(item.id);

    const jobUrl = item.job.applyUrl ?? "";
    if (shouldUsePopup(jobUrl)) {
      startPopupApply(item.job, item.profile);
    } else {
      // Fire without awaiting so a second concurrent job can start immediately.
      void startIframeApply(item.job, item.profile);
    }

    // Watchdog: if the extension never acknowledges the trigger (service worker
    // suspended, content script missing, tab crash, etc.) the provisional
    // "loading" run would block this slot forever.  After 30 s with no progress
    // past "loading", surface an error and release the slot.
    const watchedJobId = item.id;
    setTimeout(() => {
      if (!activeJobIdsRef.current.has(watchedJobId)) return; // already cleared
      // After auto_apply_response the provisional run is moved from the token
      // key (job.id) to the real runId key — resolve whichever key is current.
      const mappedRunId = tokenToRunIdRef.current.get(watchedJobId);
      const lookupKey = mappedRunId ?? watchedJobId;
      const stuck = runsRef.current.get(lookupKey);
      if (!stuck || stuck.status !== "loading") return; // progressed — OK
      console.warn(`[RunManager] trigger timeout for job ${watchedJobId} — releasing slot`);
      setRuns((prev) => {
        const next = new Map(prev);
        const r = next.get(lookupKey);
        if (r?.status === "loading") {
          next.set(lookupKey, {
            ...r,
            status: "error",
            blockedMessage:
              "Extension did not respond in time. The service worker may have been suspended — click Apply to retry.",
          });
        }
        return next;
      });
      activeJobIdsRef.current.delete(watchedJobId);
      setTimeout(() => tryProcessNextRef.current(), 1000);
    }, 30_000);

    // If there is still room for another concurrent run, start it immediately.
    if (activeJobIdsRef.current.size < MAX_CONCURRENT && queueRef.current.length > 0) {
      setTimeout(() => tryProcessNextRef.current(), 300);
    }
  }, [setQueue, setRuns, startIframeApply, startPopupApply]);

  // Keep the ref in sync every render so the message-handler closure is fresh.
  tryProcessNextRef.current = _tryProcessNext;

  // ── openRunModal / closeRunModal ──────────────────────────────────────────

  const openRunModal = useCallback((runId: string) => {
    const run = runsRef.current.get(runId);
    if (!run) return;

    // Group-tab and popup-mode runs live outside this page —
    // ask the extension to expand the group / restore the window.
    if (run.openMode === "window" || run.openMode === "group_tab") {
      window.postMessage(
        { source: "cverai", type: "focus_run_window", runId },
        "*",
      );
      return;
    }

    let iframe = iframesRef.current.get(runId);

    // If this run arrived via resync (page reload / new session) there is no
    // iframe in the DOM yet. Recreate it so the user can see the job form.
    if (!iframe && run.jobUrl && iframeStageRef.current) {
      iframe = document.createElement("iframe");
      iframe.allow =
        "clipboard-read; clipboard-write; geolocation; microphone; camera";
      iframe.referrerPolicy = "no-referrer";
      iframe.sandbox.add(
        "allow-scripts",
        "allow-forms",
        "allow-same-origin",
        "allow-popups",
        "allow-popups-to-escape-sandbox",
        "allow-downloads",
        "allow-modals",
      );
      iframe.src = run.jobUrl;
      hideIframe(iframe);
      iframeStageRef.current.appendChild(iframe);
      iframesRef.current.set(runId, iframe);
    }

    // Hide every other iframe so only the active one is interactive.
    for (const [id, f] of iframesRef.current) {
      if (id !== runId) hideIframe(f);
    }

    if (iframe) {
      showIframe(iframe, false);
    }
    // Always show the modal overlay (status/logs/stop) even when no iframe exists.
    setModalRunId(runId);
  }, []); // runsRef + iframesRef + iframeStageRef are stable refs

  const closeRunModal = useCallback(() => {
    const runId = modalRunIdRef.current;
    if (runId) {
      const iframe = iframesRef.current.get(runId);
      if (iframe) hideIframe(iframe);
    }
    setModalRunId(null);
  }, []);

  const repositionIframe = useCallback((withLogs: boolean) => {
    const runId = modalRunIdRef.current;
    if (!runId) return;
    const iframe = iframesRef.current.get(runId);
    if (iframe) showIframe(iframe, withLogs);
  }, []);

  // ── dismissRun / stopRun ──────────────────────────────────────────────────

  const dismissRun = useCallback(
    (runId: string) => {
      const run = runsRef.current.get(runId);

      // Stop the agent loop if it's still running — prevents orphaned loops
      // that keep burning quota after the user dismisses the run from the bell.
      if (run && !EXT_TERMINAL.has(run.status)) {
        window.postMessage({ source: "cverai", type: "stop_run", runId }, "*");
      }

      // For group-tab and popup-mode runs, close the background tab/window so it
      // doesn't stay open consuming memory after the user dismisses from the bell.
      if (run?.openMode === "window" || run?.openMode === "group_tab") {
        window.postMessage({ source: "cverai", type: "close_run_window", runId }, "*");
      }

      // For iframe-mode runs, remove the DOM element from the stage.
      if (run?.openMode === "iframe") {
        const iframe = iframesRef.current.get(runId);
        if (iframe) {
          iframe.remove();
          iframesRef.current.delete(runId);
        }
        // If this iframe was in the modal overlay, close the modal.
        if (modalRunIdRef.current === runId) closeRunModal();
      }

      // Record dismissed FIRST so any in-flight run_update is ignored.
      dismissedRunIds.current.add(runId);
      setRuns((prev) => {
        const next = new Map(prev);
        next.delete(runId);
        return next;
      });
    },
    [setRuns, closeRunModal],
  );

  const stopRun = useCallback(
    (runId: string) => {
      window.postMessage({ source: "cverai", type: "stop_run", runId }, "*");
      if (modalRunIdRef.current === runId) closeRunModal();
    },
    [closeRunModal],
  );

  return {
    runs: runsState,
    queue: queueState,
    modalRunId,
    iframeStageRef,
    enqueueJob,
    dequeueJob,
    openRunModal,
    closeRunModal,
    repositionIframe,
    dismissRun,
    stopRun,
  };
}
