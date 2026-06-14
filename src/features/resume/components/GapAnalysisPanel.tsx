"use client";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  GapAnalysisResult,
  GapSkillSuggestion,
  GapCertificationSuggestion,
  GapExperienceItem,
} from "@/shared/types/resume.types";
import {
  AlertCircleIcon,
  BookOpenIcon,
  BriefcaseIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  ChevronUpIcon,
  KeyIcon,
  LightbulbIcon,
  SparklesIcon,
  TagIcon,
} from "lucide-react";
import { useState } from "react";

// ─── Priority colour mapping ──────────────────────────────────────────────────

const PRIORITY_STYLES = {
  high: "bg-red-50 text-red-700 border-red-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-sky-50 text-sky-700 border-sky-200",
} as const;

const PRIORITY_LABELS = {
  high: "Required",
  medium: "Preferred",
  low: "Nice to have",
} as const;

// ─── Match score colour ───────────────────────────────────────────────────────

function scoreColour(score: number): string {
  if (score >= 75) return "text-emerald-600";
  if (score >= 50) return "text-amber-600";
  return "text-red-600";
}

function scoreBarColour(score: number): string {
  if (score >= 75) return "[&>div]:bg-emerald-500";
  if (score >= 50) return "[&>div]:bg-amber-500";
  return "[&>div]:bg-red-500";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({
  icon,
  title,
  count,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-slate-500">{icon}</span>
      <h4 className="font-semibold text-slate-800 text-sm">{title}</h4>
      {count > 0 && (
        <span className="ml-auto text-xs font-medium text-slate-400">
          {count} item{count !== 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
}

function SkillCard({ skill }: { skill: GapSkillSuggestion }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 bg-white hover:border-slate-200 transition-colors">
      <div className="mt-0.5">
        {skill.actionable ? (
          <CheckCircle2Icon className="w-4 h-4 text-emerald-500" />
        ) : (
          <AlertCircleIcon className="w-4 h-4 text-amber-500" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-1.5 mb-1">
          <span className="font-medium text-sm text-slate-800">{skill.label}</span>
          <Badge
            variant="outline"
            className={`text-[10px] px-1.5 py-0 border ${PRIORITY_STYLES[skill.priority]}`}
          >
            {PRIORITY_LABELS[skill.priority]}
          </Badge>
          <Badge
            variant="outline"
            className="text-[10px] px-1.5 py-0 border border-slate-200 text-slate-500"
          >
            {skill.category === "hard" ? "Technical" : "Soft skill"}
          </Badge>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">{skill.reason}</p>
        {skill.actionable && (
          <p className="text-[11px] text-emerald-600 mt-1 font-medium">
            You likely have this — add it to your profile
          </p>
        )}
      </div>
    </div>
  );
}

function CertCard({ cert }: { cert: GapCertificationSuggestion }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 bg-white hover:border-slate-200 transition-colors">
      <BookOpenIcon className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-1.5 mb-1">
          <span className="font-medium text-sm text-slate-800">{cert.name}</span>
          <Badge
            variant="outline"
            className={`text-[10px] px-1.5 py-0 border ${PRIORITY_STYLES[cert.priority]}`}
          >
            {PRIORITY_LABELS[cert.priority]}
          </Badge>
        </div>
        {cert.issuer && (
          <p className="text-[11px] text-slate-400 mb-1">Issued by {cert.issuer}</p>
        )}
        <p className="text-xs text-slate-500 leading-relaxed">{cert.reason}</p>
      </div>
    </div>
  );
}

function ExperienceCard({ item }: { item: GapExperienceItem }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 bg-white">
      <LightbulbIcon className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
      <div>
        <p className="font-medium text-sm text-slate-800 mb-0.5">{item.area}</p>
        <p className="text-xs text-slate-500 leading-relaxed">{item.suggestion}</p>
      </div>
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function GapAnalysisSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="space-y-2 pt-2">
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>
    </div>
  );
}

// ─── Collapsible section ──────────────────────────────────────────────────────

function CollapsibleSection({
  title,
  icon,
  count,
  children,
  defaultOpen = true,
}: {
  title: string;
  icon: React.ReactNode;
  count: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  if (count === 0) return null;

  return (
    <div className="border border-slate-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
      >
        <span className="text-slate-500">{icon}</span>
        <span className="font-semibold text-slate-800 text-sm flex-1">{title}</span>
        <span className="text-xs font-medium text-slate-400 mr-2">
          {count} item{count !== 1 ? "s" : ""}
        </span>
        {open ? (
          <ChevronUpIcon className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDownIcon className="w-4 h-4 text-slate-400" />
        )}
      </button>
      {open && <div className="p-4 space-y-2 bg-slate-50/30">{children}</div>}
    </div>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────

interface GapAnalysisPanelProps {
  result: GapAnalysisResult | null;
  isLoading: boolean;
  error: string | null;
}

export function GapAnalysisPanel({
  result,
  isLoading,
  error,
}: GapAnalysisPanelProps) {
  if (!isLoading && !result && !error) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
        <SparklesIcon className="w-4 h-4 text-indigo-500" />
        <h3 className="font-semibold text-slate-900 text-base">Job Fit Analysis</h3>
        <span className="ml-2 text-xs text-slate-400 font-normal">
          Advisory only — suggestions are never auto-applied
        </span>
      </div>

      <div className="p-5">
        {isLoading && <GapAnalysisSkeleton />}

        {error && !isLoading && (
          <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
            <AlertCircleIcon className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {result && !isLoading && (
          <div className="space-y-5">
            {/* Match score */}
            <div>
              <div className="flex items-baseline gap-2 mb-2">
                <span
                  className={`text-3xl font-bold ${scoreColour(result.matchScore)}`}
                >
                  {result.matchScore}
                </span>
                <span className="text-slate-400 text-sm font-medium">/ 100 match</span>
              </div>
              <Progress
                value={result.matchScore}
                className={`h-2 ${scoreBarColour(result.matchScore)}`}
              />
              {result.summary && (
                <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                  {result.summary}
                </p>
              )}
            </div>

            {/* Skills */}
            <CollapsibleSection
              title="Skills to add to your profile"
              icon={<TagIcon className="w-4 h-4" />}
              count={result.skills.toAdd.length}
            >
              {result.skills.toAdd.map((s, i) => (
                <SkillCard key={i} skill={s} />
              ))}
            </CollapsibleSection>

            {/* Certifications */}
            <CollapsibleSection
              title="Certifications to consider"
              icon={<BookOpenIcon className="w-4 h-4" />}
              count={result.certifications.length}
              defaultOpen={false}
            >
              {result.certifications.map((c, i) => (
                <CertCard key={i} cert={c} />
              ))}
            </CollapsibleSection>

            {/* Experience gaps */}
            <CollapsibleSection
              title="Experience gaps"
              icon={<BriefcaseIcon className="w-4 h-4" />}
              count={result.experienceGaps.length}
              defaultOpen={false}
            >
              {result.experienceGaps.map((item, i) => (
                <ExperienceCard key={i} item={item} />
              ))}
            </CollapsibleSection>

            {/* ATS keywords */}
            {result.keywords.length > 0 && (
              <div className="border border-slate-100 rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-50">
                  <KeyIcon className="w-4 h-4 text-slate-500" />
                  <span className="font-semibold text-slate-800 text-sm">
                    ATS keywords missing from your profile
                  </span>
                </div>
                <div className="p-4 flex flex-wrap gap-2">
                  {result.keywords.map((kw) => (
                    <Badge
                      key={kw}
                      variant="outline"
                      className="text-xs border-slate-200 text-slate-600 bg-white"
                    >
                      {kw}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
              These are suggestions based on the job description — not assertions
              about your abilities. Only add skills or experience to your profile
              that genuinely reflect your background.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
