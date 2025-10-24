"use client";
import { Card } from "@/components/ui/card";

import { memo, useMemo } from "react";
import { RecentActivityCard } from "../../components/RecentActivityCard";
import { AIJobCustomizationDatatable } from "./AIJobCustomizationDatatable";
import { AIJobCustomizationInput } from "./AIJobCustomizationInput";
import { useAuth } from "@/hooks/use-auth";
import { COLLECTIONS } from "@/lib/utils/constants";
import { CoverLetter, InterviewQuestion, Resume } from "@/types";

export const AIJobCustomization = memo(() => {
  const { useGetAllDoc } = useAuth();
  const { data: INTERVIEW_QUESTION } = useGetAllDoc<InterviewQuestion[]>(
    COLLECTIONS.INTERVIEW_QUESTION
  );
  const { data: COVER_LETTER } = useGetAllDoc<CoverLetter[]>(
    COLLECTIONS.COVER_LETTER
  );
  const { data: RESUME } = useGetAllDoc<Resume[]>(COLLECTIONS.RESUME);

  const data = useMemo(() => {
    return [
      ...(INTERVIEW_QUESTION ?? []),
      ...(COVER_LETTER ?? []),
      ...(RESUME ?? []),
    ]?.map((item: any) => ({ ...item.data, id: item?.id })) || [];
  }, [INTERVIEW_QUESTION, COVER_LETTER, RESUME]);


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
        <AIJobCustomizationInput />
        <AIJobCustomizationDatatable data={data} />
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

AIJobCustomization.displayName = "AIJobCustomization";
