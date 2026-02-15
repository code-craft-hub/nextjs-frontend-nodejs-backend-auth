import { useState } from "react";
import axios from "axios";
import { BASEURL } from "@/lib/api/client";
import { IUser } from "@/types";
import { Button } from "@/components/ui/button";
import { DownloadIcon, Loader } from "lucide-react";

interface ResumeDownloadButtonProps {
  resumeData: Partial<IUser>;
  className?: string;
}

export const ResumeDownloadButton: React.FC<ResumeDownloadButtonProps> = ({
  resumeData,
  className = "",
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      setError(null);

      const response = await axios.post(
        BASEURL + "/download-generated-resume",
        resumeData,
        {
          responseType: "blob", // Important: tells axios to expect binary data
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true, // Include cookies for authentication if needed
        },
      );

      // Create a blob from the PDF data
      const blob = new Blob([response.data], { type: "application/pdf" });

      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary anchor element and trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = `${resumeData.firstName} ${
        resumeData.lastName || "resume"
      } ${(resumeData as any)?.title} resume.pdf`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      setError(
        axios.isAxiosError(err) && err.response?.data?.error
          ? err.response.data.error
          : "Failed to download resume. Please try again.",
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        onClick={handleDownload}
        disabled={isDownloading}
        variant={"outline"}
        className={`
          ${isDownloading ? "bg-gray-400 cursor-not-allowed" : ""}
          ${className}
        `}
      >
        {isDownloading ? (
          <Loader className="size-4" />
        ) : (
          <DownloadIcon className="size-4" />
        )}
      </Button>

      {error && (
        <div className="text-red-600 text-sm text-center max-w-md">{error}</div>
      )}
    </div>
  );
};
