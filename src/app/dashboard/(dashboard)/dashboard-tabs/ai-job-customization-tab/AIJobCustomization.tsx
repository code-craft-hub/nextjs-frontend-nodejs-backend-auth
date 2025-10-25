"use client";

import { memo, useMemo } from "react";
import { RecentActivityCard } from "../../components/RecentActivityCard";
import { AIJobCustomizationDatatable } from "./AIJobCustomizationDatatable";
import { AIJobCustomizationInput } from "./AIJobCustomizationInput";
import { useAuth } from "@/hooks/use-auth";
import { COLLECTIONS } from "@/lib/utils/constants";
import { CoverLetter, InterviewQuestion, Resume } from "@/types";
import { isEmpty } from "lodash";
import { JobFilters } from "@/lib/types/jobs";

export const AIJobCustomization = memo(
  ({ filters }: { filters: JobFilters }) => {
    const { useGetAllDoc } = useAuth();
    const { data: INTERVIEW_QUESTION } = useGetAllDoc<InterviewQuestion[]>(
      COLLECTIONS.INTERVIEW_QUESTION
    );
    const { data: COVER_LETTER } = useGetAllDoc<CoverLetter[]>(
      COLLECTIONS.COVER_LETTER
    );
    const { data: RESUME } = useGetAllDoc<Resume[]>(COLLECTIONS.RESUME);

    const data = useMemo(() => {
      return (
        [
          ...(INTERVIEW_QUESTION ?? []),
          ...(COVER_LETTER ?? []),
          ...(RESUME ?? []),
        ]?.map((item: any) => ({ ...item.data, id: item?.id })) || []
      );
    }, [INTERVIEW_QUESTION, COVER_LETTER, RESUME]);

    return (
      <div className="flex flex-col font-poppins h-screen relative">
        <h1 className="font-instrument text-3xl text-center tracking-tighter mb-12">
          AI Job Document Customization
        </h1>

        <div className="grid gap-y-16">
          <AIJobCustomizationInput />
          {isEmpty(data) ? null : <AIJobCustomizationDatatable data={data} />}
          <RecentActivityCard filters={filters} />
        </div>
      </div>
    );
  }
);

AIJobCustomization.displayName = "AIJobCustomization";
