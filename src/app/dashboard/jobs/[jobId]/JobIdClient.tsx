"use client";
import { apiService } from "@/hooks/use-auth";
import { jobsQueries } from "@/lib/queries/jobs.queries";
import { userQueries } from "@/lib/queries/user.queries";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Users,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

export const JobIdClient = ({
  jobId,
  referrer,
}: {
  jobId: string;
  referrer: string;
}) => {
  const { data } = useQuery(jobsQueries.detail(jobId));
  const { data: user } = useQuery(userQueries.detail());
  const job = data?.data;
  const router = useRouter();

  const handleBackClick = () => {
    if (referrer === "dashboard") {
      router.push("/dashboard/home");
    } else if (referrer === "ai-recommendations") {
      router.push("/dashboard/jobs/category?tab=ai-recommendations");
    } else if (referrer === "saved-jobs") {
      router.push("/dashboard/jobs/category?tab=saved-jobs");
    } else if (referrer === "application-history") {
      router.push("/dashboard/jobs/category?tab=application-history");
    } else {
      router.push("/dashboard/jobs");
    }
  };

  const handleApplyClick = async () => {
    if (user?.email) {
      const { isAuthorized } = await apiService.gmailOauthStatus();

      if (!isAuthorized) {
        toast(
          "Please authorize Cverai to send emails on your behalf from the settings page.  ",
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

    if (!job?.emailApply) {
      toast.error(
        "No destination email found in job description. Please include the destination email in the job description."
      );
      return;
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
            AI Recommendations
          </h1>

          {/* Company Header Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
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
                  <h2 className="text-xl font-semibold text-gray-900">
                    {job?.companyName}
                  </h2>
                  <p className="text-gray-500 text-sm capitalize">
                    {job?.title}
                  </p>
                </div>
              </div>
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
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-center w-10 h-10 shrink-0 rounded-lg mb-2">
                      <img
                        src="/Calender.svg"
                        className="w-5 h-5 text-blue-600"
                      />
                    </div>
                    <p className="text-xs text-gray-500 uppercase mb-1">
                      Founded in
                    </p>
                    <p className="text-sm font-semibold text-gray-900">N/A</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center w-10 h-10 shrink-0 rounded-lg mb-2">
                      <img src="/Timer.svg" className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-xs text-gray-500 uppercase mb-1">
                      Organization type
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      Private Company
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center w-10 h-10 shrink-0 rounded-lg mb-2">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-xs text-gray-500 uppercase mb-1">
                      Team size
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      100+ Candidates
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
                      Industry types
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      Technology
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
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
                        Website
                      </p>
                      <p
                        // href="https://www.estherhoward.com"
                        className="text-sm text-gray-900 hover:text-blue-600"
                      >
                        {job?.companyLogo?.split("/")[2] ?? "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex items-center justify-center w-10 h-10 shrink-0 rounded-lg mr-3">
                      <img
                        src="/phone-call-duotone.svg"
                        className="w-5 h-5 text-blue-600"
                      />
                    </div>
                    <div>
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
                  <div className="flex items-start">
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
                        className="text-sm text-gray-900 hover:text-blue-600"
                      >
                        {job?.companyLogo?.split("/")[2] ?? "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Follow Us */}
              <div className="bg-white rounded-lg shadow-sm p-6">
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
