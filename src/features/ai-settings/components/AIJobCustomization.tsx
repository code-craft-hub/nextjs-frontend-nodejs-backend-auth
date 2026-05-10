"use client";

import { memo, useMemo } from "react";
import { PersonalizedRecommendation } from "@/features/dashboard/components/RecentActivityCard";
import { AIJobCustomizationDatatable } from "./AIJobCustomizationDatatable";
import { AIJobCustomizationInput } from "./AIJobCustomizationInput";
import { isEmpty } from "lodash";
import { JobFilters } from "@/shared/types/jobs.types";
import { useQuery } from "@tanstack/react-query";
import { resumeQueries } from "@/features/resume/queries/resume.queries";
import { coverLetterQueries } from "@/features/cover-letter/queries/cover-letter.queries";
import { interviewQuestionQueries } from "@/features/interview/queries/interview.queries";
import { shuffleArray } from "@/lib/utils/helpers";
import { ViewType } from "@/features/dashboard/components/Home";

export const AIJobCustomization = memo(
  ({
    filters,
    handleViewChange,
  }: {
    filters: JobFilters;
    handleViewChange: (value: ViewType) => void;
  }) => {
    const { data: resumes } = useQuery(resumeQueries.all(filters));
    const { data: coverLetter } = useQuery(coverLetterQueries.all(filters));
    const { data: interviewQuestion } = useQuery(
      interviewQuestionQueries.all(filters),
    );

    const data = useMemo(() => {
      const merged = [
        ...(interviewQuestion?.data ?? []),
        ...(coverLetter?.data ?? []),
        ...(resumes?.data ?? []),
      ];

      return shuffleArray(merged);
    }, [interviewQuestion?.data, coverLetter?.data, resumes?.data]);

    return (
      <div className="flex flex-col font-poppins h-screen relative">
        <h1 className="font-instrument text-3xl text-center tracking-tighter mb-12">
          AI Job Document Customization
        </h1>

        <div className="grid gap-y-8 pb-16">
          <AIJobCustomizationInput />
          {isEmpty(data) ? null : (
            <AIJobCustomizationDatatable data={data ?? []} />
          )}
          <PersonalizedRecommendation handleViewChange={handleViewChange} />
        </div>
      </div>
    );
  },
);

AIJobCustomization.displayName = "AIJobCustomization";
