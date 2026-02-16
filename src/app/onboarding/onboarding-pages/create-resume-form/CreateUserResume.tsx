import type { ResumeAggregate } from "@/types/resume.types";
import { ResumeFormProvider } from "./ResumeFormContext";
import ResumeFormLayout from "./ResumeFormLayout";

interface CreateUserResumeProps {
  data?: ResumeAggregate | null;
  resumeId?: string | null;
  handleEditClick: (value: boolean) => void;
  onNext?: () => void;
}

const CreateUserResume = ({ data = null, resumeId = null, handleEditClick, onNext }: CreateUserResumeProps) => {
  return (
    <ResumeFormProvider initialData={data} resumeId={resumeId}>
      <ResumeFormLayout handleEditClick={handleEditClick} onNext={onNext} />
    </ResumeFormProvider>
  );
};

export default CreateUserResume;
