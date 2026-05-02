import type { JobPost } from "@/features/job-posts";

// ─── Color hash ───────────────────────────────────────────────────────────────

const LOGO_COLORS = [
  "#2d7ff9",
  "#6366f1",
  "#0891b2",
  "#059669",
  "#7c3aed",
  "#dc2626",
  "#d97706",
  "#0f766e",
];

function hashColor(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return LOGO_COLORS[h % LOGO_COLORS.length];
}

// ─── Component ────────────────────────────────────────────────────────────────

interface JobCardProps {
  job: JobPost;
  /** Visual stack position — top card is interactive, others are decorative. */
  stackIndex: 0 | 1 | 2;
}

const STACK_STYLES: Record<number, React.CSSProperties> = {
  0: { transform: "none", zIndex: 3, boxShadow: "0 8px 32px rgba(0,0,0,0.12)" },
  1: {
    transform: "translateY(8px) scale(0.97)",
    zIndex: 2,
    boxShadow: "0 4px 16px rgba(0,0,0,0.07)",
  },
  2: {
    transform: "translateY(16px) scale(0.94)",
    zIndex: 1,
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
};

export function JobCard({ job, stackIndex }: JobCardProps) {
  const companyName = job.companyName ?? job.company ?? "";
  const initial = (companyName || "?").charAt(0).toUpperCase();
  const logoColor = hashColor(companyName);

  // Build a small tag list from available metadata fields.
  const tags: string[] = [];
  if (job.employmentType) tags.push(job.employmentType);
  if (job.jobType) tags.push(job.jobType);
  if (job.classification) tags.push(job.classification);
  const visibleTags = tags.slice(0, 3);

  return (
    <div
      className="absolute inset-0 bg-white rounded-2xl border border-gray-100 p-5 transition-transform duration-300 overflow-hidden"
      style={STACK_STYLES[stackIndex]}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3 gap-2">
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 flex-1">
          {job.title}
        </h3>
        <a
          href={job.applyUrl ?? job.link ?? "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-indigo-500 transition-colors text-base shrink-0 -mt-0.5"
          onClick={(e) => e.stopPropagation()}
          title="Open job posting"
        >
          ↗
        </a>
      </div>

      {/* Tags */}
      {(job.salary || visibleTags.length > 0) && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {job.salary && (
            <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-lg border border-green-100 font-medium">
              {job.salary}
            </span>
          )}
          {visibleTags.map((t) => (
            <span
              key={t}
              className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-lg border border-blue-100"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Company row */}
      <div className="flex items-center gap-2.5 mb-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0"
          style={{ background: logoColor }}
        >
          {initial}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium text-gray-800 truncate">
            {companyName || "—"}
          </div>
          <div className="text-xs text-gray-500 truncate">{job.location ?? ""}</div>
        </div>
      </div>

      {/* Description snippet */}
      {job.descriptionText && (
        <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
          {job.descriptionText}
        </p>
      )}
    </div>
  );
}
