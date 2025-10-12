src/
├── app/                          # Next.js 13+ App Router
│   ├── (auth)/                   # Route group - auth pages
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/              # Route group - authenticated pages
│   │   ├── resumes/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx
│   │   │   │   └── edit/
│   │   │   │       └── page.tsx
│   │   │   └── new/
│   │   │       └── page.tsx
│   │   ├── cover-letters/
│   │   │   └── page.tsx
│   │   ├── interviews/
│   │   │   └── page.tsx
│   │   ├── auto-apply/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (marketing)/              # Route group - public pages
│   │   ├── blog/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   └── layout.tsx
│   ├── api/                      # API routes
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   ├── resumes/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── cover-letters/
│   │   │   └── route.ts
│   │   ├── interviews/
│   │   │   └── route.ts
│   │   ├── auto-apply/
│   │   │   └── route.ts
│   │   ├── ai/
│   │   │   └── route.ts
│   │   └── webhooks/
│   │       └── route.ts
│   ├── layout.tsx
│   ├── page.tsx
│   └── error.tsx
│
├── features/                     # Feature modules
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── useSession.ts
│   │   ├── services/
│   │   │   └── authService.ts
│   │   ├── stores/
│   │   │   └── authStore.ts
│   │   ├── types/
│   │   │   └── auth.types.ts
│   │   ├── utils/
│   │   │   └── validation.ts
│   │   └── index.ts
│   ├── resume/
│   │   ├── components/
│   │   │   ├── ResumeBuilder/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── ResumeEditor.tsx
│   │   │   │   ├── ResumePreview.tsx
│   │   │   │   └── ResumeTemplates.tsx
│   │   │   ├── ResumeList.tsx
│   │   │   └── ResumeCard.tsx
│   │   ├── hooks/
│   │   │   ├── useResume.ts
│   │   │   ├── useResumeBuilder.ts
│   │   │   └── useResumeTemplates.ts
│   │   ├── services/
│   │   │   ├── resumeService.ts
│   │   │   └── resumeApi.ts
│   │   ├── stores/
│   │   │   └── resumeStore.ts
│   │   ├── types/
│   │   │   └── resume.types.ts
│   │   ├── utils/
│   │   │   ├── resumeParser.ts
│   │   │   └── resumeValidator.ts
│   │   └── index.ts
│   ├── cover-letter/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── index.ts
│   ├── interview/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── index.ts
│   ├── auto-apply/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── index.ts
│   ├── blog/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── index.ts
│   ├── email/
│   │   ├── templates/
│   │   │   ├── WelcomeEmail.tsx
│   │   │   └── ResumeReadyEmail.tsx
│   │   ├── services/
│   │   │   └── emailService.ts
│   │   └── index.ts
│   ├── ai/
│   │   ├── services/
│   │   │   ├── openaiService.ts
│   │   │   ├── anthropicService.ts
│   │   │   └── aiOrchestrator.ts
│   │   ├── types/
│   │   │   └── ai.types.ts
│   │   ├── utils/
│   │   │   └── promptEngineering.ts
│   │   └── index.ts
│   └── pdf/
│       ├── services/
│       │   └── pdfService.ts
│       ├── templates/
│       │   └── resumeTemplate.ts
│       └── index.ts
│
├── shared/                       # Shared across features
│   ├── components/
│   │   ├── ui/                   # Shadcn/UI components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── DashboardLayout.tsx
│   │   └── common/
│   │       ├── LoadingSpinner.tsx
│   │       ├── ErrorBoundary.tsx
│   │       └── SEO.tsx
│   ├── hooks/
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   └── useMediaQuery.ts
│   ├── utils/
│   │   ├── api.ts
│   │   ├── date.ts
│   │   ├── format.ts
│   │   └── cn.ts
│   ├── constants/
│   │   ├── routes.ts
│   │   ├── config.ts
│   │   └── messages.ts
│   └── types/
│       ├── global.types.ts
│       └── api.types.ts
│
├── lib/                          # External libraries config
│   ├── auth.ts                   # NextAuth config
│   ├── db.ts                     # Database client
│   ├── redis.ts                  # Redis client
│   ├── storage.ts                # S3/Cloud storage
│   └── middleware.ts
│
├── config/                       # App configuration
│   ├── env.ts                    # Environment variables
│   ├── site.ts                   # Site metadata
│   └── navigation.ts
│
├── server/                       # Server-only code
│   ├── actions/                  # Server actions
│   │   ├── resume.actions.ts
│   │   ├── auth.actions.ts
│   │   └── ...
│   ├── services/
│   │   ├── userService.ts
│   │   └── ...
│   └── db/
│       ├── schema/
│       │   ├── users.ts
│       │   ├── resumes.ts
│       │   └── ...
│       ├── migrations/
│       └── seed.ts
│
├── types/                        # Global TypeScript types
│   └── index.d.ts
│
├── styles/
│   └── globals.css
│
├── public/
│   ├── images/
│   ├── fonts/
│   └── ...
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.local
├── .env.example
├── next.config.js
├── tsconfig.json
├── tailwind.config.ts
├── package.json
└── README.md