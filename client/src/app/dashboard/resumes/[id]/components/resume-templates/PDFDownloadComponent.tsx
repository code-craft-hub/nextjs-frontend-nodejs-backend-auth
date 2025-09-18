import { useState } from "react";
import { Loader2 } from "lucide-react";
import { DBUserT } from "@/types";
import { PiDownloadSimpleBold } from "react-icons/pi";
import { Button } from "@/components/ui/button";
import { downloadResumePdf } from "@/lib/api/endpoints/resume/generate-resume";

const PDFDownloadComponent = ({
  userDataDB,
}: {
  userDataDB: DBUserT | undefined;
}) => {
  console.log(userDataDB);
  const [isLoading, setIsLoading] = useState(false);

  const handleDownloadPDF = async () => {
    setIsLoading(true);

    try {
      const response = await downloadResumePdf(userDataDB);
      console.log(response);
      if (!response.statusText) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the PDF blob
      const blob = await response.data;

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${userDataDB?.firstName} ${userDataDB?.lastName}.pdf`;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleDownloadPDF}
      variant="outline"
      className="!p-2 sm:!px-4 hover:scale-90"
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          <PiDownloadSimpleBold className="text-blueColor w-6 h-6 md:hiden" />
          <span className="hidden md:fle">Download</span>
        </>
      )}
    </Button>
  );
};

export default PDFDownloadComponent;
