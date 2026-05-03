"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ExtensionState =
  | "not_capable"   // mobile or non-Chromium — cannot install Chrome extensions
  | "not_installed" // Chromium desktop, extension not found
  | "installed";    // extension is installed and active

export type ExtQuickJobStatus =
  | "navigating"
  | "analyzing"
  | "filling"
  | "stuck"
  | "applied"
  | "failed"
  | "fallback_to_cloud"; // extension gave up; orchestrator should switch to cloud bot

export interface ExtJobUpdate {
  status: ExtQuickJobStatus;
  stuckReason?: string;
}

/**
 * Agent-facing profile passed with every trigger payload.
 *
 * Built by the orchestrator from the React app's cached IUser so the Gemini
 * agent can fill contact/professional fields without asking the user. Only
 * fields the agent can act on are included — nothing sensitive beyond what
 * the user already entered in the app.
 *
 * The background falls back to the profile stored in chrome.storage (side
 * panel settings) when this is absent.
 */
export interface ExtensionProfile {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  title?: string;
  website?: string;
  linkedin?: string;
  profileSummary?: string;
  /** Direct URL to the user's CV/resume file. Used by the agent's upload tool. */
  cv_url?: string | null;
}

/**
 * Minimal shape needed for applyViaExtension. Compatible with JobPost so the
 * orchestrator can spread a full job object here without a cast.
 */
export interface ExtensionJob {
  id: string;
  title?: string | null;
  companyName?: string | null;
  company?: string | null;
  location?: string | null;
  salary?: string | null;
  applyUrl?: string | null;
  link?: string | null;
  descriptionText?: string | null;
  employmentType?: string | null;
  /** Correlation ID from the orchestrator — flows into extension logs + fallback. */
  correlationId?: string;
  /**
   * Profile built from the React app's user data. Passed to the Gemini agent
   * so it can fill contact/experience fields without deferring them.
   * Omit to let the background use the chrome.storage profile instead.
   */
  profile?: ExtensionProfile | null;
}

// ─── Browser capability detection ─────────────────────────────────────────────

/**
 * True if this browser can install Chrome Web Store extensions.
 *
 * Requires:
 *  - Chromium-based (Chrome, Edge, Brave, Arc, …) — NOT Opera/Samsung/UC
 *  - Not a mobile user-agent
 */
