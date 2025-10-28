"use client";

import { memo, useMemo } from "react";
import { RecentActivityCard } from "../../components/RecentActivityCard";
import { AIJobCustomizationDatatable } from "./AIJobCustomizationDatatable";
import { AIJobCustomizationInput } from "./AIJobCustomizationInput";
import { isEmpty } from "lodash";
import { JobFilters } from "@/lib/types/jobs";
import { useQuery } from "@tanstack/react-query";
import { resumeQueries } from "@/lib/queries/resume.queries";
import { coverLetterQueries } from "@/lib/queries/cover-letter.queries";
import { interviewQuestionQueries } from "@/lib/queries/interview.queries";
import { shuffleArray } from "@/lib/utils/helpers";

export const AIJobCustomization = memo(
  ({ filters }: { filters: JobFilters }) => {
    const { data: resumes } = useQuery(resumeQueries.all(filters));
    const { data: coverLetter } = useQuery(coverLetterQueries.all(filters));
    const { data: interviewQuestion } = useQuery(
      interviewQuestionQueries.all(filters)
    );



  const data = useMemo(() => {
    const merged = [
      ...(interviewQuestion?.data ?? []),
      ...(coverLetter?.data ?? []),
      ...(resumes?.data ?? []),
    ].map((item: any) => ({
      ...item.data,
      id: item?.id,
      _type: item?.type ?? "unknown",
    }));

    return shuffleArray(merged);
  }, [interviewQuestion?.data, coverLetter?.data, resumes?.data]);

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
