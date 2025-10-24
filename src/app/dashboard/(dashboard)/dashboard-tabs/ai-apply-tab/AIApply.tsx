"use client";
import { memo } from "react";
import { AIApplyInput } from "./AIApplyInput";
import { RecentActivityCard } from "../../components/RecentActivityCard";
import {
  //  apiService,
  useAuth,
} from "@/hooks/use-auth";
import { COLLECTIONS } from "@/lib/utils/constants";
import { AIApplyDatatable } from "./AIApplyDatatable";
import { jobsQueries } from "@/lib/queries/jobs.queries";
import { useQuery } from "@tanstack/react-query";

export const AIApply = memo(
  ({ jobDescription }: { jobDescription: string }) => {
    const { useGetAllDoc } = useAuth();

    const filters = {
      page: 1,
      limit: 20,
    };
    const { data } = useGetAllDoc<any[]>(COLLECTIONS.AI_APPLY);

    const MOCK_DATA =
      data?.map((item: any) => ({ ...item.data, id: item?.id })) || [];
    const { data: jobs } = useQuery(jobsQueries.all(filters));

    return (
      <div className="flex flex-col font-poppins relative">
        <h1 className="font-instrument text-3xl text-center tracking-tighter mb-12">
          AI Assist to Apply
        </h1>
        <div className="grid gap-y-16">
          <AIApplyInput jobDescription={jobDescription} />
          <AIApplyDatatable data={MOCK_DATA} jobs={jobs} />
          <RecentActivityCard />
        </div>
      </div>
    );
  }
);
AIApply.displayName = "AIApply";
