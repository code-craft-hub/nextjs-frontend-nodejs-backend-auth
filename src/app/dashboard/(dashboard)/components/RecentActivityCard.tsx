import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiService } from "@/hooks/use-auth";
import { jobsQueries } from "@/lib/queries/jobs.queries";
import { JobFilters } from "@/lib/types/jobs";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { isEmpty } from "lodash";
import { v4 as uuidv4 } from "uuid";
import { MoreHorizontal, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { memo, useMemo } from "react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { JobType } from "@/types";
import { userQueries } from "@/lib/queries/user.queries";

export const RecentActivityCard = memo(
  ({ filters }: { filters: JobFilters }) => {
    const { data: jobs } = useQuery(jobsQueries.autoApply(filters));
    const { data: user } = useQuery(userQueries.detail());

    const sortedJobs = useMemo(() => {
      if (!jobs?.data) return [];

      const recommendationsData = new Set(
        user?.recommendationsData?.map((rec: any) => rec.jobId) || []
      );

      const appliedJobs = new Set(
        user?.appliedJobs?.map((job: any) => job.id) || []
      );

      const job = jobs.data
        ?.filter((job) => !appliedJobs.has(job.id))
        .map((job) => {
          return {
            ...job,
            isRecommended: recommendationsData.has(job.id),
          };
        });

      return job;
    }, [jobs?.data, user?.appliedJobs?.length]);

    const router = useRouter();

    const handleJobClick = async (job: JobType) => {
      if (!job?.emailApply) {
        //!!row.original?.applyUrl ? row.original?.applyUrl : row.original?.link
        window.open(!!job.link ? job?.link : job?.applyUrl, "__blank");
        return;
      }

      const { isAuthorized } = await apiService.gmailOauthStatus();

      if (!isAuthorized) {
        toast.error(
          "✨ Go to the Settings page and enable authorization for Cverai to send emails on your behalf. This option is located in the second card.",
          {
            action: {
              label: "Authorize now",
              onClick: () =>
                router.push(`/dashboard/settings?tab=ai-applypreference`),
            },
            classNames: {
              actionButton: "!bg-blue-600 hover:!bg-blue-700 !text-white !h-8",
            },
          }
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
      <Card className="p-4 sm:p-7 gap-4">
        <h1 className="font-bold text-xl">Personalized Recommendation</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-4 sm:gap-8">
          {sortedJobs?.map((job) => (
            <div
              key={job.id}
              className="flex bg-slate-50 p-4 sm:p-6 rounded-xl gap-4 sm:gap-6 border border-[#cbd5e1] relative"
            >
              {job?.emailApply && (
                <Sparkles className="absolute bottom-4 left-4 text-gray-200 w-5 h-5" />
              )}
              <div className="shrink-0">
                <img
                  src={!!job.companyLogo ? job.companyLogo : "/placeholder.jpg"}
                  alt=""
                  loading="lazy"
                  className="size-12"
                />
              </div>
              <div className="flex flex-col gap-2 ">
                <h1 className="font-inter line-clamp-1 capitalize">
                  {job.title}
                </h1>

                <DropdownMenu>
                  <DropdownMenuTrigger
                    asChild
                    className="absolute top-4 right-4"
                  >
                    <Button variant="ghost">
                      <MoreHorizontal className="w-4 h-4 text-" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="start">
                    <DropdownMenuItem onClick={() => handleJobClick(job)}>
                      <img src="/cube.svg" className="size-4" alt="" />
                      Auto apply
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        router.push(
                          `/dashboard/jobs/${job.id}?referrer=dashboard&title=${job.title}`
                        );
                      }}
                    >
                      <img src="/preview.svg" className="size-4" alt="" />
                      Preview
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <p className="font-poppins text-cverai-brown text-xs">
                  <span className="max-w-sm overflow-hidden capitalize">
                    {job.companyName}
                  </span>{" "}
                  ·{" "}
                  <span className="font-inter text-gray-400">
                    {!isEmpty(job.salaryInfo) ? job?.salaryInfo : ""}
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
                    {job?.relevanceScore > 40 && (
                      <Badge
                        className={cn(
                          "rounded-full font-epilogue font-semibold text-cverai-orange border-cverai-orange bg-white",
                          " truncate overflow-hidden text-start"
                        )}
                      >
                        {job?.relevanceScore}% match
                      </Badge>
                    )}
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
