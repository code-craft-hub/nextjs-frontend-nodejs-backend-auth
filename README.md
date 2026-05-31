# Cver AI — Frontend Client

Next.js 16 application for [Cver AI](https://v2.cverai.com), an AI-powered job search platform. This is the `client/` package within the monorepo; the Express backend lives in `server/`.

---

## System Context

```
Browser / Browser Extension
        │
        ▼
  Next.js Frontend (this package)
  ├── /api/* ──────────────────► Express Backend (server/)
  ├── /ingest/* ───────────────► PostHog (reverse proxy)
  └── /monitoring/* ───────────► Sentry tunnel
```

All `/api/*` requests are rewritten to the Express backend — in dev to `http://127.0.0.1:8080`, in prod to `NEXT_PUBLIC_AUTH_API_URL`. This single-origin design exists so the browser extension can reach the backend without cross-origin restrictions. The frontend never holds canonical state; everything authoritative lives in the database.

---

## Quick Start

```bash
# Prerequisites: Node ≥20, pnpm ≥10
pnpm install

# Copy and fill env vars (see Configuration section)
cp production.env .env.local

# Start dev server (backend must already be running on :8080)
pnpm dev
```

The dev server runs on `http://localhost:3000`. TypeScript errors do not block hot-reload but will fail `pnpm build`.

---

## Architecture

### Feature Slice Organization

The codebase uses **vertical feature slices**, not horizontal layers:

```
src/
├── app/                   # Next.js App Router — routing only, no logic
│   ├── (auth)/            # /login, /register (guest-only)
│   ├── (landing-page)/    # / (public marketing)
│   ├── (dashboard)/       # /dashboard/* (authenticated + onboarded)
│   └── onboarding/        # /onboarding (authenticated, not yet onboarded)
│
├── features/              # 27 vertical slices (see Feature Map below)
│   └── <feature>/
│       ├── api/           # HTTP calls (typed, no side effects)
│       ├── queries/       # TanStack Query queryOptions factories
│       ├── mutations/     # useMutation hooks
│       ├── components/    # Feature-local UI
│       ├── hooks/         # Feature-local hooks
│       ├── types/         # Feature-local TypeScript types
│       └── index.ts       # Public barrel export
│
├── shared/                # Cross-feature infrastructure
│   ├── api/client.ts      # HTTP client (see HTTP Client section)
│   ├── providers/         # QueryClient, Google OAuth, analytics
│   ├── stores/            # Zustand global state
│   └── query/             # Parallel prefetch utilities
│
└── components/            # Design system (shadcn/ui + Radix primitives)
```

**Rule**: features never import from each other. Cross-feature coordination flows through `shared/` or React Query cache invalidation.

### HTTP Client (`shared/api/client.ts`)

The HTTP client is zero-dependency (native `fetch`). Key contracts:

- **All requests are credentialed** (`credentials: "include"`) — authentication is cookie-based (httpOnly `access_token` + rotating `refresh_token`), no manual Bearer token threading in components.
- **Token refresh is serialized via mutex** — concurrent 401 responses share a single in-flight refresh request rather than fanning out. This prevents refresh storms under parallel query load.
- **Logout drains without refresh** — when logout is initiated, subsequent 401s are not retried. This avoids a race where the new session's cookies could be silently replaced.
- **Timeouts are per-request** — default 60s via `AbortController`. Pass `timeoutMs: 0` to disable (streaming responses).
- **Error classification** — `APIError` exposes `.isUnauthorized`, `.isForbidden`, `.isValidationError`, `.isServerError` so callers can branch without string-matching on status codes.

### Server-Side Rendering Strategy

Pages are React Server Components that prefetch data and pass it to client islands via React Query's `HydrationBoundary`:

```typescript
// app/(dashboard)/jobs/page.tsx
const queryClient = createServerQueryClient();
await queryClient.prefetchQuery(jobsQueries.list(token));
return (
  <HydrationBoundary state={dehydrate(queryClient)}>
    <JobsClient />  // "use client" — receives data without waterfall
  </HydrationBoundary>
);
```

Auth guards are enforced in server components via `requireAuth()` / `requireOnboarding()` / `requireEmailVerification()` in `src/lib/server-auth.ts`. There is intentionally no `middleware.ts` — guards run per-page rather than at the edge, trading some latency for simpler token verification logic.

### React Query Defaults

```typescript
staleTime: 5 min      // Don't refetch data that arrived in the last 5 minutes
gcTime:    10 min     // Keep unused cache entries for 10 minutes
retry:     (n, err) => n < 3 && err.status >= 500  // Retry server errors only
refetchOnWindowFocus: false  // Opt-out of background refetches
```

Query key factories (`features/<name>/queries/<name>.queryKeys.ts`) are used everywhere to ensure invalidation is precise and refactors don't silently break cache co-location.

### AI & Streaming

Resume generation streams JSON via SSE. The client uses `@streamparser/json` to incrementally render sections as they arrive rather than waiting for the full response. Callers must pass `timeoutMs: 0` when initiating a streaming fetch.

---

## Feature Map

| Feature | Routes | Notes |
|---|---|---|
| `auth` | `/login`, `/register` | JWT cookie auth, Google OAuth, email verification, password reset |
| `onboarding` | `/onboarding` | Resume upload, profile setup — gates dashboard access |
| `dashboard` | `/dashboard/home` | Central hub, auto-apply status, quick stats |
| `job-posts` | `/dashboard/jobs` | Infinite scroll listings, full-text + filter search |
| `resume` | `/dashboard/tailor-resume` | Upload, build, AI-stream generation, PDF/DOCX export |
| `cover-letter` | `/dashboard/tailor-cover-letter` | AI-generated, job-tailored cover letters |
| `interview` | `/dashboard/tailor-interview-question` | AI question + answer prep |
| `auto-apply` | `/dashboard/auto-apply` | Automation rules, job match criteria, orchestration state |
| `analytics` | `/dashboard/analytics` | Application history, conversion funnel, Recharts visualizations |
| `account` | `/dashboard/account` | Profile, billing (Lemon Squeezy / Paystack / PayPal) |
| `settings` | `/dashboard/settings` | Theme, notifications, AI behavior preferences |
| `ai-settings` | (embedded in settings) | CV strategy, auto-apply rule config |
| `email-application` | (embedded in jobs) | Gmail integration for email-based applications |
| `presence` | (background) | Periodic heartbeat to `/api/v1/presence` for activity tracking |
| `blog` | `/blog` | Strapi CMS content |
| `landing` | `/` | Marketing site — features, pricing, FAQ, testimonials |

---

## Configuration

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_AUTH_API_URL` | Yes | Express backend base URL. Dev: `http://127.0.0.1:8080/api`. Prod: `https://api.cverai.com/api` |
| `NEXT_PUBLIC_APP_URL` | Yes | Frontend origin (used for OG metadata, email links) |
| `JWT_SECRET` | Yes | Must match the backend. Used server-side to verify access tokens without a round-trip |
| `JWT_REFRESH_SECRET` | Yes | Same constraint as `JWT_SECRET` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Yes | Google OAuth app ID |
| `NEXT_PUBLIC_GEMINI_API_KEY` | AI features | Gemini 1.5 API key |
| `NEXT_PUBLIC_POSTHOG_KEY` | Analytics | PostHog project key |
| `NEXT_PUBLIC_POSTHOG_HOST` | Analytics | Default: `https://us.i.posthog.com` |
| `NEXT_PUBLIC_SENTRY_DSN` | Observability | Sentry project DSN |
| `SENTRY_AUTH_TOKEN` | Build (prod) | Sentry source map upload (CI only) |
| `NEXT_PUBLIC_LEMON_SQUEEZY_STORE_ID` | Billing | Lemon Squeezy store ID (`139892`) |
| `NEXT_PUBLIC_LEMON_SQUEEZY_API_KEY` | Billing | Lemon Squeezy JWT |
| `NEXT_PUBLIC_PAYSTACK_AMOUNT` | Billing | Amount in kobo. Must match `PAYSTACK_AMOUNT_KOBO` on the server |
| `NEXT_PUBLIC_STRAPI_BASEURL` | Blog | Strapi CMS API URL |
| `NEXT_PUBLIC_STRAPI_AUTH_TOKEN` | Blog | Strapi read token |

> **Security note**: `JWT_SECRET` and `JWT_REFRESH_SECRET` are server-side only (no `NEXT_PUBLIC_` prefix) and never sent to the browser. They should be rotated in tandem with the backend.

---

## Testing

```bash
pnpm test              # Vitest unit tests (CI)
pnpm test:watch        # Watch mode
pnpm test:coverage     # Coverage report — 80% line, 70% branch thresholds
pnpm test:e2e          # Playwright end-to-end
pnpm test:e2e:install  # Install Playwright browsers (once)
```

**Unit tests** (`vitest` + `@testing-library/react`, JSDOM environment): component-level and hook-level. MSW intercepts API calls so tests never hit a real backend.

**E2E tests** (`playwright`, `e2e/` directory): full-browser flows against Chromium, Firefox, and WebKit. Require a running dev server.

**What's not tested**: AI streaming responses, PDF rendering, third-party payment widgets. These are validated manually in staging.

---

## Observability

| Signal | Tool | Routing |
|---|---|---|
| Runtime errors | Sentry 10 (client + server + edge) | Tunneled via `/monitoring` |
| Product events | PostHog | Reverse-proxied via `/ingest` |
| Page views | Google Analytics 4 | Direct |
| Chat / support | Crisp | Direct |

Both Sentry and PostHog are routed through the frontend's own domain so ad-blockers and privacy extensions do not suppress them. `widenClientFileUpload: true` in Sentry config uploads more source maps for better stack traces at the cost of slightly longer builds.

PostHog `identify()` is called on every authenticated page load with ~40 user properties including `plan`, `subscription_status`, `credit_balance`, and UTM attribution. These power the funnel dashboards.

---

## Known Issues & Technical Debt

**Active constraints:**

- **No `middleware.ts`** — Auth guards run per-page server component, not at the edge. This means an unauthenticated request for a protected page makes a full RSC render before redirecting. Acceptable today; would need edge middleware if latency SLA tightens.
- **`JWT_SECRET` on the frontend** — The client verifies JWTs locally to avoid a round-trip per page load. This requires the frontend and backend to share the same secret and rotate together. A move to RS256 (asymmetric) would remove this coupling.
- **API version hardcoded** — All requests target `/v1`. There is no abstraction point to route select callers to `/v2`. This will require a grep-and-replace when v2 routes go live.
- **`axios` in `package.json`** — Present as a dependency but the HTTP client has fully migrated to native `fetch`. Safe to remove; blocked by a few legacy imports in older feature files.
- **Zod schemas split across two locations** — Some schemas live in `src/validation/`, others in feature-local `schemas/` directories. No validation is broken; it just means no single grep finds all Zod schemas.
- **`NEXT_PUBLIC_PAYSTACK_AMOUNT` must stay in sync with `PAYSTACK_AMOUNT_KOBO` on the server** — The frontend uses this value for display only; the server is authoritative for charging. Drift causes confusing UX (displayed price ≠ charged price). Consider deriving the display value from a server-returned config endpoint.

---

## Contributing

- **Branch**: `feat/<ticket>` for features, `fix/<ticket>` for bugs.
- **No cross-feature imports**: if feature A needs something from feature B, extract to `shared/` first.
- **Query keys**: use the `*QueryKeys` factory in the feature's `queries/` directory. Do not construct raw arrays inline.
- **Mutations**: invalidate the minimum set of query keys in `onSuccess`. Broad invalidation (`queryClient.invalidateQueries({ queryKey: ['users'] })`) causes unnecessary refetches.
- **TypeScript**: strict mode is enforced. `any` is linted out — use `unknown` + type guards at boundaries.
- **Commits**: run `pnpm type-check && pnpm lint && pnpm test` before pushing. CI will reject failures.
