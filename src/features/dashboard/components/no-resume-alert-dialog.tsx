import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { resumeQueries } from "@/features/resume";
import { useQuery } from "@tanstack/react-query";
import { InfoIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export function NoResumeAlertDialog() {
  const router = useRouter();
  const { data: uploadedResumes } = useQuery(resumeQueries.uploaded());

  const handleUploadClick = () => {
    router.push("/dashboard/settings?tab=profile-management");
  };

  if (uploadedResumes && uploadedResumes.length > 0) {
    return null; // Don't show the alert if there are uploaded resumes
  }


  return (
    <div className="absolute top-20 w-full px-4">

    <Alert className="max-w-4xl mx-auto" onClick={handleUploadClick}>
      <InfoIcon />
      <AlertTitle className="max-sm:text-xs">Missing Resume</AlertTitle>
      <AlertDescription className="max-sm:text-2xs">
        You haven't uploaded a resume yet. Please upload one to complete your
        profile.
      </AlertDescription>
    </Alert>
    </div>
  );
}
