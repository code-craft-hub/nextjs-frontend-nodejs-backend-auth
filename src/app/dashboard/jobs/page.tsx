import React from "react";
import { Jobs } from "./components/Jobs";
import { requireOnboarding } from "@/lib/server-auth";

const JobListingsPage = async () => {
   await requireOnboarding();

  return (
    <div>
      <Jobs />
    </div>
  );
};

export default JobListingsPage;
