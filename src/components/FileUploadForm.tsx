import { X, FileText } from "lucide-react";
import { UploadedFile } from "@/types";

export const FileUploadForm = ({
  uploadedFiles,
  setUploadedFiles,
}: {
  uploadedFiles: UploadedFile[];
  setUploadedFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>;
  isProcessing: boolean;
}) => {
  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };


  console.log("Uploaded Files:", uploadedFiles);

  return (
    <div>
      {uploadedFiles.length > 0 && (
        <div className="p-2 flex gap-4 overflow-x-auto ">
          {uploadedFiles.map((uploadedFile, index) => (
            <div
              key={index}
              className="relative flex-shrink-0 w-64 h-40 bg-gray-900 rounded-lg overflow-hidden"
            >
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute top-2 right-2 z-10 bg-white rounded-full p-1 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4 text-gray-700" />
              </button>

              {uploadedFile.type === "image" ? (
                <img
                  src={uploadedFile.preview}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <FileText className="w-12 h-12 text-white mx-auto mb-2" />
                    <p className="text-white text-sm px-2 truncate w-full">
                      {uploadedFile.file.name}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
