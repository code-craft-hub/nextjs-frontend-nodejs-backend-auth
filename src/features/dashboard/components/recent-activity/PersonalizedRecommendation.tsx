"use client";

import { memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { jobsQueries } from "@/features/jobs/queries/jobs.queries";
import { useJobActions } from "./hooks/useJobActions";
import { JobCard } from "./JobCard";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { EmptyRecentActivity } from "./EmptyRecentActivity";
import { isEmpty } from "lodash";
import { UserFeedbackModal } from "@/shared/components/user-feedback-modal";
import { Button } from "@/components/ui/button";
export type ViewType = "deck" | "list";

export const PersonalizedRecommendation = memo(
  function PersonalizedRecommendation({
    handleViewChange,
  }: {
    handleViewChange?: (value: ViewType) => void;
  }) {
    const { data: jobs, isLoading } = useQuery(jobsQueries.autoApply());
    const { handleJobClick, handlePreview } = useJobActions();

    const recommendations = jobs?.data?.recommendations ?? [];

    console.log("RECOMMENDATIONS : ", jobs?.data)

    const isBuildingRecommendations = isEmpty(recommendations) && !isLoading;

    const renderContent = () => {
      if (isLoading) {
        return Array.from({ length: 6 }).map((_, index) => (
          <LoadingSkeleton key={index} />
        ));
      }

      if (recommendations.length === 0) {
        return <EmptyRecentActivity />;
      }

      return recommendations.map((recommendation, index) => (
        <JobCard
          key={recommendation.id ?? index}
          recommendation={recommendation as any}
          onJobClick={handleJobClick}
          onPreview={handlePreview}
        />
      ));
    };

    return (
      !isBuildingRecommendations && (
        <Card className={cn("p-4 sm:p-7 gap-4")}>
          <div className="flex flex-wrap justify-between gap-4">
            <h1 className="font-bold text-xl">Personalized Recommendation</h1>
            <div className="flex gap-4">
              <Button
              variant={"ghost"}
                onClick={() => {
                  handleViewChange?.("deck");
                }}
              >
                Swipe jobs
              </Button>
              <UserFeedbackModal />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-4 sm:gap-8">
            {renderContent()}
          </div>
        </Card>
      )
    );
  },
);
