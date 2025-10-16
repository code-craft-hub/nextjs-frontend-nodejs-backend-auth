import React from "react";
import { TailorResume } from "./TailorResume";
import { getQueryClient } from "@/lib/query-client";
import { apiService } from "@/hooks/use-auth";
import { COLLECTIONS } from "@/lib/utils/constants";

const TailorResumePage = async ({ searchParams, params }: any) => {
  const { jobDescription, aiApply, coverLetterId,destinationEmail } = await searchParams;
  const { resumeId } = await params;
  const queryClient = getQueryClient();

  queryClient.prefetchQuery({
    queryKey: ["auth", "careerDoc"],
    queryFn: () => apiService.getCareerDoc(resumeId, COLLECTIONS.RESUME),
  });

  return (
    <div>
      <div
        className="absolute w-full h-80 top-0 pointer-events-none"
        style={{
          background: "url('/dashboard-gradient.svg')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center center",
        }}
      />
      <div className="p-4 sm:p-8">
        <TailorResume
          aiApply={aiApply === "true"}
          jobDescription={jobDescription}
          resumeId={resumeId}
          coverLetterId={coverLetterId}
          destinationEmail={destinationEmail}
        />
      </div>
    </div>
  );
};

export default TailorResumePage;
