import { ResumeGenerator } from "../../(dashboard)/ai-apply/components/resume/ResumeGenerator";
import { ProgressIndicator } from "../../(dashboard)/ai-apply/progress-indicator";

const ResumeId = async ({
  params,
  searchParams,
}: {
  params: Promise<{ resumeId: string }>;
  searchParams: Promise<{
    jobDescription: string;
    documentId: string;
  }>;
}) => {
  const { jobDescription } = await searchParams;
  const { resumeId } = await params;
  return (
    <div className="p-4 sm:p-8">
      <ProgressIndicator activeStep={2} />
      <ResumeGenerator jobDescription={jobDescription} resumeId={resumeId} />
    </div>
  );
};

export default ResumeId;
