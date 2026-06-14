import React from "react";
import { MatchScore } from "./MatchScore";

type Detail = {
  icon: React.ReactNode;
  label: string;
};

export interface JobCardProps {
  logoSrc: string;
  tags?: string[];
  title?: string;
  company?: string;
  meta?: string;
  details?: Detail[];
  applicantsText?: string;
  matchPercent?: number;
  matchLabel?: string;
  sponsorText?: string;
  onApply?: () => void;
  onAskOrion?: () => void;
  onHide?: () => void;
  onSave?: () => void;
}

const iconCls = "h-4 w-4 shrink-0 stroke-[#3c4043]";

const PinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={iconCls}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={iconCls}>
    <circle cx="12" cy="13" r="8" />
    <path d="M12 9v4l2.5 2.5" />
    <path d="M5 3 2 6" />
    <path d="m22 6-3-3" />
  </svg>
);
const WifiIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={iconCls}>
    <path d="M5 12.55a11 11 0 0 1 14 0" />
    <path d="M1.42 9a16 16 0 0 1 21.16 0" />
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
    <line x1="12" y1="20" x2="12.01" y2="20" />
  </svg>
);
const BriefcaseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={iconCls}>
    <path d="M20 7h-4V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2H4a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z" />
    <path d="M2 13.5V19a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5.5" />
    <path d="M12 12v3" />
  </svg>
);
const BookIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={iconCls}>
    <path d="M3 5.5C3 4.7 3.7 4 4.5 4H10a2.5 2.5 0 0 1 2 1 2.5 2.5 0 0 1 2-1h5.5c.8 0 1.5.7 1.5 1.5V18a1 1 0 0 1-1 1h-6a2 2 0 0 0-2 2 2 2 0 0 0-2-2H4a1 1 0 0 1-1-1Z" />
    <path d="M12 5v16" />
  </svg>
);

const DEFAULT_DETAILS: Detail[] = [
  { icon: <PinIcon />, label: "San Francisco, CA" },
  { icon: <ClockIcon />, label: "Internship" },
  { icon: <BookIcon />, label: "Start in 2027 Winter" },
  { icon: <WifiIcon />, label: "Onsite" },
  { icon: <BriefcaseIcon />, label: "Intern" },
];

export default function JobCard({
  logoSrc,
  tags = ["1 day ago", "5 school alumni work here", "Be an early applicant"],
  title = "Full Stack Software Engineer Intern - Winter 2...",
  company = "Rippling",
  meta = "/ Accounting · Human Resources · Late Stage",
  details = DEFAULT_DETAILS,
  applicantsText = "Less than 25 applicants",
  matchPercent = 58,
  onApply,
  onAskOrion,
  onHide,
  onSave,
}: JobCardProps) {
  return (
    <div className="flex w-full overflow-hidden rounded-2xl border border-[#e8eaed] bg-white shadow-sm">
      {/* MAIN */}
      <div className="relative flex min-w-0 flex-1 flex-col px-5 pt-4">
        {/* three-dot menu */}
        <button
          aria-label="More options"
          className="absolute right-2 top-2 flex h-7 w-9 items-center justify-center gap-0.75 rounded-full bg-[#f1f3f4]"
        >
          {[0, 1, 2].map((i) => (
            <span key={i} className="block h-1 w-1 rounded-full bg-[#5f6368]" />
          ))}
        </button>

        {/* header */}
        <div className="flex items-start gap-3">
          <img
            src={logoSrc}
            alt={`${company} logo`}
            className="h-12 w-12 shrink-0 rounded-xl object-cover"
          />
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span
                  key={t}
                  className="whitespace-nowrap rounded-md bg-[#e3f3ec] px-2 py-0.5 text-[11px] font-semibold text-[#1f3b32]"
                >
                  {t}
                </span>
              ))}
            </div>
            <h2 className="mb-0.5 truncate text-base font-extrabold leading-snug tracking-tight text-[#15171a]">
              {title}
            </h2>
            <p className="truncate text-sm">
              <span className="font-semibold text-[#15171a]">{company}</span>{" "}
              <span className="font-medium text-[#9aa0a6]">{meta}</span>
            </p>
          </div>
        </div>

        {/* details grid */}
        <div className="mt-3 grid grid-cols-2 gap-y-2 border-t border-[#edeff1] pt-3 sm:grid-cols-3">
          {details.map((d) => (
            <div
              key={d.label}
              className="flex items-center gap-1.5 text-sm font-medium text-[#2b2f33]"
            >
              {d.icon}
              <span className="truncate">{d.label}</span>
            </div>
          ))}
        </div>

        {/* footer */}
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#edeff1] py-3">
          <span className="text-xs font-medium text-[#b1b6bb]">{applicantsText}</span>
          <div className="ml-auto flex items-center gap-1.5">
            <button
              aria-label="Hide"
              onClick={onHide}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f1f3f4] transition-colors hover:bg-[#e8eaed]"
            >
              <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} strokeLinecap="round" className="h-4 w-4 stroke-[#5f6368]">
                <circle cx="12" cy="12" r="9" />
                <line x1="5.6" y1="5.6" x2="18.4" y2="18.4" />
              </svg>
            </button>
            <button
              aria-label="Save"
              onClick={onSave}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f1f3f4] transition-colors hover:bg-[#e8eaed]"
            >
              <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 stroke-[#5f6368]">
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
              </svg>
            </button>
            <button
              onClick={onAskOrion}
              className="flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full bg-[#f1f3f4] px-3.5 text-xs font-extrabold tracking-wide text-[#15171a] transition-colors hover:bg-[#e8eaed]"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-[#15171a]">
                <path d="M12 2l1.8 5.6a4 4 0 0 0 2.6 2.6L22 12l-5.6 1.8a4 4 0 0 0-2.6 2.6L12 22l-1.8-5.6a4 4 0 0 0-2.6-2.6L2 12l5.6-1.8a4 4 0 0 0 2.6-2.6L12 2z" />
              </svg>
              ASK ORION
            </button>
            <button
              onClick={onApply}
              className="flex h-8 items-center whitespace-nowrap rounded-full bg-[#1ee0a0] px-4 text-xs font-extrabold tracking-wide text-[#003a28] transition-opacity hover:opacity-90"
            >
              APPLY WITH AUTOFILL
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT: match score panel */}
      <div className="flex w-24 shrink-0 flex-col items-center justify-center bg-[#021822] px-2 py-4">
        <MatchScore percentage={matchPercent} />
      </div>
    </div>
  );
}
