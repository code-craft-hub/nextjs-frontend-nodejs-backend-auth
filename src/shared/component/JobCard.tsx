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

// ─── Logo Map ──────────────────────────────────────────────────────────────────
const LOGOS = {
  google: {
    wrapperCn: "bg-white border border-gray-100",
    svg: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
    ),
  },
  youtube: {
    wrapperCn: "bg-red-600",
    svg: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="white">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  reddit: {
    wrapperCn: "bg-orange-600",
    svg: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="white">
        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
      </svg>
    ),
  },
  producthunt: {
    wrapperCn: "bg-orange-500",
    svg: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="white">
        <path d="M13.604 8.4h-3.405V12h3.405a1.8 1.8 0 0 0 0-3.6M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0m1.604 14.4H10.2V18H7.8V6h5.804a4.2 4.2 0 0 1 0 8.4" />
      </svg>
    ),
  },
  instagram: {
    wrapperCn: "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600",
    svg: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="white">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  slack: {
    wrapperCn: "bg-white border border-gray-100",
    svg: (
      <svg viewBox="0 0 24 24" className="w-7 h-7">
        <path
          d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zm10.122 2.521a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.268 0a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zm-2.523 10.122a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zm0-1.268a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"
          fill="#E01E5A"
        />
      </svg>
    ),
  },
};

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

  const applyBtnCn = cn(
    "inline-flex items-center gap-2 rounded-xl font-semibold text-sm px-5 h-10 transition-colors duration-200 no-underline",
    isSelected
      ? "bg-blue-900 hover:bg-blue-800 text-white"
      : "bg-blue-50 hover:bg-blue-100 text-blue-700",
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(job.id)}
      onKeyDown={(e) => e.key === "Enter" && onSelect(job.id)}
      className={cn(
        "bg-white rounded-2xl cursor-pointer px-4 sm:px-5 py-4 sm:py-[18px]",
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
        <div className=""><img src={job?.companyLogo ?? "/placeholder.jpg"} alt={job?.companyName || "Company Logo"} /></div>

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
              {job.salaryInfo}
            </span>
            <span className="inline-flex items-center gap-1 text-gray-500 text-[12px] sm:text-[13px]">
              <CalendarDays
                size={12}
                strokeWidth={2}
                className="text-gray-400 shrink-0"
              />
              {job.postedAt}
            </span>
            {/* Match score — desktop inline */}
            <span className="hidden sm:inline-flex text-green-600 font-semibold text-[13px]">
              % {job.matchScore} match
            </span>
          </div>

          {/* Match score — mobile own line */}
          <p className="sm:hidden mt-1 text-green-600 font-semibold text-[12px]">
            % {job.matchScore} match
          </p>
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
              href={job.link}
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
            href={job.link}
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
