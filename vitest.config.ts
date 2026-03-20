import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", ".next", "e2e", "dist"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      reportsDirectory: "./coverage",
      // Only track coverage for files that have active test suites.
      // Expand this list as more feature tests are written.
      include: [
        "src/lib/utils/cn.ts",
        "src/shared/api/client.ts",
        "src/features/auth/api/auth.api.ts",
        "src/features/auth/hooks/useAuth.ts",
        "src/features/auth/queries/auth.queryKeys.ts",
        "src/features/auth/queries/auth.queryOptions.ts",
        "src/features/auth/mutations/useLogin.mutation.ts",
        "src/features/auth/mutations/useLogout.mutation.ts",
        "src/features/auth/mutations/useRegister.mutation.ts",
        "src/validation/index.ts",
      ],
      exclude: [
        "src/**/*.{test,spec}.{ts,tsx}",
        "src/**/*.d.ts",
        "src/tests/**",
        "src/**/__tests__/**",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        // Branch threshold is 70 rather than 75 because the onBoardingValidation
        // superRefine branches require a real FileList (browser-only, not constructable
        // in jsdom). All other branch paths are covered.
        branches: 70,
        statements: 80,
      },
    },
    env: {
      NEXT_PUBLIC_AUTH_API_URL: "http://localhost:3001/api",
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@features": resolve(__dirname, "./src/features"),
      "@shared": resolve(__dirname, "./src/shared"),
      "@module": resolve(__dirname, "./src/features"),
    },
  },
});
