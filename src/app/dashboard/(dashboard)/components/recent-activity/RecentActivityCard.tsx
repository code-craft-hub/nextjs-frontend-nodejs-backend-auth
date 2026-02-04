"use client";

import { memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { jobsQueries } from "@/lib/queries/jobs.queries";
import { JobFilters } from "@/lib/types/jobs";
import { useJobActions } from "./hooks/useJobActions";
import { JobCard } from "./JobCard";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { EmptyRecentActivity } from "./EmptyRecentActivity";
import { isEmpty } from "lodash";

interface RecentActivityCardProps {
  filters: JobFilters;
}

export const RecentActivityCard = memo(function RecentActivityCard({
  filters,
}: RecentActivityCardProps) {
  const { data: jobs, isLoading } = useQuery(jobsQueries.autoApply(filters));
  const { handleJobClick, handlePreview } = useJobActions();

  const recommendations = jobs?.data?.recommendations ?? [];

  const isBuildingRecommendations = isEmpty(recommendations) && !isLoading;

  console.log("Recommendations:", recommendations);
  const renderContent = () => {
    if (isLoading) {
      return Array.from({ length: 6 }).map((_, index) => (
        <LoadingSkeleton key={index} />
      ));
    }

    if (recommendations.length === 0) {
      return <EmptyRecentActivity />;
    }

    return recommendations.map((recommendation) => (
      <JobCard
        key={recommendation.id}
        recommendation={recommendation}
        onJobClick={handleJobClick}
        onPreview={handlePreview}
      />
    ));
  };

  return (
    !isBuildingRecommendations && (
      <Card className={cn("p-4 sm:p-7 gap-4")}>
        <h1 className="font-bold text-xl">Personalized Recommendation</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-4 sm:gap-8">
          {renderContent()}
        </div>
      </Card>
    )
  );
});
