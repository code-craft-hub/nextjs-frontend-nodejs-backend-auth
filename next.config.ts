import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    const rules = [];

    // Dev: proxy API calls to the local backend
    if (process.env.NODE_ENV === "development") {
      rules.push({
        source: "/api/:path*",
        destination: "http://127.0.0.1:8080/api/:path*",
      });
    }

    // PostHog reverse proxy — routes PostHog traffic through our own domain so
    // ad-blockers and privacy extensions cannot block analytics collection.
    // Static assets must be on a separate path to avoid Next.js static file
    // serving intercepting them before the rewrite fires.
    rules.push(
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    );

    return rules;
  },
  // Required so Next.js does not buffer the PostHog ingest response body,
  // which would prevent events from being forwarded correctly.
  skipTrailingSlashRedirect: true,
};

const isDev = process.env.NODE_ENV === "development";

export default isDev
  ? nextConfig
  : withSentryConfig(nextConfig, {
      // For all available options, see:
      // https://www.npmjs.com/package/@sentry/webpack-plugin#options

      org: "cverai",

      project: "cverai-nextjs-frontend",

      // Only print logs for uploading source maps in CI
      silent: !process.env.CI,

      // For all available options, see:
      // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

      // Upload a larger set of source maps for prettier stack traces (increases build time)
      widenClientFileUpload: true,

      // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
      // This can increase your server load as well as your hosting bill.
      // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
      // side errors will fail.
      tunnelRoute: "/monitoring",

      webpack: {
        treeshake: {
          removeDebugLogging: true, // replaces disableLogger
        },
        automaticVercelMonitors: true, // replaces automaticVercelMonitors
      },

      // Automatically tree-shake Sentry logger statements to reduce bundle size
      // disableLogger: true,

      // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
      // See the following for more information:
      // https://docs.sentry.io/product/crons/
      // https://vercel.com/docs/cron-jobs
      // automaticVercelMonitors: true,
    });
