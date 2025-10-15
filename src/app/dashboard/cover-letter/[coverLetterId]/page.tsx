import { TemporaryEmailCompose } from "../../(dashboard)/ai-apply/components/email/TemporaryEmailCompose";
import { ProgressIndicator } from "../../(dashboard)/ai-apply/progress-indicator";

const CoverLetterId = async ({
  params,
  searchParams,
}: {
  params: Promise<{ coverLetterId: string }>;
  searchParams: Promise<{
    jobDescription: string;
    documentId: string;
    destinationEmail: string;
  }>;
}) => {
  const { jobDescription } = await searchParams;
  const { coverLetterId } = await params;
  return (
    <div className="p-4 sm:p-8">
      Cover Letter ID: {coverLetterId}
      <ProgressIndicator activeStep={1} />
      <TemporaryEmailCompose
        jobDescription={jobDescription}
        coverletterId={coverLetterId}
      />
    </div>
  );
};

export default CoverLetterId;