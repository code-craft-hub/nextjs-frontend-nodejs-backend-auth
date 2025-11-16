import { ProgressIndicator } from "@/app/dashboard/(dashboard)/ai-apply/progress-indicator";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

import { useRouter } from "next/navigation";

export const CongratulationModal = ({ handleOpenModal }: any) => {
  const router = useRouter();
  return (
    <div className="bg-white rounded-lg relative !py-14 shadow-lg p-4 sm:p-6">
      <div className="gap-6 flex flex-col">
        <div className="text-center !font-medium text-md">
          Job Application Submitted
        </div>
        <ProgressIndicator activeStep={4} />
      </div>
      <X
        className="absolute top-4 right-4 hover:cursor-pointer hover:text-blue-500 text-gray-300"
        onClick={() => handleOpenModal(false)}
      />
      <div className="flex-1 flex items-center my-16 justify-center">
        <img
          src="/congratulation.svg"
          className="size ml-8"
          alt="congratulation"
        />
      </div>
      <div className="text-center font-bold font-inter tracking-wide text-lg">
        Application Sent!
      </div>
      <div className="text-xs mt-4 text-center text-black font-inter">
        Check your email&apos;s drafts folder for a copy of your application.
      </div>
      <div className="mt-8 justify-center w-full flex">
        <Button
          onClick={() => {
            router.push(`/dashboard/home`);
          }}
          className="max-sm:w-full sm:px-20 "
        >
          Preview CV/Cover Letter
        </Button>
      </div>
    </div>
  );
};
