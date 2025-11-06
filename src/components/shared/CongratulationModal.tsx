import { ProgressIndicator } from "@/app/dashboard/(dashboard)/ai-apply/progress-indicator";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

export const CongratulationModal = ({
  openModal,
  handleOpenModal,
}: {
  openModal: boolean;
  handleOpenModal: (value: boolean) => void;
}) => {
  const router = useRouter();
  return (
    <Dialog open={openModal} onOpenChange={handleOpenModal}>
      <DialogContent className="w-full max-w-none h-[95svh] md:min-w-[40rem] overflow-y-auto">
        <DialogHeader className="gap-4">
          <DialogTitle className="text-center !font-medium text-md">
            Job Application Submitted
          </DialogTitle>
          <ProgressIndicator activeStep={4} />
        </DialogHeader>
        <div className="flex-1 flex items-center justify-center p-8">
          <img
            src="/congratulation.svg"
            className="size-64 ml-8"
            alt="congratulation"
          />
        </div>
        <DialogTitle className="text-center font-">
          Application Sent!
        </DialogTitle>
        <DialogDescription className="text-2xs text-center text-black">
          Check your email's drafts folder for a copy of your application.
        </DialogDescription>
        <DialogFooter className="mt-4 !justify-center">
          <DialogClose asChild>
            <Button
              onClick={() => {
                router.push(`/dashboard/home`);
              }}
              className="sm:px-16 "
            >
              Preview CV/Cover Letter
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
