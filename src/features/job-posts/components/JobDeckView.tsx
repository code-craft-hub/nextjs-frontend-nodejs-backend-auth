"use client";
import JobsAppliedBanner from "./JobsAppliedBanner";
import { useState, useCallback, useEffect, useMemo } from "react";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import type { JobPost } from "@/features/job-posts";
import { Card } from "@/components/ui/card";
import {
  Clock,
  ExternalLink,
  Loader2,
  MapPin,
  UserCircle,
  X,
  Check,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import recommendationsQueries from "@/features/recommendations/queries/recommendations.queries";
import { jobPreferencesQueries } from "@/features/job-preferences/queries/job-preferences.queries";
import { jobPostsQueries } from "@/features/job-posts/queries/job-posts.query";
import type { JobRecommendation } from "@/features/recommendations/api/recommendations.api";
import { coverLetterApi } from "@/features/cover-letter/api/cover-letter.api";
import { resumeApi } from "@/features/resume/api/resume.api";
import { autoApplyApi } from "@/features/auto-apply/api/auto-apply.api";
import { emailApplicationApi } from "@/features/email-application/api/email-application.api";
import { aiSettingsQueries } from "@/features/ai-settings/queries/ai-settings.queries";
import { invalidateEmailApplicationQueries } from "@/features/email-application/queries/email-application.invalidation";
import {
  invalidateResumeQueries,
  invalidateCoverLetterQueries,
  invalidateAIApplyQueries,
} from "@/shared/query/query-invalidation";
import { invalidateUserQueries } from "@features/user";
import { queryKeys } from "@/shared/query/keys";
import type { ActiveRun, RunLogEntry } from "../types/apply-session.types";
import type { ExtensionState } from "../hooks/useExtension";
import { decodeHtml } from "@/lib/utils";
export type ViewType = "deck" | "list";

// const CWS_URL =
//   "https://chrome.google.com/webstore/detail/cverai-auto-apply/EXTENSION_ID_PLACEHOLDER";

interface JobDeckViewProps {
  /** Called when the user swipes/taps Apply on a card. */
  onApply: (job: JobPost) => void;
  /** Called when the user switches between deck and list views. */
  handleViewChange: (value: ViewType) => void;
  runs: Map<string, ActiveRun>;
  onOpenRun: (runId: string) => void;
  onDismissRun: (runId: string) => void;
  extState: ExtensionState;
}

function toJobRow(rec: JobRecommendation): JobPost & {
  matchPercentage?: string;
  recommendationId: string;
  rankPosition: number | null;
} {
  const job = rec.job ?? {};
  return {
    ...(job as JobPost),
    id: job.id ?? rec.id,
    matchPercentage:
      rec.matchScore != null ? String(rec.matchScore) : undefined,
    recommendationId: rec.id,
    rankPosition: rec.rankPosition,
  };
}

function toJobRowFromPost(post: JobPost): JobPost & {
  matchPercentage?: string;
  recommendationId: string;
  rankPosition: null;
} {
  return {
    ...post,
    matchPercentage: undefined,
    recommendationId: post.id,
    rankPosition: null,
  };
}

function GeneratingBanner({ message }: { message?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-5 py-4 text-blue-700">
      <Loader2 className="size-4 shrink-0 animate-spin" />
      <p className="text-sm">
        {message ??
          "Finding the best job matches for you. New recommendations will appear shortly…"}
      </p>
    </div>
  );
}

function IncompleteProfileBanner({
  missingFields,
}: {
  missingFields?: string[];
}) {
  const FIELD_LABELS: Record<string, string> = {
    job_title: "job title",
    skills: "skills",
  };
  const missing = (missingFields ?? [])
    .map((f) => FIELD_LABELS[f] ?? f)
    .join(" and ");
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-orange-100 bg-orange-50 px-6 py-8 text-center text-orange-700">
      <UserCircle className="size-10 opacity-70" />
      <div>
        <p className="font-medium">Complete your profile to get started</p>
        {missing && (
          <p className="mt-1 text-sm text-orange-600">
            Please add your {missing} to receive personalized recommendations.
          </p>
        )}
      </div>
      <Button
        variant="outline"
        size="sm"
        className="border-orange-300 text-orange-700 hover:bg-orange-100"
        onClick={() => (window.location.href = "/dashboard/profile")}
      >
        Complete Profile
      </Button>
    </div>
  );
}

