"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Sparkles } from "lucide-react";
import { JobFilters } from "@/lib/types/jobs";
import { jobsQueries } from "@/lib/queries/jobs.queries";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/hooks/use-auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { cn } from "@/lib/utils";

export const FeatureJobs = ({ filters }: { filters: JobFilters }) => {
  const { data: jobs } = useQuery(jobsQueries.all(filters));

  const router = useRouter();
  if (!jobs || jobs.data?.length === 0) {
    return null;
  }
  return (
    <section id="feature-jobs" className="pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Featured Jobs</h2>
          <Button
            variant="cveraiOutline"
            onClick={() => router.push("/dashboard/home?tab=find-jobs")}
          >
            View All <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {jobs?.data?.map((job, index) => (
            <div
              key={index}
              className={cn(
                "bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-4 space-y-4",
                !!job?.emailApply && "shadow-blue-100 shadow-2xl "
              )}
            >
              <div className="flex justify-between">
                <h3 className="font-medium mb-1 line-clamp-1 capitalize">
                  {job?.title}
                </h3>
                <p className="">
                  {!!job?.emailApply && (
                    <Sparkles className="w-4 h-4 text-yellow-500 animate-bounce" />
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 bg-[#E7F6EA] text-[#0BA02C] uppercase text-nowrap h-fit">
                  {!!job?.jobType
                    ? job?.jobType
                    : job?.employmentType
                    ? job.employmentType
                    : "On-site"}
                </span>
                {job?.salary && (
                  <span className=" text-gray-400 text-xs">
                    Salary: {job?.salary ?? ""}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="rounded-sm flex items-center justify-center text-2xl shrink-0">
                  <img
                    src={
                      !!job?.companyLogo ? job?.companyLogo : "/placeholder.jpg"
                    }
                    alt="company logo"
                    className="size-12"
                  />
                </div>
                <div className="">
                  <p className="text-gray-600 text-sm font-medium">
                    {job?.companyName}
                  </p>
                  <div className="flex items-center text-gray-500 text-xs">
                    <MapPin className="w-3 h-3 mr-1" />
                    <p className="line-clamp-1">{job?.location}</p>
                  </div>
                </div>
                <div className="ml-auto">
                  <Button
                    onClick={async () => {
                      if (!job?.emailApply) {
                        window.open(
                          !!job.link ? job?.link : job?.applyUrl,
                          "__blank"
                        );
                        return;
                      }

                      const { isAuthorized } =
                        await apiService.gmailOauthStatus();

                      if (!isAuthorized) {
                        toast.error(
                          "✨ Go to the Settings page and enable authorization for Cver AI to send emails on your behalf. This option is located in the second card.",
                          {
                            action: {
                              label: "Authorize now",
                              onClick: () =>
                                router.push(
                                  `/dashboard/settings?tab=ai-applypreference`
                                ),
                            },
                            classNames: {
                              actionButton:
                                "!bg-blue-600 hover:!bg-blue-700 !text-white !h-8",
                            },
                          }
                        );

                        return;
                      }

                      const params = new URLSearchParams();
                      params.set(
                        "jobDescription",
                        JSON.stringify(job?.descriptionText || "")
                      );
                      params.set(
                        "recruiterEmail",
                        encodeURIComponent(job?.emailApply)
                      );
                      router.push(
                        `/dashboard/tailor-cover-letter/${uuidv4()}?${params}&aiApply=true`
                      );
                    }}
                  >
                    {!!job?.emailApply ? "Auto Apply" : "Apply"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
