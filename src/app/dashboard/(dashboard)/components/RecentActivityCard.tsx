import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiService } from "@/hooks/use-auth";
import { jobsQueries } from "@/lib/queries/jobs.queries";
import { JobFilters } from "@/lib/types/jobs";
import { cn } from "@/lib/utils";
import { randomPercentage } from "@/lib/utils/helpers";
import { useQuery } from "@tanstack/react-query";
import { isEmpty } from "lodash";
import { v4 as uuidv4 } from "uuid";
import { MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { memo } from "react";
import { toast } from "sonner";

export const RecentActivityCard = memo(
  ({ filters }: { filters: JobFilters }) => {
    const { data: jobs } = useQuery(jobsQueries.all(filters));
    const router = useRouter();
    return (
      <Card className="p-4 sm:p-7 gap-4">
        <h1 className="font-bold text-xl">Personalized Recommendation</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-4 sm:gap-8">
          {jobs?.data.map((job) => (
            <div
              key={job.id}
              className="flex bg-slate-50 p-4 sm:p-6 rounded-xl gap-4 sm:gap-6 border border-[#cbd5e1] relative"
            >
              <div className="shrink-0">
                <img
                  src={!!job.companyLogo ? job.companyLogo : "/company.svg"}
                  alt=""
                  loading="lazy"
                  className="size-12"
                />
              </div>
              <div className="flex flex-col gap-2 ">
                <h1 className="font-inter line-clamp-1 capitalize">
                  {job.title}
                </h1>
                <Button
                  variant={"ghost"}
                  onClick={async () => {
                    if (!job?.emailApply) {
                      window.open(job.link, "__blank");
                      return;
                    }

                    const { isAuthorized } =
                      await apiService.gmailOauthStatus();

                    if (!isAuthorized) {
                      toast.error(
                        "✨ Go to the Settings page and enable authorization for Cverai to send emails on your behalf. This option is located in the second card.",
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
                  className="absolute top-4 right-4"
                >
                  {!!job?.emailApply && (
                    <MoreHorizontal className="w-4 h-4 text-" />
                  )}
                </Button>
                <p className="font-poppins text-cverai-brown text-xs">
                  <span className="max-w-sm overflow-hidden capitalize">
                    {job.companyName}
                  </span>{" "}
                  ·{" "}
                  <span className="font-inter text-gray-400">
                    {!isEmpty(job.salaryInfo)
                      ? job?.salaryInfo
                      : "Not disclosed"}
                  </span>
                </p>
                <div className="flex flex-wrap gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      className={cn(
                        "rounded-full font-epilogue font-semibold bg-cverai-teal/10 text-cverai-teal",
                        " truncate overflow-hidden text-start "
                      )}
                    >
                      {!!job.jobType ? job.jobType : job?.employmentType}
                    </Badge>
                    <div className="bg-slate-500 w-[1px] h-7" />
                    <Badge
                      className={cn(
                        "rounded-full font-epilogue text-wrap font-semibold text-cverai-blue border-cverai-blue bg-white",
                        " truncate overflow-hidden text-start max-sm:max-w-44"
                      )}
                    >
                      {job.location}
                    </Badge>
                    <Badge
                      className={cn(
                        "rounded-full font-epilogue font-semibold text-cverai-orange border-cverai-orange bg-white",
                        " truncate overflow-hidden text-start"
                      )}
                    >
                      {/* {job.scrapedDate} */}
                      {randomPercentage(10)} match
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }
);

RecentActivityCard.displayName = "RecentActivityCard";
