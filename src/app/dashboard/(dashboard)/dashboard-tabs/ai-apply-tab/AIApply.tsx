"use client";
import { memo } from "react";
import { AIApplyInput } from "./AIApplyInput";
import { RecentActivityCard } from "../../components/RecentActivityCard";
import { AIApplyDatatable } from "./AIApplyDatatable";
import { jobsQueries } from "@/lib/queries/jobs.queries";
import { useQuery } from "@tanstack/react-query";
import { JobFilters } from "@/lib/types/jobs";
import { aiApplyQueries } from "@/lib/queries/ai-apply.queries";

export const AIApply = memo(
  ({
    jobDescription,
    filters,
  }: {
    jobDescription: string;
    filters: JobFilters;
  }) => {
    const { data: aiApply } = useQuery(aiApplyQueries.all(filters));
    const { data: jobs } = useQuery(jobsQueries.all(filters));

    return (
      <div className="flex flex-col font-poppins relative">
        <div className="mb-12">
          <h1 className="font-instrument text-3xl text-center tracking-tighter ">
            AI Assist to Apply
          </h1>
        </div>
        <div className="grid gap-y-8 xl:gap-y-16">
          <AIApplyInput jobDescription={jobDescription} />
          <AIApplyDatatable data={aiApply?.data ?? []} jobs={jobs} />
          <RecentActivityCard />
        </div>
      </div>
    );
  },
);
AIApply.displayName = "AIApply";
