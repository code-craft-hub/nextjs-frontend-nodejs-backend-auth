"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { apiService } from "@/hooks/use-auth";
import { useUpdateJobApplicationHistoryMutation } from "@/lib/mutations/jobs.mutations";
import { jobsQueries } from "@/lib/queries/jobs.queries";
import { userQueries } from "@/lib/queries/user.queries";
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
import { useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

export const JobIdClient = ({
  jobId,
  referrer,
}: {
  jobId: string;
  referrer: string;
}) => {
  const { data, isLoading } = useQuery(jobsQueries.detail(jobId));
  const { data: user } = useQuery(userQueries.detail());
  const updateJobApplicationHistory = useUpdateJobApplicationHistoryMutation();

  const [pageTitle, setPageTitle] = useState("AI Recommendations");
  const job = data?.data;
  const router = useRouter();

  const handleBackClick = () => {
    if (referrer === "dashboard") {
      router.push("/dashboard/home");
    } else if (referrer === "ai-recommendations") {
      setPageTitle("AI Recommendations");
      router.push("/dashboard/jobs/category?tab=ai-recommendations");
    } else if (referrer === "saved-jobs") {
      setPageTitle("Saved Jobs");
      router.push("/dashboard/jobs/category?tab=saved-jobs");
    } else if (referrer === "application-history") {
      setPageTitle("Application History");
      router.push("/dashboard/jobs/category?tab=application-history");
    } else {
      router.push("/dashboard/jobs");
    }
  };

  const handleApplyClick = async () => {
    if (!job) return;

    updateJobApplicationHistory.mutate({
      id: job.id,
      data: {
        appliedJobs: job.id,
      },
    });

    if (!job?.emailApply) {
      window.open(!!job.link ? job?.link : job?.applyUrl, "__blank");
      return;
    }

    if (user?.email && job?.emailApply) {
      const { authorized } = await apiService.gmailOauthStatus();

      if (!authorized) {
        toast(
          "Please authorize Cver AI to send emails on your behalf from the settings page.  ",
          {
            action: {
              label: "Authorize now",
              onClick: () =>
                router.push(`/dashboard/settings?tab=ai-applypreference`),
            },
            classNames: {
              // toast: "!bg-yellow-50 !border-yellow-200",
              actionButton: "!bg-blue-600 hover:!bg-blue-700 !text-white !h-8",
            },
          }
        );

        return;
      }
    }

    const params = new URLSearchParams();
    params.set("jobDescription", JSON.stringify(job?.descriptionText || ""));
    params.set("recruiterEmail", encodeURIComponent(job?.emailApply));
    router.push(
      `/dashboard/tailor-cover-letter/${uuidv4()}?${params}&aiApply=true`
    );
  };
  return (
    <div>
      <div className="min-h-screen bg-gray-50">
        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
          <button
            onClick={() => handleBackClick()}
            className="flex items-center hover:cursor-pointer text-blue-600 font-medium hover:text-blue-700"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <h1 className="text-2xl sm:text-4xl font-bold text-center my-8">
            {pageTitle}
          </h1>

          {/* Company Header Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              {isLoading ? (
                <JobTitleSkeleton />
              ) : (
                <div className="flex items-center">
                  {!!job?.companyLogo && (
                    <div className="w-14 h-14 shrink-0 rounded-xl flex items-center justify-center mr-4">
                      <img
                        src={job?.companyLogo ?? ""}
                        className="size-full text-white"
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
                onClick={() => handleApplyClick()}
                className="bg-blue-600 max-sm:text-2xs hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium max-sm:w-full"
              >
                Apply Now{" "}
                {job?.emailApply && (
                  <Sparkles className="w-4 h-4 inline-block ml-1" />
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Job Description */}
              <div className=" p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Job Description
                </h3>
                {isLoading ? (
                  <JobDescriptionSkeleton />
                ) : (
                  <div className="text-gray-600 leading-relaxed space-y-3">
                    {!!job?.descriptionHtml ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: job?.descriptionHtml ?? "",
                        }}
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
                      <span className="text-sm">Facebook</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 rounded hover:bg-red-100">
                      <span className="text-sm">Pinterest</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Job Info Card */}
              <div className="bg-white rounded-lg shadow-sm p-6  border-blue-100 border">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-center w-10 h-10 shrink-0 rounded-lg mb-2">
                      <img
                        src="/Calender.svg"
                        className="w-5 h-5 text-blue-600"
                      />
                    </div>
                    <p className="text-xs text-gray-500 uppercase mb-1">
                      Date posted
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {postedDate(job?.postedAt || "")}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center w-10 h-10 shrink-0 rounded-lg mb-2">
                      <MapPin className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-xs text-gray-500 uppercase mb-1">
                      Location
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {job?.location || "Remote"}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center w-10 h-10 shrink-0 rounded-lg mb-2">
                      <Wallet className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-xs text-gray-500 uppercase mb-1">
                      Salary Info
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {job?.salary || "N/A"}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center w-10 h-10 shrink-0 rounded-lg mb-2">
                      <img
                        src="/briefcase.svg"
                        className="w-5 h-5 text-blue-600"
                      />
                    </div>
                    <p className="text-xs text-gray-500 uppercase mb-1">
                      Employment Type
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {job?.employmentType || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-lg shadow-sm p-6 border-blue-100 border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex items-center justify-center w-10 h-10 shrink-0 rounded-lg mr-3">
                      <img
                        src="/GlobeSimple.svg"
                        className="w-5 h-5 text-blue-600"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase mb-1">
                        JOB LINK/WEBSITE
                      </p>
                      <p
                        // href="https://www.estherhoward.com"
                        className="text-sm text-gray-900 hover:text-blue-600 break-all"
                      >
                        {job?.companyLogo?.split("/")[2] ?? "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start border-t pt-4">
                    <div className="flex items-center justify-center w-10 h-10 shrink-0 rounded-lg mr-3">
                      <img
                        src="/phone-call-duotone.svg"
                        className="w-5 h-5 text-blue-600"
                      />
                    </div>
                    <div className=" ">
                      <p className="text-xs text-gray-500 uppercase mb-1">
                        Phone
                      </p>
                      <p
                        // href="tel:+12025550141"
                        className="text-sm text-gray-900 hover:text-blue-600"
                      >
                        N/A
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start border-t pt-4">
                    <div className="flex items-center justify-center w-10 h-10 shrink-0 rounded-lg mr-3">
                      <img
                        src={"/Envelope.svg"}
                        className="w-5 h-5 text-blue-600"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase mb-1">
                        Email address
                      </p>
                      <p
                        // href="mailto:esther.howard@gmail.com"
                        className="text-sm text-gray-900 hover:text-blue-600 break-all"
                      >
                        {job?.companyLogo?.split("/")[2] ?? "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Follow Us */}
              <div className="bg-white rounded-lg shadow-sm p-6  border-blue-100 border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Follow us on:
                </h3>
                <div className="flex gap-3">
                  <button className="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 rounded hover:bg-blue-200">
                    <Facebook className="w-5 h-5" />
                  </button>
                  <button className="flex items-center justify-center w-10 h-10 bg-blue-500 text-white rounded hover:bg-blue-600">
                    <Twitter className="w-5 h-5" />
                  </button>
                  <button className="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 rounded hover:bg-blue-200">
                    <Instagram className="w-5 h-5" />
                  </button>
                  <button className="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 rounded hover:bg-blue-200">
                    <Youtube className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export function JobDescriptionSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 items-center ">
      {Array.from({ length: 6 }).map((_, index) => (
        <div className="space-y-2 w-full" key={index}>
          <Skeleton className="h-10 w-full " />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
}
export function JobTitleSkeleton() {
  return (
    <div className="flex gap-4">
      <Skeleton className="h-16 w-16 " />
      <div className="gap-2 grid">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-6 w-32" />
      </div>
    </div>
  );
}
