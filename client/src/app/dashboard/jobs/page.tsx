import React from "react";
// import { JobListings } from "./components/JobListing";
import { Jobs } from "./components/Jobs";
import { requireOnboarding } from "@/lib/server-auth";

const JobListingsPage = async () => {
  const session = await requireOnboarding();

  return (
    <div>
      <Jobs initialUser={session} />
    </div>
  );
};

export default JobListingsPage;
