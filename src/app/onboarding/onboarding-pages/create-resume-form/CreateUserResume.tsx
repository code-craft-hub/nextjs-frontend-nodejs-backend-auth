import type { ResumeAggregate } from "@/types/resume.types";
import { ResumeFormProvider } from "./ResumeFormContext";
import ResumeFormLayout from "./ResumeFormLayout";

interface CreateUserResumeProps {
  data?: ResumeAggregate | null;
  resumeId?: string | null;
  handleEditClick: (value: boolean) => void;
}

const CreateUserResume = ({ data = null, resumeId = null, handleEditClick }: CreateUserResumeProps) => {
  return (
    <ResumeFormProvider initialData={data} resumeId={resumeId}>
      <ResumeFormLayout handleEditClick={handleEditClick} />
    </ResumeFormProvider>
  );
};

export default CreateUserResume;
