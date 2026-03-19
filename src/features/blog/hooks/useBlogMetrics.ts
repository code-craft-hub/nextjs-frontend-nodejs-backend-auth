"use client";

/**
 * useBlogMetrics
 *
 * Tracks a comprehensive set of engagement signals for a single blog post:
 *   - Page view + revisit detection (sessionStorage)
 *   - Scroll depth (10 / 25 / 50 / 75 / 90 / 100 %)
 *   - Time on page (reported on unmount)
 *   - Link / interactive element click events
 *
 * All signals are flushed to the backend via POST /api/v1/user-activity/track
 * (fire-and-forget — errors are swallowed so tracking never breaks the UI).
 *
 * Usage:
 *   useBlogMetrics({ blogId, blogTitle, isAuthenticated })
 */

import { useEffect, useRef, useCallback } from "react";
import { userActivityApi } from "@/features/analytics/api/user-activity.api";

interface UseBlogMetricsOptions {
  blogId: string;
  blogTitle: string;
  /** When false the hook records no activity (guest user). */
  isAuthenticated: boolean;
}

const SCROLL_THRESHOLDS = [10, 25, 50, 75, 90, 100];

export function useBlogMetrics({
  blogId,
  blogTitle,
  isAuthenticated,
}: UseBlogMetricsOptions): void {
  const entryTimeRef = useRef<number>(Date.now());
  const maxScrollRef = useRef<number>(0);
  const reachedThresholdsRef = useRef<Set<number>>(new Set());
  const route = `/blog/${blogId}`;

  // ── Revisit detection ──────────────────────────────────────────────────────
  const isRevisit = useCallback((): boolean => {
    try {
      const key = `blog_visited_${blogId}`;
      const visited = sessionStorage.getItem(key);
      sessionStorage.setItem(key, "1");
      return visited === "1";
    } catch {
      return false;
    }
  }, [blogId]);

  // ── Fire activity event ────────────────────────────────────────────────────
  const track = useCallback(
    (
      action: string,
      extra?: Record<string, unknown>,
      durationSeconds?: number,
    ) => {
      if (!isAuthenticated) return;
      userActivityApi.track({
        action,
        page: "blog-detail",
        route,
        component: "BlogDetailClient",
        description: blogTitle,
        durationSeconds,
        metadata: {
          blogId,
          blogTitle,
          ...extra,
        },
      });
    },
    [isAuthenticated, blogId, blogTitle, route],
  );

  // ── Page view + revisit ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return;

    const revisit = isRevisit();
    track(revisit ? "blog_revisit" : "blog_view");

    return () => {
      // Report time spent on unmount
      const durationSeconds = Math.round(
        (Date.now() - entryTimeRef.current) / 1000,
      );
      track(
        "blog_time_spent",
        { maxScrollDepth: maxScrollRef.current },
        durationSeconds,
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blogId, isAuthenticated]);

  // ── Scroll depth tracking ──────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } =
        document.documentElement;
      const scrolled = Math.round(
        (scrollTop / (scrollHeight - clientHeight)) * 100,
      );

      if (scrolled > maxScrollRef.current) {
        maxScrollRef.current = scrolled;
      }

      for (const threshold of SCROLL_THRESHOLDS) {
        if (scrolled >= threshold && !reachedThresholdsRef.current.has(threshold)) {
          reachedThresholdsRef.current.add(threshold);
          track("blog_scroll_depth", { scrollDepth: threshold });
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isAuthenticated, track]);

  // ── Click event tracking (links, buttons, code blocks) ───────────────────
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href") ?? "";
      const isExternal =
        href.startsWith("http") &&
        !href.includes(window.location.hostname);

      track("blog_link_click", {
        href,
        linkText: anchor.textContent?.trim().slice(0, 100),
        isExternal,
      });
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [isAuthenticated, track]);
}
