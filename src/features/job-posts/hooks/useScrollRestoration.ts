"use client";

import { useEffect } from "react";

/**
 * Restores the scroll position saved by JobsTable's goToJob() right before
 * navigating into a job's detail page. The sessionStorage entry is keyed by
 * the exact filtered URL (pathname + search) and consumed once, so a fresh
 * visit to the same URL (not via back-navigation) finds nothing to restore.
 *
 * `ready` should be true only once the result list has rendered enough rows
 * to actually reach the saved scroll height (e.g. once the infinite query's
 * first page of cached data is available) — restoring too early scrolls to a
 * height the DOM hasn't grown to yet.
 */
export function useScrollRestoration(ready: boolean) {
  useEffect(() => {
    if (!ready || typeof window === "undefined") return;

    const key = `jobs-scroll:${window.location.pathname}${window.location.search}`;
    const saved = sessionStorage.getItem(key);
    if (saved === null) return;

    sessionStorage.removeItem(key);
    const y = Number(saved);
    if (!Number.isFinite(y)) return;

    // Double rAF: wait for the browser to paint the restored data before
    // scrolling, otherwise we scroll against the previous (shorter) layout.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo({ top: y, behavior: "auto" });
      });
    });
  }, [ready]);
}
