"use client";

import { useState } from "react";
import {
  Bookmark,
  MapPin,
  DollarSign,
  CalendarDays,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { JobPost } from "@/types";

// ─── Types ─────────────────────────────────────────────────────────────────────
/**
 * @typedef {Object} JobListing
 * @property {string}  id
 * @property {string}  title
 * @property {string}  employmentType
 * @property {string}  companyName
 * @property {string}  location
 * @property {string}  salaryInfo
 * @property {string}  postedAt
 * @property {number}  matchScore
 * @property {string}  link
 * @property {string}  logoType  - one of: google | youtube | reddit | producthunt | instagram | slack
 */

// ─── JobCard ───────────────────────────────────────────────────────────────────
export default function JobCard({
  job,
  isSelected,
  onSelect,
}: {
  job: JobPost;
  isSelected?: boolean;
  onSelect: (id: string) => void;
}) {
  const [bookmarked, setBookmarked] = useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(job.id)}
      onKeyDown={(e) => e.key === "Enter" && onSelect(job.id)}
      className={cn(
        "bg-white rounded-2xl cursor-pointer px-4 sm:px-5 py-4 sm:py-4.5",
        "border-[1.5px] transition-all duration-200 outline-none",
        "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        isSelected
          ? "border-blue-600 shadow-[0_0_0_3px_rgba(37,99,235,0.08)]"
          : "border-transparent hover:border-gray-200",
      )}
    >
      {/* ── Top row: logo · body · actions ── */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Logo */}
        <div className="">
          <img
            src={job?.companyLogo ?? "/placeholder.jpg"}
            alt={job?.companyName || "Company Logo"}
          />
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0">
          {/* Title + badge */}
          <div className="flex items-center flex-wrap gap-2 mb-1.5">
            <span className="font-bold text-sm sm:text-[15px] leading-tight text-gray-900 truncate">
              {job.title}
            </span>
            <Badge
              variant="secondary"
              className="bg-blue-50 text-blue-600 hover:bg-blue-50 rounded-full text-[11px] sm:text-xs font-semibold px-2.5 py-0.5 shrink-0 border-0"
            >
              {job.employmentType}
            </Badge>
          </div>

          {/* Meta chips */}
          <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
            <span className="inline-flex items-center gap-1 text-gray-500 text-[12px] sm:text-[13px]">
              <MapPin
                size={12}
                strokeWidth={2}
                className="text-gray-400 shrink-0"
              />
              {job.location}
            </span>
            <span className="inline-flex items-center gap-1 text-gray-500 text-[12px] sm:text-[13px]">
              <DollarSign
                size={12}
                strokeWidth={2}
                className="text-gray-400 shrink-0"
              />
              {(job as any)?.salaryInfo}
            </span>
            <span className="inline-flex items-center gap-1 text-gray-500 text-[12px] sm:text-[13px]">
              <CalendarDays
                size={12}
                strokeWidth={2}
                className="text-gray-400 shrink-0"
              />
              {job.postedAt}
            </span>
           
          </div>

         
        </div>

        {/* Actions: bookmark + desktop apply */}
        <div className="flex items-start sm:items-center gap-2 shrink-0 self-start sm:self-center">
          <button
            aria-label={bookmarked ? "Remove bookmark" : "Save job"}
            onClick={(e) => {
              e.stopPropagation();
              setBookmarked((v) => !v);
            }}
            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors duration-150"
          >
            <Bookmark
              size={20}
              strokeWidth={1.8}
              className={cn(
                "transition-colors duration-150",
                bookmarked
                  ? "fill-gray-900 stroke-gray-900"
                  : "fill-none stroke-gray-400",
              )}
            />
          </button>

          {/* Desktop Apply Now */}
          <Button
            asChild
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "hidden sm:inline-flex items-center gap-2 rounded-xl font-semibold text-sm px-5 h-10 shadow-none transition-colors duration-200",
              isSelected
                ? "bg-blue-900 hover:bg-blue-800 text-white"
                : "bg-blue-50 hover:bg-blue-100 text-blue-700",
            )}
          >
            <a
              href={job?.link ?? ""}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              Apply Now <ArrowRight size={14} strokeWidth={2.5} />
            </a>
          </Button>
        </div>
      </div>

      {/* ── Mobile Apply Now: full-width below the top row ── */}
      <div className="sm:hidden mt-3">
        <Button
          asChild
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "w-full flex items-center justify-center gap-2 rounded-xl font-semibold text-sm h-10 shadow-none transition-colors duration-200",
            isSelected
              ? "bg-blue-900 hover:bg-blue-800 text-white"
              : "bg-blue-50 hover:bg-blue-100 text-blue-700",
          )}
        >
          <a
            href={job?.link ?? ""}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            Apply Now <ArrowRight size={14} strokeWidth={2.5} />
          </a>
        </Button>
      </div>
    </div>
  );
}
