"use client";

import { useCallback, useEffect, useState } from "react";

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

/** Minimal shape needed for cverai:apply dispatch. Compatible with JobPost. */
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
}

// ─── Browser capability detection ─────────────────────────────────────────────

/**
 * True if this browser can install Chrome Web Store extensions.
 *
 * Requires:
 *  - Chromium-based (Chrome, Edge, Brave, Arc, …) — NOT Opera/Samsung/UC
 *  - Not a mobile user-agent
 *  - Primary pointer is "fine" (mouse), not touch
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
  // jobId → latest status pushed by the extension background
  const [extJobStatuses, setExtJobStatuses] = useState<Record<string, ExtJobUpdate>>({});

  useEffect(() => {
    const capable = isExtensionCapable();
    console.log("[CverAI] isExtensionCapable:", capable, "| UA:", navigator.userAgent);

    if (!capable) {
      setState("not_capable");
      return;
    }

    // ── Install detection via DOM marker ──────────────────────────────────
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

    // ── Extension job status updates ──────────────────────────────────────
    const onExtUpdate = (e: Event) => {
      const { jobId, status, stuckReason } = (e as CustomEvent<{
        jobId: string;
        status: ExtQuickJobStatus;
        stuckReason?: string;
      }>).detail;
      console.log("[CverAI] ext-update received:", { jobId, status, stuckReason });
      setExtJobStatuses((prev) => ({ ...prev, [jobId]: { status, stuckReason } }));
    };

    window.addEventListener("cverai:ext-update", onExtUpdate);

    // Ping-pong detection: page asks → content script answers → we mark installed.
    const onExtReady = () => {
      console.log("[CverAI] cverai:ready received → state = installed");
      setState("installed");
    };
    window.addEventListener("cverai:ready", onExtReady);

    // If the content script's chrome.runtime dies (extension reloaded without page refresh),
    // drop back to not_installed so the button shows the backend fallback path.
    const onExtInvalidated = () => {
      console.warn("[CverAI] extension context invalidated — resetting to not_installed");
      setState("not_installed");
    };
    window.addEventListener("cverai:ext-invalidated", onExtInvalidated);

    console.log("[CverAI] dispatching cverai:ping…");
    window.dispatchEvent(new CustomEvent("cverai:ping", { bubbles: false }));

    return () => {
      attrObserver.disconnect();
      window.removeEventListener("cverai:ext-update", onExtUpdate);
      window.removeEventListener("cverai:ready", onExtReady);
      window.removeEventListener("cverai:ext-invalidated", onExtInvalidated);
    };
  }, []);

  /**
   * Dispatches a job to the extension for hidden-tab automation.
   * The content script picks it up and forwards to the background.
   */
  const applyViaExtension = useCallback((job: ExtensionJob) => {
    window.dispatchEvent(
      new CustomEvent("cverai:apply", {
        bubbles: false,
        detail: {
          jobId: job.id,
          title: job.title ?? "Untitled",
          company: job.companyName ?? job.company ?? "",
          location: job.location ?? "",
          salary: job.salary ?? undefined,
          jobUrl: job.applyUrl ?? job.link ?? "",
          requirementsSnippet: job.descriptionText?.slice(0, 200) ?? undefined,
          employmentType: job.employmentType ?? undefined,
          correlationId: job.correlationId,
        },
      }),
    );
  }, []);

  /**
   * Asks the background to bring the hidden automation tab to the foreground.
   * Used when the bot is stuck and needs human assistance.
   */
  const focusExtTab = useCallback((jobId: string) => {
    window.dispatchEvent(
      new CustomEvent("cverai:focus-tab", { bubbles: false, detail: { jobId } }),
    );
  }, []);

  return { state, extJobStatuses, applyViaExtension, focusExtTab };
}
