"use client";

import { useEffect, useRef, useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { presenceQueries } from "@/modules/presence";
import type { IActiveUser } from "@/modules/presence";
import { useUserQuery } from "@module/user";
import { api } from "@/lib/api/client";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatLastSeen(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffSecs = Math.floor(diffMs / 1_000);
  if (diffSecs < 10) return "just now";
  if (diffSecs < 60) return `${diffSecs}s ago`;
  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) return `${diffMins}m ago`;
  return `${Math.floor(diffMins / 60)}h ago`;
}

/** True if the user sent a heartbeat in the last 60 seconds. */
function isLive(isoDate: string): boolean {
  return Date.now() - new Date(isoDate).getTime() < 60_000;
}

function formatWindowLabel(windowMs: number): string {
  return `last ${Math.round(windowMs / 60_000)} min`;
}

/** Strip leading slash and truncate for display. */
function formatPagePath(path: string | null): string {
  if (!path) return "—";
  const clean = path.replace(/^\//, "") || "home";
  return clean.length > 40 ? `${clean.slice(0, 38)}…` : clean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function ActiveUserRow({
  user,
  onImpersonate,
  isPending,
}: {
  user: IActiveUser;
  onImpersonate: (email: string) => void;
  isPending: boolean;
}) {
  const displayName =
    user.displayName ||
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    "—";

  const live = isLive(user.lastSeenAt);

  return (
    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
      {/* User */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          {user.photoUrl ? (
            <div className="relative shrink-0">
              <img
                src={user.photoUrl}
                alt={displayName}
                className="h-8 w-8 rounded-full object-cover"
              />
              {live && (
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500" />
              )}
            </div>
          ) : (
            <div className="relative shrink-0">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-600">
                {(displayName[0] ?? user.email[0]).toUpperCase()}
              </div>
              {live && (
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500" />
              )}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {displayName}
            </p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        </div>
      </td>

      {/* Current page */}
      <td className="py-3 px-4">
        <span className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2 py-0.5 font-mono text-xs text-gray-600">
          /{formatPagePath(user.pagePath)}
        </span>
      </td>

      {/* Tier */}
      <td className="py-3 px-4 text-xs text-gray-500 capitalize">
        {user.accountTier}
      </td>

      {/* Status */}
      <td className="py-3 px-4 text-xs">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium ${
            user.accountStatus === "active"
              ? "bg-green-50 text-green-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {user.accountStatus}
        </span>
      </td>

      {/* Last seen */}
      <td className="py-3 px-4 text-xs text-gray-500 tabular-nums">
        {formatLastSeen(user.lastSeenAt)}
      </td>

      {/* Action */}
      <td className="py-3 px-4 text-right">
        <button
          onClick={() => onImpersonate(user.email)}
          disabled={isPending}
          className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Impersonate
        </button>
      </td>
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function PresencePageClient() {
  const { data: currentUser } = useUserQuery();
  const router = useRouter();
  const queryClient = useQueryClient();

  // ── Stats ────────────────────────────────────────────────────────────────
  const { data: stats } = useQuery(presenceQueries.stats());

  // ── Active user list (infinite scroll + auto-refetch) ────────────────────
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery(presenceQueries.activeUsersInfinite());

  const allUsers = data?.pages.flatMap((page) => page.data) ?? [];

  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // ── Impersonation ────────────────────────────────────────────────────────
  const [impersonateEmail, setImpersonateEmail] = useState<string | null>(null);
  const [impersonateError, setImpersonateError] = useState<string | null>(null);

  async function handleImpersonate(email: string) {
    setImpersonateError(null);
    setImpersonateEmail(email);
    try {
      await api.post("/auth/admin/impersonate", { email });
      await queryClient.resetQueries();
      router.push("/dashboard");
    } catch (err: unknown) {
      setImpersonateError(
        err instanceof Error ? err.message : "Impersonation failed",
      );
    } finally {
      setImpersonateEmail(null);
    }
  }

  // ── Live countdown label (re-renders every 10 s) ─────────────────────────
  const [, forceRender] = useState(0);
  useEffect(() => {
    const id = setInterval(() => forceRender((n) => n + 1), 10_000);
    return () => clearInterval(id);
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl space-y-6">

        {/* ── Header ───────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <Link
                href="/admin"
                className="hover:text-gray-700 transition-colors"
              >
                Admin
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Active Users</span>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
              </span>
              Active Users
            </h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Users who sent a heartbeat in the{" "}
              {stats ? formatWindowLabel(stats.windowMs) : "last 5 min"} ·
              refreshes every 30 s
            </p>
          </div>

          <div className="text-right">
            <p className="text-3xl font-bold text-gray-900 tabular-nums">
              {stats?.activeCount ?? "—"}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              currently active
            </p>
          </div>
        </div>

        {/* ── Error banner ─────────────────────────────────────────────── */}
        {impersonateError && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {impersonateError}
          </div>
        )}

        {/* ── Table ────────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h2 className="text-base font-semibold text-gray-900">
              Live Sessions
            </h2>
            <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
              {allUsers.length} loaded
            </span>
          </div>

          {isLoading ? (
            <div className="py-16 text-center text-sm text-gray-400">
              Loading active sessions…
            </div>
          ) : allUsers.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm font-medium text-gray-500">
                No active sessions right now
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Users will appear here once they send a heartbeat
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="py-3 px-4 text-xs font-medium uppercase tracking-wide text-gray-400">
                      User
                    </th>
                    <th className="py-3 px-4 text-xs font-medium uppercase tracking-wide text-gray-400">
                      Current Page
                    </th>
                    <th className="py-3 px-4 text-xs font-medium uppercase tracking-wide text-gray-400">
                      Tier
                    </th>
                    <th className="py-3 px-4 text-xs font-medium uppercase tracking-wide text-gray-400">
                      Status
                    </th>
                    <th className="py-3 px-4 text-xs font-medium uppercase tracking-wide text-gray-400">
                      Last Seen
                    </th>
                    <th className="py-3 px-4" />
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map((user) => (
                    <ActiveUserRow
                      key={user.userId}
                      user={user}
                      onImpersonate={handleImpersonate}
                      isPending={impersonateEmail === user.email}
                    />
                  ))}
                </tbody>
              </table>

              {/* Sentinel */}
              <div ref={sentinelRef} className="h-1" />

              {isFetchingNextPage && (
                <div className="py-4 text-center text-sm text-gray-400">
                  Loading more…
                </div>
              )}

              {!hasNextPage && allUsers.length > 0 && (
                <div className="py-4 text-center text-xs text-gray-300">
                  All active sessions loaded
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer note ──────────────────────────────────────────────── */}
        <p className="text-center text-xs text-gray-300">
          Signed in as{" "}
          <span className="font-medium text-gray-400">{currentUser?.email}</span>
        </p>
      </div>
    </main>
  );
}
