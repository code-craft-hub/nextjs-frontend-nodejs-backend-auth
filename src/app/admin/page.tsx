"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserQuery } from "@module/user";
import { api } from "@/lib/api/client";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminPage() {
  const { data: user, isLoading } = useUserQuery();
  const router = useRouter();
  const queryClient = useQueryClient();

  console.log("AdminPage user data: ", user);

  const [email, setEmail] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.replace("/dashboard/home");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== "admin") {
    return null;
  }

  async function handleImpersonate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    try {
      await api.post("/auth/admin/impersonate", { email });

      // Clear all cached queries so stale data from the admin session
      // does not bleed through to the impersonated user's view.
      await queryClient.resetQueries();

      router.push("/dashboard");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Impersonation failed";
      setError(message);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-2xl font-semibold text-gray-900">
          Admin — Impersonate User
        </h1>
        <p className="mb-6 text-sm text-gray-500">
          Enter any registered email address to log in as that user. No
          password required.
        </p>

        <form onSubmit={handleImpersonate} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              User email
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending || !email}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Logging in..." : "Log in as user"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          Signed in as{" "}
          <span className="font-medium text-gray-600">{user.email}</span>
        </p>
      </div>
    </main>
  );
}