type SwipeDir = "left" | "right" | null;

/**
 * Converts a raw (possibly plain-text) job description into readable HTML.
 * If the text already contains block-level HTML it is returned unchanged.
 * Otherwise it detects "Section header:" patterns and comma-separated action
 * lists and emits <h3> + <ul>/<p> blocks.
 */
function formatJobDescription(raw: string): string {
  if (/<(p|ul|ol|h[1-6]|li|div)\b/i.test(raw)) return raw;

  // Split on "Capitalized phrase:" — these become section headers.
  const parts = raw.split(/\b([A-Z][A-Za-z &/(),''’-]{2,60}:)/);

  const renderBody = (text: string): string => {
    const trimmed = text.trim();
    if (!trimmed) return "";
    // Heuristic: if splitting on ", " (comma + space before lowercase) yields
    // ≥4 short items, treat as a bullet list.
    const items = trimmed
      .split(/,\s+(?=[a-z])/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (items.length >= 4 && items.every((s) => s.length < 140)) {
      return `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
    }
    // Split into individual sentences then group every 2 into a <p> so the
    // reader gets a natural breathing point instead of one solid wall of text.
    const sentences = trimmed
      .split(/(?<=[.!?])\s+(?=[A-Z"'])/)
      .map((s) => s.trim())
      .filter(Boolean);
    const chunks: string[] = [];
    for (let i = 0; i < sentences.length; i += 2) {
      chunks.push(sentences.slice(i, i + 2).join(" "));
    }
    return (chunks.length ? chunks : [trimmed])
      .map((chunk) => `<p>${chunk}</p>`)
      .join("");
  };

  let html = "";
  if (parts[0].trim()) html += renderBody(parts[0]);
  for (let i = 1; i < parts.length - 1; i += 2) {
    html += `<h3>${parts[i]}</h3>`;
    html += renderBody(parts[i + 1] ?? "");
  }
  return html;
}

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diffMs / 3_600_000);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

interface JobDeckCardProps {
  job: JobPost;
  stackIndex: 0 | 1 | 2;
  onSkip: () => void;
  onApply: () => void;
}

function JobDeckCard({ job, stackIndex, onSkip, onApply }: JobDeckCardProps) {
  const [descOpen, setDescOpen] = useState(false);

  const scale = stackIndex === 0 ? 1 : stackIndex === 1 ? 0.96 : 0.92;
  const translateY = stackIndex === 0 ? 0 : stackIndex === 1 ? 12 : 24;
  const opacity = stackIndex === 0 ? 1 : stackIndex === 1 ? 0.85 : 0.7;
  const zIndex = 3 - stackIndex;

  // pointer-events only on the top card so back cards don't intercept clicks
  const pointerEvents = stackIndex === 0 ? "auto" : "none";

  const salaryLabel =
    job.salary ??
    (job.salaryInfo
      ? [
          job.salaryInfo.currency,
          job.salaryInfo.min && job.salaryInfo.max
            ? `${job.salaryInfo.min}–${job.salaryInfo.max}`
            : (job.salaryInfo.min ?? job.salaryInfo.max),
          job.salaryInfo.period ? `/${job.salaryInfo.period}` : "",
        ]
          .filter(Boolean)
          .join("")
      : null);

  const descriptionText =
    job.descriptionText ?? job.companyText ?? "No description available.";
  const preview =
    descriptionText.length > 300
      ? descriptionText.slice(0, 300) + "...."
      : descriptionText;

  return (
    <div
      className="transition-all duration-300"
      style={{
        transform: `scale(${scale}) translateY(${translateY}px)`,
        opacity,
        zIndex,
        pointerEvents,
      }}
    >
      <Card className="relative w-full rounded-[30px] bg-white shadow-xl border-0  gap-2 p-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg capitalize  font-bold font-poppins">
            {decodeHtml(job.title)}
          </h1>

          <div className="hidden sm:flex ml-8 items-center gap-2">
            <div className="flex items-center gap-2 text-[#7a7a7a] font-medium text-sm">
              <Clock className="size-4" strokeWidth={2} />
              <span>{timeAgo(job.postedAt ?? job.createdAt)}</span>
            </div>

            {job.link || job.applyUrl ? (
              <a
                href={job.link ?? job.applyUrl ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink
                  className="size-4 text-[#7a7a7a]"
                  strokeWidth={2}
                />
              </a>
            ) : (
              <ExternalLink className="size-4 text-[#7a7a7a]" strokeWidth={2} />
            )}
          </div>
        </div>

        {/* Pills */}
        <div className=" flex items-center gap-2 flex-wrap">
          {salaryLabel && (
            <div className="rounded-full bg-[#f2f2f2] px-3 py-2 text-2xs font-semibold text-black">
              {salaryLabel}
            </div>
          )}
          {job.location && (
            <div className="rounded-full bg-[#f2f2f2] px-3 py-2 text-2xs font-semibold text-black max-w-64 line-clamp-1 text-nowrap truncate">
              {job.location}
            </div>
          )}
          {job.emailApply ? (
            <div className="rounded-full bg-[#f2f2f2] px-3 py-2 text-2xs font-semibold text-black">
              Email Apply
            </div>
          ) : (
            <div className="rounded-full bg-[#f2f2f2] px-3 py-2 text-2xs font-semibold text-black">
              External Apply
            </div>
          )}
          {job.employmentType && (
            <div className="rounded-full bg-[#f2f2f2] px-3 py-2 text-2xs font-semibold text-black">
              {job.employmentType}
            </div>
          )}
          {job.jobType && !job.employmentType && (
            <div className="rounded-full bg-[#f2f2f2] px-3 py-2 text-2xs font-semibold text-black">
              {job.jobType}
            </div>
          )}
        </div>

        {/* Company */}
        <div className=" flex items-center gap-3 my-2">
          <div className="size-14 rounded-full overflow-hidden bg-gray-200 shrink-0">
            {(job.companyLogo ?? job.companyIcon) ? (
              <img
                src={job.companyLogo ?? job.companyIcon ?? ""}
                alt={job.companyName ?? job.company ?? ""}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-md font-black text-gray-400">
                {(job.companyName ?? job.company ?? "?")[0]}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <div className="text-xl font-semibold text-black leading-none">
              {job.companyName ?? job.company ?? "Unknown Company"}
            </div>

            {job.location && (
              <div className="mt- flex items-center gap-1 text-[#8a8a8a] text-md font-medium">
                <MapPin className="size-3" strokeWidth={2} />
                <span className="text-xs max-w-sm line-clamp-1 text-nowrap truncate">
                  {job.location}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="mb-1">
          <div className="text-[#9a9a9a] text-md font-medium">Description</div>

          <div
            className=" text-[#2b2b2b] text-xs max-w-215 [&_strong]:font-bold [&_br]:block [&_p]:mt-1"
            dangerouslySetInnerHTML={{ __html: decodeHtml(preview) }}
          />

          <button
            className="mt-2 text-xs font-semibold text-[#2f6df6]"
            onClick={(e) => {
              e.stopPropagation();
              setDescOpen(true);
            }}
          >
            See full description
          </button>
        </div>

        {/* Full description modal */}
        <Dialog open={descOpen} onOpenChange={setDescOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold font-poppins capitalize">
                {decodeHtml(job.title)}
              </DialogTitle>
              <p className="text-sm text-[#7a7a7a] font-medium">
                {job.companyName ?? job.company ?? "Unknown Company"}
                {job.location ? ` · ${job.location}` : ""}
              </p>
            </DialogHeader>
            <div className="overflow-y-auto flex-1 pr-1">
              <div
                className="text-[#2b2b2b]
                  [&_h3]:font-semibold [&_h3]:text-sm [&_h3]:text-gray-900 [&_h3]:mt-5 [&_h3]:mb-1.5 [&_h3:first-child]:mt-0
                  [&_p]:text-xs [&_p]:leading-relaxed [&_p]:mt-3 [&_p:first-child]:mt-0
                  [&_ul]:mt-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1
                  [&_li]:text-xs [&_li]:leading-relaxed
                  [&_strong]:font-bold [&_br]:block"
                dangerouslySetInnerHTML={{
                  __html: formatJobDescription(decodeHtml(descriptionText)),
                }}
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* Actions — only interactive on the top card */}
        {stackIndex === 0 && (
          <div className="mt-2 flex items-end justify-between ">
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={onSkip}
                className="size-16 rounded-full bg-white shadow-[0px_18px_40px_rgba(0,0,0,0.12)] flex items-center justify-center active:scale-95 transition-transform"
                aria-label="Skip"
              >
                <X className="size-8 text-[#ef4444]" strokeWidth={3} />
              </button>
              <div className="text-sm font-black text-black">Ignore</div>
            </div>

            <div className="flex flex-col items-center gap-3">
              <button
                onClick={onApply}
                className="size-16 rounded-full bg-white shadow-[0px_18px_40px_rgba(0,0,0,0.12)] flex items-center justify-center active:scale-95 transition-transform"
                aria-label="Auto Apply"
              >
                <Check className="size-8 text-[#22c55e]" strokeWidth={3} />
              </button>
              <div className="text-sm font-black text-black">Auto-Apply</div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export function JobDeckView({
  onApply,
  handleViewChange,
  runs,
  onOpenRun,
  onDismissRun,
  extState,
}: JobDeckViewProps) {
  // ── Preferences — determine which data source to use ────────────────────
  const { data: prefsData } = useQuery(jobPreferencesQueries.detail());
  const prefs = prefsData?.data;

  const hasFilters =
    prefs !== undefined &&
    !!(
      prefs.keywords?.trim() ||
      prefs.employmentTypes?.length ||
      prefs.workArrangements?.length ||
      prefs.preferredLocations?.length
    );

  const searchParams = useMemo(
    () => ({
      q: prefs?.keywords?.trim() || undefined,
      employmentTypes: prefs?.employmentTypes?.length
        ? prefs.employmentTypes.join(",")
        : undefined,
      workArrangements: prefs?.workArrangements?.length
        ? prefs.workArrangements.join(",")
        : undefined,
      preferredLocations: prefs?.preferredLocations?.length
        ? prefs.preferredLocations.join(",")
        : undefined,
    }),
    [prefs],
  );

  // ── Recommendations query (active when no filters) ───────────────────────
  const {
    data: recsData,
    isLoading: recsLoading,
    fetchNextPage: recsFetchNext,
    hasNextPage: recsHasNext,
    isFetchingNextPage: recsFetchingNext,
  } = useInfiniteQuery({
    ...recommendationsQueries.userRecommendations(),
    enabled: !hasFilters,
    initialPageParam: 1,
  });

  // ── Preference job search (active when filters are set) ──────────────────
  const {
    data: searchData,
    isLoading: searchLoading,
    fetchNextPage: searchFetchNext,
    hasNextPage: searchHasNext,
    isFetchingNextPage: searchFetchingNext,
  } = useInfiniteQuery(jobPostsQueries.preferenceSearch(searchParams));

  const { data: settings } = useQuery(aiSettingsQueries.detail());
  const useMasterCv = !!(settings?.useMasterCv && settings?.masterCvId);

  // ── Unified derived state ────────────────────────────────────────────────
  const isLoading = hasFilters ? searchLoading : recsLoading;
  const fetchNextPage = hasFilters ? searchFetchNext : recsFetchNext;
  const hasNextPage = hasFilters ? searchHasNext : recsHasNext;
  const isFetchingNextPage = hasFilters ? searchFetchingNext : recsFetchingNext;

  const lastRecsPage = (recsData?.pages?.[recsData.pages.length - 1] as any)
    ?.data;
  const pipelineStatus = hasFilters ? undefined : lastRecsPage?.status;
  const isGenerating = hasFilters
    ? false
    : (lastRecsPage?.isGenerating ?? false);
  const missingFields = hasFilters ? undefined : lastRecsPage?.missingFields;
  const generatingMessage = hasFilters ? undefined : lastRecsPage?.message;

  const allJobs = useMemo(() => {
    if (hasFilters) {
      return (
        searchData?.pages.flatMap((page) => page.items.map(toJobRowFromPost)) ??
        []
      );
    }
    return (
      recsData?.pages.flatMap((page) =>
        ((page as any)?.data?.recommendations ?? []).map(toJobRow),
      ) ?? []
    );
  }, [hasFilters, searchData, recsData]);

  const queryClient = useQueryClient();

  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set());
  const [swipeDir, setSwipeDir] = useState<SwipeDir>(null);

  // Local tracker for in-progress email apply runs — merged into the bell popover
  const [emailRuns, setEmailRuns] = useState<Map<string, ActiveRun>>(new Map());

  const patchEmailRun = useCallback((id: string, patch: Partial<ActiveRun>) => {
    setEmailRuns((prev) => {
      const next = new Map(prev);
      const existing = next.get(id);
      if (!existing) return prev;
      next.set(id, { ...existing, ...patch });
      return next;
    });
  }, []);

  const removeEmailRun = useCallback((id: string) => {
    setEmailRuns((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const deck = allJobs.filter(
    (j) => !appliedIds.has(j.id) && !skippedIds.has(j.id),
  );

  useEffect(() => {
    if (deck.length < 10 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [deck.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleEmailApply = useCallback(
    (job: JobPost) => {
      const jobDescription =
        (job as any).descriptionText ?? (job as any).companyText ?? "";
      const recruiterEmail = (job as any).emailApply ?? "";
      const jobId = job.id;
      const runId = `email-${job.id}-${Date.now()}`;

      // Register in the bell immediately so the user sees it while it runs
      const log: RunLogEntry[] = [
        {
          t: Date.now(),
          level: "info",
          text: "Generating cover letter and resume…",
        },
      ];
      setEmailRuns((prev) => {
        const next = new Map(prev);
        next.set(runId, {
          id: runId,
          job: {
            id: job.id,
            title: (job as any).title ?? "Job",
            company: (job as any).companyName ?? (job as any).company ?? "",
          },
          status: "running",
          createdAt: Date.now(),
          log,
        });
        return next;
      });

      const run = async () => {
        let coverLetterId: string;
        let resumeId: string;
        let coverLetterTitle = "Auto Apply";

        if (useMasterCv) {
          const clResponse = await coverLetterApi.generateCoverLetterSync({
            jobDescription,
            recruiterEmail,
            jobId,
          });
          coverLetterId = (clResponse as any).data.id;
          coverLetterTitle = (clResponse as any).data.title || coverLetterTitle;
          resumeId = settings!.masterCvId!;
        } else {
          const [clResponse, resumeResponse] = await Promise.all([
            coverLetterApi.generateCoverLetterSync({
              jobDescription,
              recruiterEmail,
              jobId,
            }),
            resumeApi.autoNewResume(jobDescription),
          ]);
          coverLetterId = (clResponse as any).data.id;
          coverLetterTitle = (clResponse as any).data.title || coverLetterTitle;
          resumeId = (resumeResponse as any).data.id;
        }

        patchEmailRun(runId, {
          log: [
            ...log,
            {
              t: Date.now(),
              level: "action",
              text: "Sending email application…",
            },
          ],
        });

        const autoApplyResponse = await autoApplyApi.create({
          id: crypto.randomUUID(),
          resumeId,
          coverLetterId,
          title: coverLetterTitle,
          type: "email",
          recruiterEmail: recruiterEmail || null,
          jobDescription: jobDescription || null,
          status: "draft",
          source: "auto_apply",
        });

        const autoApplyId = (autoApplyResponse as any)?.data?.id;

        await emailApplicationApi.sendApplication({
          autoApplyId,
          coverLetterId,
          resumeId,
          recruiterEmail,
          jobDescription,
          jobId,
        });

        // Mark bell entry as done, then auto-dismiss after 6 s
        patchEmailRun(runId, {
          status: "complete",
          log: [
            ...log,
            {
              t: Date.now(),
              level: "action",
              text: recruiterEmail
                ? `Application sent to ${recruiterEmail}`
                : "Application sent!",
            },
          ],
        });
        setTimeout(() => removeEmailRun(runId), 6000);

        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: queryKeys.recommendations.user(),
          }),
          invalidateEmailApplicationQueries(queryClient),
          invalidateResumeQueries(queryClient),
          invalidateCoverLetterQueries(queryClient),
          invalidateAIApplyQueries(queryClient),
          invalidateUserQueries(queryClient),
        ]);
      };

      toast.promise(
        run().catch((err) => {
          patchEmailRun(runId, {
            status: "error",
            blockedMessage: "Failed to send. Please try again.",
          });
          throw err;
        }),
        {
          loading: "Sending your application…",
          success: recruiterEmail
            ? `Application sent to ${recruiterEmail}`
            : "Application sent!",
          error: "Failed to send application. Please try again.",
        },
      );
    },
    [useMasterCv, settings, queryClient, patchEmailRun, removeEmailRun],
  );

  const handleApply = useCallback(() => {
    const top = deck[0];
    if (!top) return;

    if ((top as any).emailApply) {
      // Email-apply: always allowed, fires in background
      setSwipeDir("right");
      handleEmailApply(top);
      setTimeout(() => {
        setAppliedIds((prev) => new Set([...prev, top.id]));
        setSwipeDir(null);
      }, 360);
      return;
    }

    // External-apply: requires the cverai Chrome extension
    if (extState === "not_capable") {
      toast.info(
        "Auto-apply via browser extension requires Chrome or Edge on desktop.",
      );
      return;
    }
    if (extState !== "installed") {
      toast("Install the cverai extension to auto-apply on external sites.", {
        description:
          "Our bot will fill and submit the application on your behalf — no manual work needed.",
        // action: {
        //   label: "Get extension",
        //   onClick: () => window.open(CWS_URL, "_blank"),
        // },
        // duration: 8000,
      });
      // return;
    }

    setSwipeDir("right");
    onApply(top);
    setTimeout(() => {
      setAppliedIds((prev) => new Set([...prev, top.id]));
      setSwipeDir(null);
    }, 360);
  }, [deck, onApply, handleEmailApply, extState]);

  const handleSkip = useCallback(() => {
    const top = deck[0];
    if (!top) return;
    setSwipeDir("left");
    setTimeout(() => {
      setSkippedIds((prev) => new Set([...prev, top.id]));
      setSwipeDir(null);
    }, 360);
  }, [deck]);

  const handleReset = useCallback(() => {
    setAppliedIds(new Set());
    setSkippedIds(new Set());
    setSwipeDir(null);
  }, []);

  const handleOpenRun = useCallback(
    (runId: string) => {
      if (emailRuns.has(runId)) return; // email runs have no drawer to open
      onOpenRun(runId);
    },
    [emailRuns, onOpenRun],
  );

  const handleDismissRun = useCallback(
    (runId: string) => {
      if (emailRuns.has(runId)) {
        removeEmailRun(runId);
      } else {
        onDismissRun(runId);
      }
    },
    [emailRuns, removeEmailRun, onDismissRun],
  );

  // ── Loading skeleton ────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="w-full max-w-245 h-90 bg-gray-100 rounded-[60px] animate-pulse" />
        <p className="text-sm text-gray-400 animate-pulse">Loading jobs…</p>
      </div>
    );
  }

  // ── Incomplete profile — can't generate recs ────────────────────────────
  if (pipelineStatus === "incomplete_profile" && !isLoading) {
    return (
      <div className="max-w-2xl mx-auto w-full py-12">
        <IncompleteProfileBanner missingFields={missingFields} />
      </div>
    );
  }

  // ── Pipeline active or generating — no recs yet ─────────────────────────
  if (
    (pipelineStatus === "queued" ||
      pipelineStatus === "processing" ||
      isGenerating) &&
    allJobs.length === 0
  ) {
    return (
      <div className="max-w-2xl mx-auto w-full py-12 flex flex-col gap-4">
        <JobsAppliedBanner
          appliedSize={appliedIds.size}
          runs={[...runs.values(), ...emailRuns.values()]}
          onOpenRun={handleOpenRun}
          onDismissRun={handleDismissRun}
        />
        <GeneratingBanner message={generatingMessage} />
      </div>
    );
  }


  // ── Deck ────────────────────────────────────────────────────────────────
  const visibleCards = deck.slice(0, 3);

  const topSwipeClass =
    swipeDir === "right"
      ? "translate-x-full opacity-0 rotate-6"
      : swipeDir === "left"
        ? "-translate-x-full opacity-0 -rotate-6"
        : "";

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-4 w-full">
      {/* Generating more — show inline banner while recs are already visible */}
      {(isGenerating ||
        pipelineStatus === "queued" ||
        pipelineStatus === "processing") && (
        <GeneratingBanner message={generatingMessage} />
      )}
      {/* Stats bar */}
      <JobsAppliedBanner
        appliedSize={appliedIds.size}
        runs={[...runs.values(), ...emailRuns.values()]}
        onOpenRun={handleOpenRun}
        onDismissRun={handleDismissRun}
      />

      {/* Card stack — CSS grid stacking: all cards share [grid-area:1/1] so the
           container height matches the top card's content on every screen size.
           pb-8 absorbs the 24px translateY peek of back cards. */}
      {deck.length === 0 ? (
        deck.length === 0 && (isFetchingNextPage || hasNextPage) ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-full max-w-245 h-90 bg-gray-100 rounded-[60px] animate-pulse" />
            <p className="text-sm text-gray-400 animate-pulse">
              Loading more jobs…
            </p>
          </div>
        ) : allJobs.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-2">
            <span className="text-4xl">📭</span>
            <p className="text-sm">
              {hasFilters
                ? "No jobs match your current filters. Try adjusting your preferences."
                : "No recommendations yet. Check back soon."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <span className="text-4xl">🎉</span>
            <p className="font-medium text-gray-700">
              You've reviewed all jobs!
            </p>
            <p className="text-xs text-gray-400">
              {appliedIds.size} applied · {skippedIds.size} skipped
            </p>
            <button
              onClick={handleReset}
              className="mt-1 px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-xl hover:bg-gray-200 transition-colors"
            >
              Start over
            </button>
          </div>
        )
      ) : (
        <div className="grid w-full max-w-245 pb-8">
          {[...visibleCards].reverse().map((job, reversedIdx) => {
            const stackIndex = (visibleCards.length - 1 - reversedIdx) as
              | 0
              | 1
              | 2;
            const isTop = stackIndex === 0;
            return (
              <div
                key={job.id}
                className={[
                  "[grid-area:1/1] transition-all duration-300",
                  isTop ? topSwipeClass : "",
                ].join(" ")}
              >
                <JobDeckCard
                  job={job}
                  stackIndex={stackIndex}
                  onSkip={handleSkip}
                  onApply={handleApply}
                />
              </div>
            );
          })}
        </div>
      )}
      <div className="w-full flex items-center justify-center">
        <Button
          onClick={() => {
            handleViewChange("list");
          }}
          className="font-poppins rounded-[50px] text-md p-6"
        >
          Bring your job
        </Button>
      </div>
    </div>
  );
}
