"use client";
import { InitialUser } from "@/types";
import { Card } from "@/components/ui/card";

import { memo, useMemo } from "react";
import { RecentActivityCard } from "./RecentActivityCard";
import { MOCK_DATA_TAILOR_RESUME } from "./constants";
import { TailorResumeDatatable } from "./TailorResumeDatatable";
import { TailorResumeInput } from "./TailorResumeInput";

export const TailorResume = memo(({ initialUser }: InitialUser) => {
  const recentActivityItems = useMemo(
    () => Array.from({ length: 6 }, (_, index) => ({ id: index })),
    []
  );

  return (
    <div className="flex flex-col font-poppins h-screen relative">
      <h1 className="font-instrument text-3xl text-center tracking-tighter mb-12">
        AI Job Document Customization
      </h1>

      <div className="grid gap-y-16">
        <TailorResumeInput initialUser={initialUser} />
        <TailorResumeDatatable data={MOCK_DATA_TAILOR_RESUME} />
        <Card className="p-4 sm:p-7 gap-4">
          <h1 className="font-bold text-xl">Recent Activity</h1>
          <div className="grid sm:grid-cols-2 gap-y-4 sm:gap-y-8 gap-x-13">
            {recentActivityItems.map((item) => (
              <RecentActivityCard
                key={item.id}
                // item={item} index={item.id}
              />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
});

TailorResume.displayName = "TailorResume";
