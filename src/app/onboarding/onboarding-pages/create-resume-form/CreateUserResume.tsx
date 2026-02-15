import type { ResumeAggregate } from "@/types/resume.types";
import { ResumeFormProvider } from "./ResumeFormContext";
import ResumeFormLayout from "./ResumeFormLayout";

interface CreateUserResumeProps {
  data?: ResumeAggregate | null;
  resumeId?: string | null;
}

const CreateUserResume = ({ data = null, resumeId = null }: CreateUserResumeProps) => {
  return (
    <ResumeFormProvider initialData={data} resumeId={resumeId}>
      <ResumeFormLayout />
    </ResumeFormProvider>
  );
};

export default CreateUserResume;
