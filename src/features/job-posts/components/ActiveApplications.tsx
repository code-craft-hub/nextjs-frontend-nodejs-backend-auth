import React from "react";

type Status = "applied" | "queued" | "processing" | "attention";

export interface Application {
  id: string;
  title: string;
  company: string;
  /** URL of the company avatar. If omitted, a placeholder circle is used. */
  avatar?: string;
  autoApply?: boolean;
  status: Status;
}

export interface ActiveApplicationsProps {
  /** Section title — defaults to "Active". */
  label?: string;
  /** Items shown in the list. */
  items: Application[];
  /** Completion percentage shown in the top right. */
  completion?: number;
  /** Fires when the user clicks the X on a row. */
  onDismiss?: (id: string) => void;
  /** Fires when the user clicks "see all approvals". */
  onSeeAll?: () => void;
  className?: string;
}

/* ---------- Badges ---------- */

const StatusBadge: React.FC<{ status: Status }> = ({ status }) => {
  const map: Record<Status, { label: string; classes: string }> = {
    applied: {
      label: "Applied",
      classes: "bg-emerald-100 text-emerald-700",
    },
    queued: {
      label: "Queued",
      classes: "bg-slate-200 text-slate-500",
    },
    processing: {
      label: "Processing\u2026",
      classes: "bg-amber-100 text-amber-700",
    },
    attention: {
      label: "Attention needed",
      classes: "bg-rose-100 text-rose-600",
    },
  };
  const { label, classes } = map[status];
  return (
    <span
      className={`inline-flex h-7 items-center justify-center rounded-full px-3 text-[13px] font-semibold ${classes}`}
    >
      {label}
    </span>
  );
};

const AutoApplyBadge: React.FC = () => (
  <span className="inline-flex h-7 items-center gap-1 rounded-full bg-indigo-100 px-2.5 text-[12px] font-semibold text-indigo-700">
    <svg
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5 fill-indigo-600"
      aria-hidden="true"
    >
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" />
    </svg>
    Auto-apply
  </span>
);

/* ---------- Avatar placeholder ---------- */

const Avatar: React.FC<{ src?: string; alt?: string }> = ({ src, alt }) => {
  if (src) {
    return (
      <img
        src={src}
        alt={alt ?? ""}
        className="h-9 w-9 shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <div
      aria-hidden="true"
      className="h-9 w-9 shrink-0 rounded-full bg-neutral-900"
    />
  );
};

/* ---------- Close (X) ---------- */

const CloseIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
    aria-hidden="true"
  >
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

/* ---------- Main component ---------- */

const ActiveApplications: React.FC<ActiveApplicationsProps> = ({
  label = "Active",
  items,
  completion = 0,
  onDismiss,
  onSeeAll,
  className = "",
}) => {
  return (
    <div
      className={`w-full max-w-[760px] rounded-3xl bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-100 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-4">
        <h3 className="text-[20px] font-extrabold tracking-tight text-neutral-900">
          {label}
          <span className="font-extrabold">({items.length})</span>
        </h3>
        <span className="text-[14px] font-semibold text-neutral-500">
          {completion}% completion
        </span>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-200" />

      {/* Rows */}
      <ul className="flex flex-col">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center gap-3 py-3.5"
          >
            <Avatar src={item.avatar} alt={item.company} />

            <div className="flex min-w-0 flex-1 items-center gap-2">
              <span className="truncate text-[15px] font-bold text-neutral-900">
                {item.title} @{item.company}
              </span>
              {item.autoApply && <AutoApplyBadge />}
            </div>

            <StatusBadge status={item.status} />

            <button
              type="button"
              onClick={() => onDismiss?.(item.id)}
              aria-label="Dismiss"
              className="ml-1 inline-flex h-7 w-7 items-center justify-center rounded-full text-neutral-500 transition hover:bg-slate-100 hover:text-neutral-900"
            >
              <CloseIcon />
            </button>
          </li>
        ))}
      </ul>

      {/* See all */}
      <button
        type="button"
        onClick={onSeeAll}
        className="mt-2 h-12 w-full rounded-xl bg-slate-200/80 text-[15px] font-semibold text-neutral-900 transition hover:bg-slate-200"
      >
        see all approvals
      </button>
    </div>
  );
};

export default ActiveApplications;
