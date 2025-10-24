import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { jobsQueries } from "@/lib/queries/jobs.queries";
import { cn } from "@/lib/utils";
import { randomPercentage } from "@/lib/utils/helpers";
import { useQuery } from "@tanstack/react-query";
import { memo } from "react";

const filters = {
  page: 1,
  limit: 20,
};

export const RecentActivityCard = memo(() => {
  const { data: jobs } = useQuery(jobsQueries.all(filters));
  return (
    <Card className="p-4 sm:p-7 gap-4">
      <h1 className="font-bold text-xl">Personalized Recommendation</h1>
      <div className="grid sm:grid-cols-2 gap-y-4 sm:gap-8">
        {jobs?.data.map((job) => (
          <div
            key={job.id}
            className="flex bg-slate-50 p-4 sm:p-6 rounded-xl gap-4 sm:gap-6 border border-[#cbd5e1]"
          >
            <div className="shrink-0">
              <img
                src={job.companyLogo ?? "/company.svg"}
                alt=""
                loading="lazy"
                className="size-12"
              />
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="font-inter line-clamp-1">{job.title}</h1>
              <p className="font-poppins text-cverai-brown text-xs">
                <span className="max-w-sm overflow-hidden">
                  {job.companyName}
                </span>{" "}
                ·{" "}
                <span className="font-inter text-gray-400">
                  Salary: Not disclosed
                </span>
              </p>
              <div className="flex flex-wrap gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    className={cn(
                      "rounded-full font-epilogue font-semibold bg-cverai-teal/10 text-cverai-teal",
                      " truncate overflow-hidden text-start"
                    )}
                  >
                    {job.jobType}
                  </Badge>
                  <div className="bg-slate-500 w-[1px] h-7" />
                  <Badge
                    className={cn(
                      "rounded-full font-epilogue font-semibold text-cverai-blue border-cverai-blue bg-white",
                      " truncate overflow-hidden text-start"
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
                    {randomPercentage()}% match
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
});

RecentActivityCard.displayName = "RecentActivityCard";
