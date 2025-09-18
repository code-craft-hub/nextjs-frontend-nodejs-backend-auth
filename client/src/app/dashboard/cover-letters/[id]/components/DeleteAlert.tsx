import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader } from "lucide-react";
import { LetterProps } from "@/types";

export default function DeleteAlert({
  children,
  isPending,
  deletePro,
  documentType,
  allData,
  handleAlertDialog,
  alertDialog,
  handleDeleteDialog,
  deleteDialog,
}: LetterProps) {
  return (
    <div>
      <AlertDialog open={deleteDialog} onOpenChange={handleDeleteDialog}>
        <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              <span className="font-bold text-black" >
                <q>{allData?.key!}</q>
              </span>{" "}
              {documentType} from our database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletePro && deletePro(allData?.genTableId!)}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={alertDialog} onOpenChange={handleAlertDialog}>
        <AlertDialogContent>
          {isPending && (
            <div className=" right-4 top-4 absolute h-8 w-8 ml-auto">
              <Loader className="animate-spin h-8 w-8 " />
            </div>
          )}
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center flex items-center mb-6 justify-center">
              <img src="/assets/icons/BigCheckCircle.svg" />
            </AlertDialogTitle>
            <div>
              <div className="text-green-500 text-[22px] text-center mb-2">
                Action Successful!
              </div>
              <div className="text-center mt-4">
                profile deleted successfully.
              </div>
            </div>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
