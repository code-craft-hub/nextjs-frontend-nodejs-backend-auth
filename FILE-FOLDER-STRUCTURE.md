src/
├── app/                              # Next.js App Router — routing ONLY, no business logic
│   ├── (auth)/                       # Route group — unauthenticated pages
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (landing-page)/               # Route group — public marketing pages
│   │   ├── page.tsx
│   │   ├── LandingPageClient.tsx
│   │   └── components/
│   ├── (dashboard)/                  # Route group — authenticated app pages
│   │   ├── dashboard/
│   │   │   ├── home/
│   │   │   ├── jobs/
│   │   │   ├── analytics/
│   │   │   ├── auto-apply/
│   │   │   ├── tailor-resume/
│   │   │   ├── tailor-cover-letter/
│   │   │   ├── tailor-interview-question/
│   │   │   ├── settings/
│   │   │   ├── account/
│   │   │   ├── preview/
│   │   │   └── layout.tsx
│   │   └── resumes/
│   ├── (onboarding)/
│   │   └── onboarding/
│   ├── api/                          # Next.js API routes (edge/server)
│   │   ├── geolocation/
│   │   ├── gmail/
│   │   ├── sentry-example-api/
│   │   └── v1/
│   ├── blog/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── reset-password/
│   ├── verify-email/
│   ├── policy/
│   ├── terms/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
│
├── features/                         # Vertical feature slices — each owns its full stack
│   │                                 # Rule: features import only from shared/, never from each other
│   │
│   ├── auth/                         # Authentication & session management
│   │   ├── api/
│   │   │   ├── auth.api.ts           # Core auth API (login, register, session)
│   │   │   ├── auth-lib.api.ts       # Additional auth utilities
│   │   │   └── auth.api.types.ts
│   │   ├── components/               # Auth UI (LoginForm, RegisterForm, GoogleButton)
│   │   ├── hooks/
│   │   │   └── useAuth.ts            # Composed auth hook
│   │   ├── mutations/
│   │   │   ├── useLogin.mutation.ts
│   │   │   ├── useRegister.mutation.ts
│   │   │   ├── useLogout.mutation.ts
│   │   │   ├── useChangePassword.mutation.ts
│   │   │   ├── useDeleteAccount.mutation.ts
│   │   │   ├── useRefreshToken.mutation.ts
│   │   │   └── auth-lib.mutations.ts
│   │   ├── queries/
│   │   │   ├── auth.queryKeys.ts
│   │   │   ├── auth.queryOptions.ts
│   │   │   ├── auth-lib.queries.ts
│   │   │   └── useSession.query.ts
│   │   └── index.ts                  # Public API barrel export
│   │
│   ├── user/                         # User profile & account management
│   │   ├── api/
│   │   │   ├── user.api.ts
│   │   │   ├── user.api.types.ts
│   │   │   └── onboarding.api.ts
│   │   ├── actions/                  # Server actions
│   │   ├── components/
│   │   │   ├── profile-form/
│   │   │   ├── avatar-uploader/
│   │   │   ├── user-card/
│   │   │   └── danger-zone/
│   │   ├── hooks/
│   │   │   ├── useUser.ts
│   │   │   ├── useUserPermissions.ts
│   │   │   └── useIsProfileComplete.ts
│   │   ├── mutations/
│   │   ├── queries/
│   │   ├── schemas/
│   │   ├── types/
│   │   ├── utils/
│   │   └── index.ts
│   │
│   ├── jobs/                         # Job search & application
│   │   ├── api/
│   │   │   └── jobs.api.ts
│   │   ├── hooks/
│   │   │   ├── useApplyJob.ts
│   │   │   └── usePrefetchJob.ts
│   │   ├── mutations/
│   │   │   ├── jobs.mutations.ts
│   │   │   └── job-posts.mutations.ts
│   │   ├── queries/
│   │   │   └── jobs.queries.ts
│   │   ├── utils/
│   │   └── index.ts
│   │
│   ├── job-posts/                    # Infinite-scroll job listings (modular)
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── mutations/
│   │   ├── queries/
│   │   ├── types/
│   │   └── index.ts
│   │
│   ├── resume/                       # Resume builder & management
│   │   ├── api/
│   │   │   └── resume.api.ts
│   │   ├── hooks/
│   │   │   ├── useDefaultResumeGuard.ts
│   │   │   ├── stream-resume-hook.ts
│   │   │   ├── resume-sse.ts
│   │   │   ├── use-resume-data.ts
│   │   │   └── useResumeUploadWithProgress.tsx
│   │   ├── mutations/
│   │   │   └── resume.mutations.ts
│   │   ├── queries/
│   │   │   └── resume.queries.ts
│   │   └── index.ts
│   │
│   ├── cover-letter/                 # AI cover letter generation
│   │   ├── api/
│   │   │   ├── cover-letter.api.ts
│   │   │   └── cover-letter.service.ts
│   │   ├── hooks/
│   │   │   └── useCoverLetterGenerator.ts
│   │   ├── mutations/
│   │   │   └── cover-letter.mutations.ts
│   │   ├── queries/
│   │   │   └── cover-letter.queries.ts
│   │   └── index.ts
│   │
│   ├── interview/                    # AI interview question preparation
│   │   ├── api/
│   │   │   └── interview.api.ts
│   │   ├── mutations/
│   │   │   └── interview.mutations.ts
│   │   ├── queries/
│   │   │   └── interview.queries.ts
│   │   └── index.ts
│   │
│   ├── auto-apply/                   # Automated job application rules
│   │   ├── api/
│   │   │   └── auto-apply.api.ts
│   │   ├── mutations/
│   │   │   └── auto-apply.mutations.ts
│   │   ├── queries/
│   │   │   ├── auto-apply.keys.ts
│   │   │   └── auto-apply.queries.ts
│   │   └── index.ts
│   │
│   ├── ai-apply/                     # AI-powered job application filling
│   │   ├── api/
│   │   │   └── ai-apply.api.ts
│   │   ├── queries/
│   │   │   └── ai-apply.queries.ts
│   │   └── index.ts
│   │
│   ├── ai-settings/                  # AI configuration preferences
│   │   ├── api/
│   │   │   └── ai-settings.api.ts
│   │   ├── mutations/
│   │   │   └── ai-settings.mutations.ts
│   │   ├── queries/
│   │   │   ├── ai-settings.keys.ts
│   │   │   └── ai-settings.queries.ts
│   │   └── index.ts
│   │
│   ├── analytics/                    # Job application tracking & analytics
│   │   ├── api/
│   │   │   ├── job-applications.api.ts
│   │   │   └── user-activity.api.ts
│   │   ├── mutations/
│   │   │   ├── job-applications.mutations.ts
│   │   │   └── job-applications.mutation-options.ts
│   │   ├── queries/
│   │   │   ├── job-applications.keys.ts
│   │   │   └── application-history.queries.ts
│   │   └── index.ts
│   │
│   ├── bookmarks/                    # Saved/bookmarked jobs
│   │   ├── api/
│   │   │   └── bookmarks.api.ts
│   │   ├── mutations/
│   │   │   └── bookmarks.mutations.ts
│   │   ├── queries/
│   │   │   ├── bookmarks.keys.ts
│   │   │   └── bookmarks.queries.ts
│   │   └── index.ts
│   │
│   ├── recommendations/              # AI job recommendations
│   │   ├── api/
│   │   │   └── recommendations.api.ts
│   │   ├── mutations/
│   │   │   └── recommendations.mutations.ts
│   │   ├── queries/
│   │   │   └── recommendations.queries.ts
│   │   └── index.ts
│   │
│   ├── onboarding/                   # New user onboarding flow
│   │   ├── api/
│   │   │   └── onboarding.api.ts
│   │   ├── mutations/
│   │   │   └── onboarding.mutations.ts
│   │   └── index.ts
│   │
│   ├── profile/                      # User profile & preferences
│   │   ├── api/
│   │   │   └── profile.api.ts
│   │   ├── mutations/
│   │   │   └── profile.mutations.ts
│   │   └── index.ts
│   │
│   ├── email-application/            # Gmail integration & email applications
│   │   ├── api/
│   │   │   ├── email-application.api.ts
│   │   │   ├── gmail.api.ts
│   │   │   └── gmail-authorization.service.ts
│   │   ├── components/
│   │   │   └── preview/GmailCompose.tsx
│   │   ├── hooks/
│   │   │   └── AuthorizeGoogle.tsx
│   │   ├── mutations/
│   │   ├── queries/
│   │   └── index.ts
│   │
│   ├── presence/                     # Real-time user presence tracking
│   │   ├── api/
│   │   ├── hooks/
│   │   │   └── useHeartbeat.ts
│   │   ├── queries/
│   │   └── index.ts
│   │
│   └── blog/                         # Blog articles & content
│       ├── api/
│       │   └── blog.api.ts
│       ├── components/
│       │   ├── BlogListClient.tsx
│       │   ├── BlogDetailClient.tsx
│       │   ├── BlogSearchForm.tsx
│       │   └── homeComponents/BlogCard.tsx
│       ├── hooks/
│       │   └── useBlogMetrics.ts
│       ├── mutations/
│       │   └── blog.mutations.ts
│       ├── queries/
│       │   └── blog.queries.ts
│       └── index.ts
│
├── shared/                           # Cross-feature shared code (no feature-specific logic)
│   ├── api/                          # HTTP client & server utilities
│   │   ├── client.ts                 # Axios instance with auth interceptors
│   │   ├── server.api.ts             # Server-side API helpers
│   │   ├── user.server.api.ts        # Server-side user API
│   │   └── user.server.queries.ts    # Server-side query helpers
│   │
│   ├── components/                   # Reusable UI components
│   │   ├── DataTable.tsx
│   │   ├── DisplayTable.tsx
│   │   ├── JobCard.tsx
│   │   ├── SearchBox.tsx
│   │   └── column.tsx
│   │
│   ├── constants/                    # App-wide constants
│   │   └── data.tsx
│   │
│   ├── hooks/                        # Generic reusable hooks
│   │   ├── use-mobile.ts
│   │   ├── use-mobile.tsx
│   │   ├── useMobileSidebar.ts
│   │   ├── useOnlineStatus.ts
│   │   ├── use-auto-resize-textarea.ts
│   │   ├── use-confirm.tsx
│   │   ├── useUserLocation.ts
│   │   ├── useStreamingContent.ts
│   │   └── useCreditAuthorization.tsx
│   │
│   ├── providers/                    # React context providers
│   │   ├── query-provider.tsx        # TanStack Query + Google OAuth + Analytics
│   │   ├── google-provider.tsx       # Google OAuth
│   │   ├── theme-provider.tsx        # Dark/light mode
│   │   └── ip-geolocation.provider.ts
│   │
│   ├── query/                        # TanStack Query utilities
│   │   ├── keys.ts                   # Global query key factory
│   │   ├── normalize-filters.ts
│   │   ├── parallel-prefetch.ts
│   │   ├── prefetch.ts
│   │   └── query-invalidation.ts
│   │
│   ├── react-query/                  # React Query prefetch helpers
│   │   ├── hooks/
│   │   └── prefetch/
│   │
│   ├── stores/                       # Zustand global stores
│   │   └── useConfetti-store.ts
│   │
│   └── types/                        # Global TypeScript types
│       ├── index.ts
│       ├── auth.ts
│       ├── user.type.ts
│       ├── resume.types.ts
│       ├── lib.types.ts
│       ├── jobs.types.ts
│       ├── paystack-inline-js.d.ts
│       └── react-country-state-city.d.ts
│
├── components/                       # Design system & layout components
│   ├── ui/                           # shadcn/ui primitives (do not move — shadcn convention)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── app-sidebar.tsx               # Main dashboard sidebar
│   ├── UserMenu.tsx                  # User profile menu
│   ├── landing-page/                 # Landing page sections
│   ├── jobs/                         # Job-related UI components
│   ├── icons/                        # Custom SVG icons
│   ├── shared/                       # Shared utility components (ConfettiUI, Modals)
│   └── email-templates/
│
├── lib/                              # External library configurations & shared utilities
│   ├── utils/                        # Utility functions (cn, helpers, etc.)
│   │   ├── cn.ts
│   │   ├── helpers.ts
│   │   ├── constants.ts
│   │   ├── debounce.ts
│   │   └── index.ts
│   ├── schema-validations/           # Zod validation schemas
│   ├── auth.utils.ts                 # Auth utility functions
│   ├── server-auth.ts                # Server-side auth helpers
│   ├── analytics.ts                  # Analytics integration
│   ├── email.tsx                     # Email utilities
│   └── verification-codes.ts
│
├── config/                           # App configuration
│   └── env.ts                        # Environment variables
│
├── validation/                       # Cross-feature Zod schemas
│   └── index.ts
│
├── instrumentation.ts                # Next.js instrumentation (Sentry)
├── instrumentation-client.ts         # Client-side instrumentation
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts (or postcss.config.mjs for Tailwind v4)
├── components.json                   # shadcn/ui configuration
└── package.json

# Architecture Notes
#
# Feature Slice Design (FSD):
# - Each feature owns its full vertical slice: api → queries → mutations → components → hooks
# - Features export a public API via index.ts — consumers never import internal files
# - Features never import from other features (use shared/ for cross-cutting concerns)
#
# Import Rules (enforced by tsconfig paths):
# - @features/*  → src/features/*
# - @shared/*    → src/shared/*
# - @/*          → src/*           (general - use sparingly inside features)
# - @module/*    → src/features/*  (legacy alias — deprecated, use @features/)
#
# Naming Conventions:
# - Directories: kebab-case, always plural (components/, hooks/, mutations/, queries/)
# - Files: camelCase for hooks/utils, PascalCase for components
# - Mutations: useXxx.mutation.ts
# - Queries: useXxx.query.ts or xxx.queries.ts
# - API: xxx.api.ts
# - Keys: xxx.queryKeys.ts or xxx.keys.ts
