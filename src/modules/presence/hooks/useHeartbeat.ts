"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useUserQuery } from "@module/user";
import { presenceApi } from "../api/presence.api";

/** How often the client pings the server (ms). Server active window = 5 min. */
const HEARTBEAT_INTERVAL_MS = 30_000;

/**
 * Fires a silent heartbeat to the presence endpoint every 30 seconds while
 * the user is authenticated, keeping their `lastSeenAt` record fresh.
 *
 * Design decisions:
 * - Fires immediately on mount (captures short sessions that never hit 30 s).
 * - Tracks `pathname` via a ref so the interval closure always reads the
 *   latest route without needing to be recreated on navigation.
 * - Errors are swallowed — a missed heartbeat is non-critical.
 * - Stops entirely when the user is unauthenticated (`user` is falsy).
 *
 * Usage: call inside a component that is always mounted for authenticated
 * users, e.g., the root `<Providers>` wrapper or a dashboard layout.
 */
export function useHeartbeat(): void {
  const { data: user } = useUserQuery();
  const pathname = usePathname();

  // Ref keeps the current pathname without causing the effect to re-run.
  const pathnameRef = useRef<string>(pathname ?? "/");
  useEffect(() => {
    pathnameRef.current = pathname ?? "/";
  }, [pathname]);

  useEffect(() => {
    // Not authenticated — no heartbeat needed.
    if (!user) return;

    const sendBeat = () => {
      presenceApi.heartbeat(pathnameRef.current).catch(() => {
        // Intentionally swallowed — heartbeat failure must never surface to UX.
      });
    };

    // Immediate ping on mount so short sessions are captured.
    sendBeat();

    const intervalId = setInterval(sendBeat, HEARTBEAT_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [user]); // Re-register when auth state changes (login / logout).
}
