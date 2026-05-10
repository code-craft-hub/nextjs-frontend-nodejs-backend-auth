"use client";
import { memo } from "react";
import { AIApplyInput } from "./AIApplyInput";
import { ViewType } from "@/features/dashboard/components/Home";
import { Button } from "@/components/ui/button";

export const AIApply = memo(
  ({
    jobDescription,
    handleViewChange,
  }: {
    jobDescription: string;
    handleViewChange: (value: ViewType) => void;
  }) => {

    return (
      <div className="flex flex-col font-poppins relative">
        <div className="mb-12">
          <h1 className="font-instrument text-3xl text-center tracking-tighter ">
            AI Assist to Apply
          </h1>
        </div>
        <div className="grid gap-y-8">
          <AIApplyInput jobDescription={jobDescription} />
          <div className="w-full flex items-center justify-center">
            <Button
              onClick={() => {
                handleViewChange("deck");
              }}
              className="font-poppins rounded-[50px] text-md p-6"
            >
              Swipe jobs
            </Button>
          </div>
          {/* <AIApplyDatatable data={aiApply?.data ?? []} /> */}
          {/* <PersonalizedRecommendation handleViewChange={handleViewChange} /> */}
        </div>
      </div>
    );
  },
);
AIApply.displayName = "AIApply";
