import { X } from "lucide-react";
import { FaCircleCheck } from "react-icons/fa6";
import { UploadedFile } from "@/types";
import { isEmpty } from "lodash";

export const FileUploadForm = ({
  uploadedFiles,
  setUploadedFiles,
}: {
  uploadedFiles: UploadedFile | null;
  setUploadedFiles: React.Dispatch<React.SetStateAction<UploadedFile | null>>;
  isProcessing: boolean;
}) => {
  const removeFile = () => {
    setUploadedFiles(null);
  };


  const isSelectedFile = !isEmpty(uploadedFiles);

  return (
    <div>
      {isSelectedFile && (
        <div className="flex gap-4 overflow-x-auto ">
          <div className="relative flex-shrink-0 h-20  rounded-lg overflow-hidden bg-[#EEF1F7] ml-2 items-center justify-center flex">
            {uploadedFiles.type === "image" && (
              <button
                type="button"
                onClick={() => removeFile()}
                className="absolute top-2 right-2 z-10 bg-white rounded-full p-1 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4 text-gray-700" />
              </button>
            )}

            {uploadedFiles.type === "image" ? (
              <img
                src={uploadedFiles.preview}
                alt={`Upload`}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-start  isolate w-full bg-[#EEF1F7]">
                <div className="flex flex-row flex-wrap items-start content-start  w-full">
                  <div className="flex flex-row items-center gap-2 p-2">
                    <img src="/pdf-view.svg" alt="pdf" className="size-6" />

                    <div className="flex flex-col items-start gap-[7.76px] flex-none">
                      <div
                        className="font-medium text-xs text-wrap font-inter"
                        // style={{
                        //   fontFamily: "Inter, system-ui, sans-serif",
                        //   color: "#292D32",
                        // }}
                      >
                        {uploadedFiles?.file?.name}
                      </div>

                      <div className="flex flex-row items-start gap-[4.85px]">
                        <span
                          className="font-normal text-[12.12px] leading-[15px]"
                          style={{
                            fontFamily: "Inter, system-ui, sans-serif",
                            color: "#A9ACB4",
                          }}
                        >
                          {(uploadedFiles?.file?.size ?? 0) / 1000} MB •
                        </span>

                        <div className="flex flex-row items-center gap-[4.85px]">
                          <FaCircleCheck
                            className="w-[11.63px] h-[11.63px] flex-none"
                            style={{ color: "#3EBF8F" }}
                            fill="#3EBF8F"
                          />
                          <span
                            className="font-normal text-[12.12px] leading-[15px]"
                            style={{
                              fontFamily: "Inter, system-ui, sans-serif",
                              color: "#292D32",
                            }}
                          >
                            Completed
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      removeFile();
                    }}
                    className="mt-3 mr-2 flex-none cursor-pointer"
                    aria-label="Delete file"
                  >
                    <img src="/trash.svg" alt="trash" className="" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
