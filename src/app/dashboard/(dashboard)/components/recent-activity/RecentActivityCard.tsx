"use client";

import { memo, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { isEmpty } from "lodash";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { jobsQueries } from "@/lib/queries/jobs.queries";
import { userQueries } from "@/lib/queries/user.queries";
import { JobFilters } from "@/lib/types/jobs";
import { JobWithRecommendation } from "./types";
import { useJobActions } from "./hooks/useJobActions";
import { JobCard } from "./JobCard";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { EmptyRecentActivity } from "./EmptyRecentActivity";

interface RecentActivityCardProps {
  filters: JobFilters;
}

export const RecentActivityCard = memo(function RecentActivityCard({
  filters,
}: RecentActivityCardProps) {
  const { data: jobs, isLoading } = useQuery(jobsQueries.autoApply(filters));
  const { data: user } = useQuery(userQueries.detail());
  const { handleJobClick, handlePreview } = useJobActions();

  console.log("jobs data:", jobs);
  return <div>
    {JSON.stringify(jobs, null, 2)}
  </div>

  // const sortedJobs = useMemo<JobWithRecommendation[]>(() => {
  //   if (!jobs?.data) return [];

  //   const recommendationsData = new Set(
  //     user?.recommendationsData?.map((rec: any) => rec.jobId) || [],
  //   );

  //   const appliedJobs = new Set(
  //     user?.appliedJobs?.map((job: any) => job.id) || [],
  //   );

  //   return jobs.data
  //     .filter((job) => !appliedJobs.has(job.id))
  //     .map((job) => ({
  //       ...job,
  //       isRecommended: recommendationsData.has(job.id),
  //     }));
  // }, [jobs?.data, user?.recommendationsData, user?.appliedJobs]);

  // if (isEmpty(sortedJobs) && !isLoading) {
  //   return <EmptyRecentActivity />;
  // }

  // return (
  //   <Card className={cn("p-4 sm:p-7 gap-4")}>
  //     <h1 className="font-bold text-xl">Personalized Recommendation</h1>
  //     <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-4 sm:gap-8">
  //       {isLoading
  //         ? Array.from({ length: 6 }).map((_, index) => (
  //             <LoadingSkeleton key={index} />
  //           ))
  //         : sortedJobs.map((job) => (
  //             <JobCard
  //               key={job.id}
  //               job={job}
  //               onJobClick={handleJobClick}
  //               onPreview={handlePreview}
  //             />
  //           ))}
  //     </div>
  //   </Card>
  // );
});
