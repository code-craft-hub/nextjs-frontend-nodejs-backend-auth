import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useDocumentExtraction } from "@/app/onboarding/onboarding-pages/AnyFormatToText";
const formSchema = z.object({
  message: z.string().optional(),
  file: z.any().optional(),
});

type FormData = z.infer<typeof formSchema>;

type UploadedFile = {
  file: File;
  preview: string;
  type: "image" | "pdf";
};

export const FileUploadForm = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);

  const {
    processDocument,
    // isProcessing,
    // error,
    // currentFile,
    // clearError,
    // clearFile,
  } = useDocumentExtraction();

  const { register, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const fileType = file.type.startsWith("image/") ? "image" : "pdf";
      const reader = new FileReader();

      reader.onload = (e) => {
        const preview = e.target?.result as string;
        setUploadedFiles((prev) => [
          ...prev,
          { file, preview, type: fileType },
        ]);
      };

      reader.readAsDataURL(file);
    });

    event.target.value = "";
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: FormData) => {
    console.log("Form submitted with message:", data.message);

    if (uploadedFiles.length === 0) {
      console.log("No files uploaded");
      return;
    }

    setIsExtracting(true);

    try {
      let extractedText = "";
      console.log(uploadedFiles.length)
      for (const uploadedFile of uploadedFiles) {
        console.log("Processing file:", uploadedFile.file.name);
        const data = await processDocument(uploadedFile.file);
        extractedText = data?.text || "";
      }
      console.log(extractedText);
    } catch (error) {
      console.error("Error extracting text:", error);
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div onSubmit={handleSubmit(onSubmit) as any}>
            {uploadedFiles.length > 0 && (
              <div className="mb-6 flex gap-4 overflow-x-auto pb-2">
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

            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-700 mb-6">
                Let's get started
              </h2>
            </div>

            <div className="flex items-end gap-3">
              <div className="flex-shrink-0">
                <label
                  htmlFor="file-upload"
                  className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-blue-500 text-blue-500 hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <Upload className="w-5 h-5" />
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*,.pdf"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex-grow">
                <Textarea
                  {...register("message")}
                  placeholder="Tailor what?"
                  className="min-h-[48px] resize-none rounded-full px-4 py-3 border-2 border-blue-200 focus:border-blue-400"
                />
              </div>

              <Button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={isExtracting}
                className="flex-shrink-0 h-12 px-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full"
              >
                {isExtracting ? "Extracting..." : "Submit"}
              </Button>

              <button
                type="button"
                className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              >
                <span className="text-xl">↑</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
