import React from "react";
import Resume from "./components/Resume";
interface PageProps {
  searchParams: Promise<{ [key: string]: string }>;
}
const ResumePage = async ({ searchParams }: PageProps) => {
  const profileInput = (await searchParams).jobDescription;
  const jobDescription = JSON?.parse(profileInput)?.jobDescription;
  console.log(jobDescription);
  return (
    <div>
      <Resume jobDescription={jobDescription} />{" "}
    </div>
  );
};

export default ResumePage;
