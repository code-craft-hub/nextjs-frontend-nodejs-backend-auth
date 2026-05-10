"use client";
import { memo } from "react";
import { AIApplyInput } from "./AIApplyInput";
import { PersonalizedRecommendation } from "@/features/dashboard/components/RecentActivityCard";
import { AIApplyDatatable } from "./AIApplyDatatable";
import { useQuery } from "@tanstack/react-query";
import { autoApplyQueries } from "@/features/auto-apply/queries/auto-apply.queries";
import { ViewType } from "@/features/dashboard/components/Home";

export const AIApply = memo(
  ({ jobDescription, handleViewChange }: { jobDescription: string; handleViewChange: (value: ViewType) => void }) => {
    const { data: aiApply } = useQuery(autoApplyQueries.all());

    return (
      <div className="flex flex-col font-poppins relative">
        <div className="mb-12">
          <h1 className="font-instrument text-3xl text-center tracking-tighter ">
            AI Assist to Apply
          </h1>
        </div>
        <div className="grid gap-y-8">
          <AIApplyInput jobDescription={jobDescription} />
          <AIApplyDatatable data={aiApply?.data ?? []} />
          <PersonalizedRecommendation handleViewChange={handleViewChange} />
        </div>
      </div>
    );
  },
);
AIApply.displayName = "AIApply";
