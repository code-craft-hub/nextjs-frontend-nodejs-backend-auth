"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { jobsQueries } from "@/lib/queries/jobs.queries";
import { postedDate } from "@/lib/utils/helpers";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Sparkles,
  Wallet,
  MapPin,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useApplyJob } from "@/hooks/useApplyJob";

// ─── Referrer → page title mapping ───────────────────────────────────────────

const REFERRER_TITLES: Record<string, string> = {
  "ai-recommendations": "AI Recommendations",
  "saved-jobs": "Saved Jobs",
  "application-history": "Application History",
  dashboard: "Dashboard",
  jobs: "All Jobs",
};

// ─── Back navigation ──────────────────────────────────────────────────────────

const REFERRER_URLS: Record<string, string> = {
  dashboard: "/dashboard/home",
  "ai-recommendations": "/dashboard/jobs/category?tab=ai-recommendations",
  "saved-jobs": "/dashboard/jobs/category?tab=saved-jobs",
  "application-history": "/dashboard/jobs/category?tab=application-history",
};

// ─── Component ────────────────────────────────────────────────────────────────

export const JobIdClient = ({
  jobId,
  referrer,
}: {
  jobId: string;
  referrer: string;
}) => {
  const router = useRouter();
  const { data, isLoading } = useQuery(jobsQueries.detail(jobId));
  const { applyToJob } = useApplyJob();

  const job = data?.data;

  // Derive title and back URL from the referrer — no state needed.
  const pageTitle = REFERRER_TITLES[referrer] ?? "Job Details";
  const backUrl = REFERRER_URLS[referrer] ?? "/dashboard/jobs";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
        {/* Back button */}
        <button
          onClick={() => router.push(backUrl)}
          className="flex items-center hover:cursor-pointer text-blue-600 font-medium hover:text-blue-700"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        <h1 className="text-2xl sm:text-4xl font-bold text-center my-8">
          {pageTitle}
        </h1>

        {/* Company header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {isLoading ? (
              <JobTitleSkeleton />
            ) : (
              <div className="flex items-center">
                {job?.companyLogo && (
                  <div className="w-14 h-14 shrink-0 rounded-xl flex items-center justify-center mr-4">
                    <img
                      src={job.companyLogo}
                      alt={job.companyName ?? ""}
                      className="size-full object-contain"
                    />
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 capitalize">
                    {job?.title}
                  </h2>
                  <p className="text-gray-500 text-sm capitalize">
                    {job?.companyName}
                  </p>
                </div>
              </div>
            )}
            <button
              onClick={(e) => job && applyToJob(job, e)}
              className="bg-blue-600 max-sm:text-2xs hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium max-sm:w-full"
            >
              Apply Now
              {job?.emailApply && (
                <Sparkles className="w-4 h-4 inline-block ml-1" />
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column — description */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Job Description
              </h3>
              {isLoading ? (
                <JobDescriptionSkeleton />
              ) : (
                <div className="text-gray-600 leading-relaxed space-y-3">
                  {job?.descriptionHtml ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: job.descriptionHtml }}
                    />
                  ) : (
                    <div>{job?.descriptionText}</div>
                  )}
                </div>
              )}

              <div className="border-t pt-6 mt-6">
                <p className="text-gray-700 mb-3">Share profile:</p>
                <div className="flex flex-wrap gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 rounded hover:bg-blue-100">
                    <Facebook className="w-4 h-4" />
                    <span className="text-sm">Facebook</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 text-blue-400 bg-blue-50 rounded hover:bg-blue-100">
                    <Twitter className="w-4 h-4" />
                    <span className="text-sm">Twitter</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 rounded hover:bg-red-100">
                    <span className="text-sm">Pinterest</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Job info card */}
            <div className="bg-white rounded-lg shadow-sm p-6 border-blue-100 border">
              <div className="grid grid-cols-2 gap-6">
                <JobInfoCell
                  icon={<img src="/Calender.svg" className="w-5 h-5" alt="" />}
                  label="Date posted"
                  value={postedDate(job?.postedAt ?? "")}
                />
                <JobInfoCell
                  icon={<MapPin className="w-5 h-5 text-blue-600" />}
                  label="Location"
                  value={job?.location ?? "Remote"}
                />
                <JobInfoCell
                  icon={<Wallet className="w-5 h-5 text-blue-600" />}
                  label="Salary Info"
                  value={job?.salary ?? "N/A"}
                />
                <JobInfoCell
                  icon={
                    <img src="/briefcase.svg" className="w-5 h-5" alt="" />
                  }
                  label="Employment Type"
                  value={job?.employmentType ?? "N/A"}
                />
              </div>
            </div>

            {/* Contact information */}
            <div className="bg-white rounded-lg shadow-sm p-6 border-blue-100 border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Contact Information
              </h3>
              <div className="space-y-4">
                <ContactRow
                  icon="/GlobeSimple.svg"
                  label="Job Link / Website"
                  value={job?.companyLogo?.split("/")[2] ?? "N/A"}
                />
                <ContactRow
                  icon="/phone-call-duotone.svg"
                  label="Phone"
                  value="N/A"
                  bordered
                />
                <ContactRow
                  icon="/Envelope.svg"
                  label="Email address"
                  value={job?.companyLogo?.split("/")[2] ?? "N/A"}
                  bordered
                />
              </div>
            </div>

            {/* Social follow */}
            <div className="bg-white rounded-lg shadow-sm p-6 border-blue-100 border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Follow us on:
              </h3>
              <div className="flex gap-3">
                <SocialButton color="bg-blue-100 text-blue-600 hover:bg-blue-200">
                  <Facebook className="w-5 h-5" />
                </SocialButton>
                <SocialButton color="bg-blue-500 text-white hover:bg-blue-600">
                  <Twitter className="w-5 h-5" />
                </SocialButton>
                <SocialButton color="bg-blue-100 text-blue-600 hover:bg-blue-200">
                  <Instagram className="w-5 h-5" />
                </SocialButton>
                <SocialButton color="bg-blue-100 text-blue-600 hover:bg-blue-200">
                  <Youtube className="w-5 h-5" />
                </SocialButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function JobInfoCell({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-center w-10 h-10 shrink-0 rounded-lg mb-2">
        {icon}
      </div>
      <p className="text-xs text-gray-500 uppercase mb-1">{label}</p>
      <p className="text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function ContactRow({
  icon,
  label,
  value,
  bordered,
}: {
  icon: string;
  label: string;
  value: string;
  bordered?: boolean;
}) {
  return (
    <div className={`flex items-start ${bordered ? "border-t pt-4" : ""}`}>
      <div className="flex items-center justify-center w-10 h-10 shrink-0 rounded-lg mr-3">
        <img src={icon} className="w-5 h-5 text-blue-600" alt="" />
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase mb-1">{label}</p>
        <p className="text-sm text-gray-900 break-all">{value}</p>
      </div>
    </div>
  );
}

function SocialButton({
  children,
  color,
}: {
  children: React.ReactNode;
  color: string;
}) {
  return (
    <button
      className={`flex items-center justify-center w-10 h-10 rounded ${color}`}
    >
      {children}
    </button>
  );
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

export function JobDescriptionSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 items-center">
      {Array.from({ length: 6 }).map((_, i) => (
        <div className="space-y-2 w-full" key={i}>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
}

export function JobTitleSkeleton() {
  return (
    <div className="flex gap-4">
      <Skeleton className="h-16 w-16" />
      <div className="gap-2 grid">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-6 w-32" />
      </div>
    </div>
  );
}