function isExtensionCapable(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isChromium =
    /Chrome\/\d/.test(ua) &&
    !/OPR\/|Opera\/|SamsungBrowser\/|UCBrowser\//.test(ua);
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
  return isChromium && !isMobile;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useExtension() {
  const [state, setState] = useState<ExtensionState>("not_capable");
  const [extJobStatuses, setExtJobStatuses] = useState<Record<string, ExtJobUpdate>>({});

  // jobId → extension runId. Populated when the background acknowledges the
  // auto_apply_trigger (via auto_apply_response). focusExtTab reads it to
  // bring the hidden automation popup to the foreground.
  const jobRunIdsRef = useRef<Record<string, string>>({});

  useEffect(() => {
    const capable = isExtensionCapable();
    console.log("[CverAI] isExtensionCapable:", capable, "| UA:", navigator.userAgent);

    if (!capable) {
      setState("not_capable");
      return;
    }

    // ── Install detection via DOM marker ──────────────────────────────────
    // content-trigger.js sets data-cverai-ext on <html> the moment it boots.
    // We watch for it via MutationObserver so the button UI reacts live even
    // if the script loads after this hook mounts.
    const checkInstalled = () => {
      const marker = document.documentElement.getAttribute("data-cverai-ext");
      console.log("[CverAI] DOM marker check → data-cverai-ext:", marker);
      setState(marker ? "installed" : "not_installed");
    };

    checkInstalled();

    const attrObserver = new MutationObserver(checkInstalled);
    attrObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-cverai-ext"],
    });

    // ── Custom-event listeners from the extension ──────────────────────────

    // Forwarded by content-trigger.js (see its chrome.runtime.onMessage listener)
    // for legacy code paths that still dispatch cverai:ext-update directly.
    const onExtUpdate = (e: Event) => {
      const { jobId, status, stuckReason } = (e as CustomEvent<{
        jobId: string;
        status: ExtQuickJobStatus;
        stuckReason?: string;
      }>).detail;
      console.log("[CverAI] cverai:ext-update received:", { jobId, status, stuckReason });
      setExtJobStatuses((prev) => ({ ...prev, [jobId]: { status, stuckReason } }));
    };

    window.addEventListener("cverai:ext-update", onExtUpdate);

    // Ping-pong: page dispatches cverai:ping → content-trigger.js replies with
    // cverai:ready. Guards against the case where data-cverai-ext is set after
    // the MutationObserver check on mount.
    const onExtReady = () => {
      console.log("[CverAI] cverai:ready received → state = installed");
      setState("installed");
    };
    window.addEventListener("cverai:ready", onExtReady);

    // If the extension reloads while the page is open, content-trigger.js
    // removes data-cverai-ext and dispatches this so we fall back to
    // "not_installed" immediately (the MutationObserver catches the removal,
    // this event is an explicit belt-and-suspenders signal).
    const onExtInvalidated = () => {
      console.warn("[CverAI] extension context invalidated — resetting to not_installed");
      setState("not_installed");
    };
    window.addEventListener("cverai:ext-invalidated", onExtInvalidated);

    // ── postMessage bridge: extension → React ─────────────────────────────
    //
    // content-trigger.js can't dispatch CustomEvents directly back into the
    // React world (isolated-world → main-world custom event dispatch is not
    // guaranteed across all Chrome versions). Instead it uses window.postMessage
    // and we bridge here into CustomEvents that the orchestrator already listens
    // for, keeping the orchestrator decoupled from the extension plumbing.
    //
    // Two message types we care about:
    //
    //   auto_apply_response  — background acknowledged the trigger; token = jobId,
    //                          runId = UUID assigned by the background. We store
    //                          jobId → runId for focusExtTab.
    //
    //   run_update           — background is broadcasting a status change as the
    //                          agent works. We re-dispatch it as cverai:ext-update
    //                          so useApplyOrchestrator.ts can map and store it.
    const onExtMessage = (e: MessageEvent) => {
      if (!e.data || e.data.source !== "cverai-extension") return;

      const { type } = e.data;

      if (type === "auto_apply_response") {
        const { token: jobId, ok, runId, error } = e.data as {
          token: string;
          ok: boolean;
          runId?: string;
          error?: string;
        };
        console.log(
          `[CverAI] auto_apply_response | jobId=${jobId} ok=${ok} runId=${runId ?? "—"}`,
        );
        if (ok && runId) {
          // Keep the jobId → runId map so focusExtTab can use it later.
          jobRunIdsRef.current[jobId] = runId;
        } else {
          console.warn("[CverAI] Extension rejected trigger:", error);
          // Surface the error to the orchestrator so the row shows a failure badge.
          window.dispatchEvent(
            new CustomEvent("cverai:ext-update", {
              detail: {
                jobId,
                status: "failed",
                stuckReason: error ?? "Extension rejected the apply trigger",
              },
            }),
          );
        }
        return;
      }

      if (type === "run_update") {
        const run = (e.data as { run: Record<string, unknown> }).run;
        const jobId = (run?.job as { id?: string } | undefined)?.id;
        if (!jobId) return;

        // Extract a human-readable reason from the last log entry on errors.
        const log = run.log as Array<{ level: string; text: string }> | undefined;
        const lastLog = log?.[log.length - 1];
        const stuckReason =
          run.status === "error" ? (lastLog?.text ?? "Unknown error") : undefined;

        console.log(
          `[CverAI] run_update | jobId=${jobId} status=${run.status}`,
          stuckReason ?? "",
        );

        // Re-dispatch as cverai:ext-update so the orchestrator's existing
        // listener picks it up without caring about the postMessage layer.
        window.dispatchEvent(
          new CustomEvent("cverai:ext-update", {
            detail: { jobId, status: run.status, stuckReason },
          }),
        );
      }
    };

    window.addEventListener("message", onExtMessage);

    // Ping the content script. If it's already loaded it replies immediately
    // with cverai:ready → onExtReady above sets state=installed. If it loads
    // later, the MutationObserver catches data-cverai-ext being set.
    console.log("[CverAI] dispatching cverai:ping…");
    window.dispatchEvent(new CustomEvent("cverai:ping", { bubbles: false }));

    return () => {
      attrObserver.disconnect();
      window.removeEventListener("cverai:ext-update", onExtUpdate);
      window.removeEventListener("cverai:ready", onExtReady);
      window.removeEventListener("cverai:ext-invalidated", onExtInvalidated);
      window.removeEventListener("message", onExtMessage);
    };
  }, []);

  /**
   * Triggers the extension's hidden-tab automation for a job.
   *
   * Sends a postMessage to the window. The extension's content-trigger.js picks
   * it up (via its own window "message" listener in the isolated world) and
   * forwards it to the background service worker as "auto_apply_trigger".
   *
   * The background:
   *   1. Opens a hidden popup at payload.jobUrl
   *   2. Injects content-target.js into every frame
   *   3. Starts the Gemini agent loop
   *
   * Status flows back: background → broadcastToSidePanel (trigger tabs) →
   * content-trigger.js → window.postMessage → onExtMessage above →
   * cverai:ext-update CustomEvent → useApplyOrchestrator.ts onExtUpdate.
   *
   * Profile note: profile is intentionally omitted from the payload. The
   * background reads it from chrome.storage (configured in the side panel).
   * If no profile is stored, the agent defers every unknown field to the user.
   */
  const applyViaExtension = useCallback((job: ExtensionJob) => {
    const payload = {
      // job is the context object the Gemini agent reads for form answers.
      job: {
        id: job.id,
        title: job.title ?? "Untitled",
        company: job.companyName ?? job.company ?? "",
        location: job.location ?? "",
        ...(job.salary != null && { salary: job.salary }),
        ...(job.descriptionText && {
          requirementsSnippet: job.descriptionText.slice(0, 200),
        }),
        ...(job.employmentType != null && { employmentType: job.employmentType }),
      },
      // URL the background opens in the hidden popup.
      jobUrl: job.applyUrl ?? job.link ?? "",
      // useIframe: false → popup mode. Set to true only when the apply form is
      // embedded as an iframe inside the current tab (rare; requires special ATS
      // detection in background.findIframeFrameId).
      useIframe: false,
      correlationId: job.correlationId,
      // If null/undefined the background falls back to chrome.storage profile.
      profile: job.profile ?? null,
    };

    console.log(
      `[CverAI] applyViaExtension | jobId=${job.id} url=${payload.jobUrl} correlationId=${job.correlationId}`,
    );

    // token = job.id so that the auto_apply_response message can be mapped back
    // to a React session (content-trigger.js echoes the token in the response).
    window.postMessage(
      { source: "cverai", type: "auto_apply", payload, token: job.id },
      "*",
    );
  }, []);

  /**
   * Asks the background to bring the hidden automation popup to the foreground.
   *
   * Requires the jobId → runId mapping to have been recorded in jobRunIdsRef
   * when the background acknowledged the trigger (auto_apply_response).
   * If the mapping isn't there yet, logs a warning and is a no-op.
   */
  const focusExtTab = useCallback((jobId: string) => {
    const runId = jobRunIdsRef.current[jobId];
    if (!runId) {
      console.warn(
        `[CverAI] focusExtTab: no runId for jobId=${jobId} — trigger not yet acknowledged`,
      );
      return;
    }
    console.log(`[CverAI] focusExtTab | jobId=${jobId} runId=${runId}`);
    // content-trigger.js handles "focus_run_window" and forwards it to background
    // as "page_focus_run_window", which calls chrome.windows.update(focused:true).
    window.postMessage({ source: "cverai", type: "focus_run_window", runId }, "*");
  }, []);

  return { state, extJobStatuses, applyViaExtension, focusExtTab };
}
