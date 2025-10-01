import React from "react";
import JobListingId from "../dashboard/jobs/[id]/components/JobID";
import { Header } from "@/components/landing-page/Header";

const JobListingPage = () => {
  return (
    <div>
      <Header />
      <JobListingId />
    </div>
  );
};

export default JobListingPage;
