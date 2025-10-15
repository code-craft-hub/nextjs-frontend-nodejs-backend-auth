import { TemporaryEmailCompose } from "../../(dashboard)/ai-apply/components/email/TemporaryEmailCompose";
import { ProgressIndicator } from "../../(dashboard)/ai-apply/progress-indicator";

const coverLetterId = async ({
  params,
  searchParams,
}: {
  params: Promise<{ coverLetterId: string }>;
  searchParams: Promise<{
    jobDescription: string;
    documentId: string;
    destinationEmail: string;
    aiApply: string;
  }>;
}) => {
  const { jobDescription, aiApply } = await searchParams;
  const { coverLetterId } = await params;
  console.log(aiApply, "aiApply");
  return (
    <div className="p-4 sm:p-8">
      <ProgressIndicator activeStep={1} />
      <TemporaryEmailCompose
        jobDescription={jobDescription}
        coverLetterId={coverLetterId}
        aiApply={aiApply === "true"}
      />
    </div>
  );
};

export default coverLetterId;
