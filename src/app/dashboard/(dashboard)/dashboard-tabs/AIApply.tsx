"use client";
import { Card } from "@/components/ui/card";
import { memo, useMemo } from "react";
import { DataTable } from "../../components/dashboard-datatable";
import { AIApplyInput } from "../components/AIApplyInput";
import { RecentActivityCard } from "../components/RecentActivityCard";
import { MOCK_DATA } from "../components/constants";

export const AIApply = memo(() => {
  const recentActivityItems = useMemo(
    () => Array.from({ length: 6 }, (_, index) => ({ id: index })),
    []
  );

  return (
    <div className="flex flex-col font-poppins relative">
      <h1 className="font-instrument text-3xl text-center tracking-tighter mb-12">
        AI Assist to Apply
      </h1>
      <div className="grid gap-y-16">
        <AIApplyInput  />
        <DataTable data={MOCK_DATA} />
        <Card className="p-4 sm:p-7 gap-4">
          <h1 className="font-bold text-xl">Recent Activity</h1>
          <div className="grid sm:grid-cols-2 gap-y-4 sm:gap-y-8 gap-x-13">
            {recentActivityItems.map((item) => (
              <RecentActivityCard key={item.id} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
});

AIApply.displayName = "AIApply";
