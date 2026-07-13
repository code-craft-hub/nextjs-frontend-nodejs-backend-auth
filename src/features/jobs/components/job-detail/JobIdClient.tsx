"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Sparkles,
  Wallet,
  MapPin,
} from "lucide-react";
import { BackButton } from "@/components/shared/BackButton";
import { Button } from "@/components/ui/button";
import { jobsQueries } from "@/features/jobs/queries/jobs.queries";
import { jobApplicationsApi } from "@/features/analytics/api/job-applications.api";
import type { ApplicationDetail } from "@/features/analytics/api/job-applications.api";
import { queryKeys } from "@/shared/query/keys";
import type { JobPost } from "@/features/job-posts";
import { useApplyJob } from "@/features/jobs/hooks/useApplyJob";
import { postedDate } from "@/lib/utils/helpers";
import { Analytics } from "@/lib/analytics";
import { JobQualityFeedbackModal } from "@/shared/components/job-quality-feedback-modal";
import { JobInfoCell } from "./JobInfoCell";
import { ContactRow } from "./ContactRow";
import { SocialButton } from "./SocialButton";
import { JobDescriptionSkeleton, JobTitleSkeleton } from "./JobSkeletons";
import { FormattedBlockText } from "@/lib/utils/format-block-text";
import EmptyState from "@/components/EmptyState";
import JobDescriptionRenderer from "./JobDescriptionRenderer";

const REFERRER_URLS: Record<string, string> = {
  dashboard: "/dashboard/home",
  "ai-recommendations": "/dashboard/jobs/category?tab=ai-recommendations",
  "saved-jobs": "/dashboard/jobs/category?tab=saved-jobs",
  "application-history": "/dashboard/jobs/category?tab=application-history",
};

/**
 * Adapt an application-with-details into the job shape this page renders. Used
 * when the route id is an application whose job listing is no longer in
 * job_posts (e.g. an expired listing applied to via email) — the job fields
 * are served from the application's captured snapshot, so "View Details" from
 * Application History still shows the role, company, and description.
 */
function applicationToJob(app: ApplicationDetail): JobPost {
  return {
    id: app.jobId ?? app.id,
    title: app.jobTitle ?? "",
    companyName: app.companyName,
    companyLogo: app.companyLogo,
    location: app.location,
    employmentType: app.employmentType,
    classification: app.classification,
    descriptionHtml: app.descriptionHtml,
    descriptionText: app.descriptionText,
    link: app.link ?? app.applyUrl,
    applyUrl: app.applyUrl,
    recruiterEmail: app.recruiterEmail,
    salaryInfo: app.salaryInfo,
    // No posting date for a purged listing — fall back to the apply date so
    // the "Date posted" cell shows something meaningful rather than N/A.
    postedAt: app.postedAt ?? app.appliedAt ?? "",
    localizedTo: "",
    createdAt: app.appliedAt ?? "",
    updatedAt: app.appliedAt ?? "",
    // Email applies carry a recruiter address; surfacing it re-enables the
    // "Auto Apply" affordance and the Contact card.
    emailApply: app.recruiterEmail,
  };
}

export function JobIdClient({
  jobId,
  referrer,
  from,
}: {
  jobId: string;
  referrer: string;
  /** Exact filtered dashboard URL the user came from — restores filters/results on back. */
  from?: string;
}) {
  // Primary source: the id is a job_posts id.
  const jobQuery = useQuery(jobsQueries.detail(jobId));
  const jobData = jobQuery.data?.data;

  // Fallback: the id is an application id whose job listing is gone (orphan
  // application). Only fires once the job lookup has resolved with nothing —
  // for a real job id this never runs.
  const appQuery = useQuery({
    queryKey: queryKeys.jobApplications.detail(jobId),
    queryFn: () => jobApplicationsApi.getDetails(jobId),
    enabled: !!jobId && !jobQuery.isLoading && !jobData,
    staleTime: 5 * 60 * 1000,
  });

  const { applyToJob } = useApplyJob();

  const job = jobData ?? (appQuery.data?.data ? applicationToJob(appQuery.data.data) : undefined);
  const isLoading = jobQuery.isLoading || appQuery.isLoading;
  const isError = jobQuery.isError && appQuery.isError;
  // Only trust `from` as a same-origin relative dashboard path — it's
  // round-tripped through a URL param, so validate before using it as a
  // navigation target.
  const backUrl =
    from && from.startsWith("/dashboard/jobs")
      ? from
      : (REFERRER_URLS[referrer] ?? "/dashboard/jobs");

  useEffect(() => {
    if (job?.id) {
      Analytics.jobView(job.id, job.title ?? undefined);
    }
  }, [job?.id]);

  if (isError || (!isLoading && !job)) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 relative">
        <BackButton href={backUrl} className="absolute top-8 left-8" />
        <EmptyState
          title="Job not found"
          description="This job may have been removed or is no longer available."
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
        {/* Back button */}
        <BackButton href={backUrl} />

        <h1 className="text-2xl sm:text-4xl font-bold text-center my-8">
          Job Details
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
                    <JobDescriptionRenderer html={job.descriptionHtml} />
                  ) : (
                    <FormattedBlockText text={job?.descriptionText} />
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
                  icon={<img src="/briefcase.svg" className="w-5 h-5" alt="" />}
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
                  label="Job Link"
                  value={job?.link ?? job?.applyUrl ?? "N/A"}
                  href={job?.link ?? job?.applyUrl ?? undefined}
                />
                <ContactRow
                  icon="/Envelope.svg"
                  label="Recruiter Email"
                  value={job?.recruiterEmail ?? "N/A"}
                  href={
                    job?.recruiterEmail
                      ? `mailto:${job.recruiterEmail}`
                      : undefined
                  }
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

            <JobQualityFeedbackModal resourceId={jobId}>
              <Button
                className="w-full border border-red-500 text-red-500 hover:text-red-700"
                variant={"outline"}
                type="button"
              >
                Flag Job
              </Button>
            </JobQualityFeedbackModal>
          </div>
        </div>
      </div>
    </div>
  );
}
