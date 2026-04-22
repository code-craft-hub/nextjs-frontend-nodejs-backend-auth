"use client";

import { useCallback, useEffect, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ExtensionState =
  | "not_capable"   // mobile or non-Chromium — can't install Chrome extensions
  | "not_installed" // Chromium desktop, extension not found
  | "installed";    // extension is installed and active

/** Minimal shape the cverai:apply event needs. Compatible with JobPost. */
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
}

// ─── Capability detection ─────────────────────────────────────────────────────

/**
 * Returns true if this browser is capable of installing Chrome extensions.
 *
 * Rules:
 *  - Must be Chromium-based (Chrome, Edge, Brave, Arc, …)
 *  - Must NOT be Opera, Samsung Browser, or UC Browser (they spoof Chrome UA)
 *  - Must NOT be a mobile UA
 *  - Must have a fine pointer (mouse) — rules out touch-primary tablets
 */
function isExtensionCapable(): boolean {
  if (typeof navigator === "undefined" || typeof window === "undefined") return false;

  const ua = navigator.userAgent;

  const isChromium =
    /Chrome\/\d/.test(ua) &&
    !/OPR\/|Opera\/|SamsungBrowser\/|UCBrowser\//.test(ua);

  const isMobileUA = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);

  // `pointer: fine` is true on devices where the primary pointer is a mouse.
  // Tablets and phones use `pointer: coarse` (touch).
  const hasMousePointer =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(pointer: fine)").matches;

  return isChromium && !isMobileUA && hasMousePointer;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useExtension() {
  const [state, setState] = useState<ExtensionState>("not_capable");

  useEffect(() => {
    if (!isExtensionCapable()) {
      setState("not_capable");
      return;
    }

    const checkInstalled = () => {
      const marker = document.documentElement.getAttribute("data-cverai-ext");
      setState(marker ? "installed" : "not_installed");
    };

    // Marker is set at document_start so it's almost always present by mount,
    // but we also watch via MutationObserver in case of late injection.
    checkInstalled();

    const observer = new MutationObserver(checkInstalled);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-cverai-ext"],
    });

    return () => observer.disconnect();
  }, []);

  /**
   * Dispatches a CustomEvent that the extension's content script listens for.
   * The content script forwards it to the background which opens the sidepanel
   * and runs single-job automation.
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
        },
      }),
    );
  }, []);

  return { state, applyViaExtension };
}
