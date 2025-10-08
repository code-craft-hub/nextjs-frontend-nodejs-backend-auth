import React from "react";
import {AIApplyClient} from "./AIApplyClient";

const AIApplyPage = async ({ searchParams }: any) => {
  const { jobDescription } = await searchParams;
  console.log(jobDescription);

  return (
    <div className="p-4 sm:p-8 space-y-4">
      <AIApplyClient jobDescription={jobDescription}/>
    </div>
  );
};

export default AIApplyPage;
