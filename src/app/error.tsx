"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useLogoutMutation } from "@/modules/auth";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const logout = useLogoutMutation();

  useEffect(() => {
    console.group(`[Error Boundary] ${error?.name ?? "Error"}: ${error?.message}`);
    console.error(error);
    if (error?.stack) console.error("Stack trace:\n" + error.stack);
    if (error?.digest) console.error("Digest:", error.digest);
    console.groupEnd();
  }, [error]);

  const handleLogout = async () => {
    await logout.mutateAsync();
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center font-poppins">
      <div className="bg-white shadow-2xl rounded-lg p-8 sm:p-16 max-w-md w-full space-y-6 text-center">
        <img src="/cverai-logo.png" className="w-28 h-8 mx-auto" alt="Logo" />

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">
            Something went wrong
          </h1>
          <p className="text-gray-500 text-sm">
            {error?.message || "An unexpected error occurred."}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            onClick={reset}
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
          >
            Try again
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="w-full h-11"
          >
            Reload page
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="w-full h-11"
          >
            Go to home
          </Button>
          <Button
            variant="destructive"
            onClick={handleLogout}
            disabled={logout.isPending}
            className="w-full h-11"
          >
            {logout.isPending ? "Logging out..." : "Logout"}
          </Button>
        </div>
      </div>
    </div>
  );
}
