"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import { useUserQuery } from "@module/user";
import { userQueries } from "@module/user/queries/user.queryOptions";
import { presenceQueries } from "@/modules/presence";
import { api } from "@/lib/api/client";
import type { IRecentUser } from "@module/user";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatRelativeTime(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return `${Math.floor(diffHrs / 24)}d ago`;
}

function formatWindowLabel(windowMs: number): string {
  const mins = Math.round(windowMs / 60_000);
  return `last ${mins} min`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function RecentUserRow({
  user,
  onImpersonate,
}: {
  user: IRecentUser;
  onImpersonate: (email: string) => void;
}) {
  const displayName =
    user.displayName ||
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    "—";

  return (
    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          {user.photoUrl ? (
            <img
              src={user.photoUrl}
              alt={displayName}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-600">
              {(displayName[0] ?? user.email[0]).toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-gray-900">{displayName}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-4 text-xs text-gray-500">
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
      <td className="py-3 px-4 text-xs text-gray-500 capitalize">
        {user.accountTier}
      </td>
      <td className="py-3 px-4 text-xs text-gray-500">
        {formatRelativeTime(user.createdAt)}
      </td>
      <td className="py-3 px-4 text-right">
        <button
          onClick={() => onImpersonate(user.email)}
          className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
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

export default function AdminPageClient() {
  const { data: currentUser } = useUserQuery();
  const router = useRouter();
  const queryClient = useQueryClient();

  // ── Active users summary ──────────────────────────────────────────────────
  const { data: presenceStats } = useQuery(presenceQueries.stats());

  // ── All users (infinite scroll) ──────────────────────────────────────────
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery(userQueries.adminRecentSignupsInfinite());

  const allUsers = data?.pages.flatMap((page) => page.data) ?? [];

  // Intersection-observer sentinel for infinite scroll
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

  // ── Impersonation form ───────────────────────────────────────────────────
  const [email, setEmail] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [impersonateError, setImpersonateError] = useState<string | null>(null);

  async function handleImpersonate(targetEmail: string) {
    setImpersonateError(null);
    setIsPending(true);
    setEmail(targetEmail);
    try {
      await api.post("/auth/admin/impersonate", { email: targetEmail });
      await queryClient.resetQueries();
      router.push("/dashboard");
    } catch (err: unknown) {
      setImpersonateError(
        err instanceof Error ? err.message : "Impersonation failed",
      );
    } finally {
      setIsPending(false);
      setEmail("");
    }
  }

  async function handleFormImpersonate(e: React.FormEvent) {
    e.preventDefault();
    await handleImpersonate(email);
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl space-y-6">

        {/* ── Header ───────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Signed in as{" "}
              <span className="font-medium text-gray-700">
                {currentUser?.email}
              </span>
            </p>
          </div>
        </div>

        {/* ── Active Users Card ─────────────────────────────────────────── */}
        <Link
          href="/admin/presence"
          className="block rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:border-green-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Pulsing live indicator */}
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
              </span>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Active Users
                  <span className="ml-1.5 text-xs font-normal text-gray-400">
                    {presenceStats
                      ? formatWindowLabel(presenceStats.windowMs)
                      : "last 5 min"}
                  </span>
                </p>
                <p className="text-3xl font-bold text-gray-900 tabular-nums">
                  {presenceStats?.activeCount ?? "—"}
                </p>
              </div>
            </div>
            <span className="text-sm font-medium text-green-600 group-hover:text-green-700 transition-colors">
              View details →
            </span>
          </div>
        </Link>

        {/* ── Impersonate form ──────────────────────────────────────────── */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-1 text-base font-semibold text-gray-900">
            Impersonate User
          </h2>
          <p className="mb-4 text-sm text-gray-500">
            Enter any registered email to log in as that user. No password
            required.
          </p>

          <form onSubmit={handleFormImpersonate} className="flex gap-3">
            <input
              type="email"
              required
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
            <button
              type="submit"
              disabled={isPending || !email}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? "Logging in…" : "Log in as user"}
            </button>
          </form>

          {impersonateError && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {impersonateError}
            </p>
          )}
        </div>

        {/* ── All users (infinite scroll) ───────────────────────────────── */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h2 className="text-base font-semibold text-gray-900">
              All Users
              <span className="ml-2 text-sm font-normal text-gray-400">
                newest first
              </span>
            </h2>
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
              {allUsers.length} loaded
            </span>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-sm text-gray-400">
              Loading…
            </div>
          ) : allUsers.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">
              No users found.
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
                      Status
                    </th>
                    <th className="py-3 px-4 text-xs font-medium uppercase tracking-wide text-gray-400">
                      Tier
                    </th>
                    <th className="py-3 px-4 text-xs font-medium uppercase tracking-wide text-gray-400">
                      Joined
                    </th>
                    <th className="py-3 px-4" />
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map((user) => (
                    <RecentUserRow
                      key={user.id}
                      user={user}
                      onImpersonate={handleImpersonate}
                    />
                  ))}
                </tbody>
              </table>

              {/* Sentinel — triggers next page when it enters the viewport */}
              <div ref={sentinelRef} className="h-1" />

              {isFetchingNextPage && (
                <div className="py-4 text-center text-sm text-gray-400">
                  Loading more…
                </div>
              )}

              {!hasNextPage && allUsers.length > 0 && (
                <div className="py-4 text-center text-xs text-gray-300">
                  All users loaded
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
