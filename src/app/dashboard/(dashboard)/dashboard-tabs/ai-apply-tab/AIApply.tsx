"use client";
import { Card } from "@/components/ui/card";
import { memo, useMemo } from "react";
import { AIApplyInput } from "./AIApplyInput";
import { RecentActivityCard } from "../../components/RecentActivityCard";
import {
  //  apiService,
  useAuth,
} from "@/hooks/use-auth";
import { COLLECTIONS } from "@/lib/utils/constants";
import { AIApplyDatatable } from "./AIApplyDatatable";

export const AIApply = memo(
  ({ jobDescription }: { jobDescription: string }) => {
    const recentActivityItems = useMemo(
      () => Array.from({ length: 6 }, (_, index) => ({ id: index })),
      []
    );

    const { useGetAllDoc } = useAuth();

    const { data } = useGetAllDoc<any[]>(COLLECTIONS.AI_APPLY);
    // const  jobData  = apiService.getPaginatedDoc<any[]>(COLLECTIONS.JOBS);

    const MOCK_DATA =
      data?.map((item: any) => ({ ...item.data, id: item?.id })) || [];

    return (
      <div className="flex flex-col font-poppins relative">
        <h1 className="font-instrument text-3xl text-center tracking-tighter mb-12">
          AI Assist to Apply
        </h1>
        <div className="grid gap-y-16">
          <AIApplyInput jobDescription={jobDescription} />
          <AIApplyDatatable data={MOCK_DATA} />
          <Card className="p-4 sm:p-7 gap-4">
            <h1 className="font-bold text-xl">Recent Activity</h1>
            <div className="grid sm:grid-cols-2 gap-y-4 sm:gap-y-8 gap-x-13">
              {recentActivityItems.map((item) => (
                <RecentActivityCard
                  key={item.id}
                  // jobData={jobData}
                />
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }
);

AIApply.displayName = "AIApply";
