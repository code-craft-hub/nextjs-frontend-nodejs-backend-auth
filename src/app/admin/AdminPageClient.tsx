"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import { useUserQuery } from "@module/user";
import { userQueries } from "@module/user/queries/user.queryOptions";
import { presenceQueries } from "@/modules/presence";
import { api } from "@/lib/api/client";
import { userApi } from "@module/user";
import type { IRecentUser, IUserLookup } from "@module/user";
import { UserMenu } from "@/components/UserMenu";
import { ArrowLeft } from "lucide-react";

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

/** Minimal email shape check — must have text, @, and a domain segment. */
function isLikelyEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
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

/** Inline preview shown below the email input after a successful lookup. */
function UserLookupPreview({
  user,
  onImpersonate,
}: {
  user: IUserLookup;
  onImpersonate: (email: string) => void;
}) {
  const displayName = user.displayName || user.email;
  const initial = (user.firstName?.[0] ?? user.email[0]).toUpperCase();

  return (
    <div className="mt-3 flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3">
      <div className="flex items-center gap-3">
        {user.photoUrl ? (
          <img
            src={user.photoUrl}
            alt={displayName}
            className="h-9 w-9 rounded-full object-cover"
          />
        ) : (
          <div className="h-9 w-9 rounded-full bg-green-200 flex items-center justify-center text-sm font-semibold text-green-700">
            {initial}
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-gray-900">{displayName}</p>
          <p className="text-xs text-gray-500">{user.email}</p>
          <div className="mt-0.5 flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium ${
                user.accountStatus === "active"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {user.accountStatus}
            </span>
            <span className="text-xs capitalize text-gray-400">
              {user.accountTier}
            </span>
            {!user.emailVerified && (
              <span className="text-xs text-amber-600">unverified</span>
            )}
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onImpersonate(user.email)}
        className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 transition-colors"
      >
        Log in as user
      </button>
    </div>
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
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQuery(userQueries.adminRecentSignupsInfinite());

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

  // Email lookup state
  const [lookupUser, setLookupUser] = useState<IUserLookup | null>(null);
  const [lookupNotFound, setLookupNotFound] = useState(false);
  const [isLooking, setIsLooking] = useState(false);
  const lookupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced lookup — fires 600 ms after the user stops typing a valid email.
  useEffect(() => {
    setLookupUser(null);
    setLookupNotFound(false);
    if (lookupTimerRef.current) clearTimeout(lookupTimerRef.current);

    if (!isLikelyEmail(email)) {
      setIsLooking(false);
      return;
    }

    setIsLooking(true);
    lookupTimerRef.current = setTimeout(async () => {
      try {
        const result = await userApi.lookupByEmail(email.trim());
        setLookupUser(result.found ? result.user : null);
        setLookupNotFound(!result.found);
      } catch {
        setLookupNotFound(false);
      } finally {
        setIsLooking(false);
      }
    }, 600);

    return () => {
      if (lookupTimerRef.current) clearTimeout(lookupTimerRef.current);
    };
  }, [email]);

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
    <section>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 bg-white/70 sticky top-0 z-30 border-b backdrop-blur-3xl">
        <div className="flex items-center justify-between ml-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Admin Dashboard
            </h1>
          </div>
        </div>
        <div className="ml-auto">
          <UserMenu />
        </div>
      </header>
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* ── Header ───────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between">
            <div>
              <p className="mt-0.5 text-sm flex gap-2 text-gray-500">
                <ArrowLeft
                  className="size-4 cursor-pointer text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => {
                    router.push("/dashboard/home");
                  }}
                />{" "}
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
              <div className="relative flex-1">
                <input
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 pr-8"
                />
                {/* Inline spinner while querying the database */}
                {isLooking && (
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2">
                    <svg
                      className="h-4 w-4 animate-spin text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                  </span>
                )}
              </div>
              {/* Submit button only shown when no user preview card is rendered */}
              {!lookupUser && (
                <button
                  type="submit"
                  disabled={isPending || !email}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPending ? "Logging in…" : "Log in as user"}
                </button>
              )}
            </form>

            {/* Not found */}
            {lookupNotFound && !isLooking && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                No account found for{" "}
                <span className="font-medium">{email}</span>.
              </p>
            )}

            {/* Found — show user card with impersonate button */}
            {lookupUser && !isLooking && (
              <UserLookupPreview
                user={lookupUser}
                onImpersonate={handleImpersonate}
              />
            )}

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
    </section>
  );
}
