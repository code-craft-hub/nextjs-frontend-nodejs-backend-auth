"use client";

import { memo } from "react";
import FindJobClient from "./FindJobClient";

export const FindJob = memo(() => {
  return (
    <div className="flex flex-col font-poppins h-screen relative">
      <h1 className="font-instrument text-3xl text-center tracking-tighter mb-8">
        AI Job Recommendation
      </h1>
      <div className="grid pb-16">
        <FindJobClient />
      </div>
    </div>
  );
});

FindJob.displayName = "FindJob";
