"use client";

import { useState } from "react";
import { Puzzle, X } from "lucide-react";

// Update this URL once the extension is published to the Chrome Web Store.
const CWS_URL =
  "https://chrome.google.com/webstore/detail/cverai-auto-apply/EXTENSION_ID_PLACEHOLDER";

/**
 * Shown on Chromium desktop browsers where the extension is not installed.
 * Dismissible for the current session (no persistence needed).
 */
export function ExtensionInstallBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-indigo-50 border border-indigo-100 rounded-2xl text-sm">
      <Puzzle className="size-4 text-indigo-600 shrink-0" />

      <p className="flex-1 text-indigo-800 text-sm leading-snug">
        <span className="font-semibold">Apply faster with the CverAI Extension.</span>{" "}
        Install our free Chrome extension to automate applications directly from
        your browser — no cloud bot required.
      </p>

      <a
        href={CWS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap"
      >
        Install Free →
      </a>

      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="shrink-0 text-indigo-300 hover:text-indigo-500 transition-colors"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
