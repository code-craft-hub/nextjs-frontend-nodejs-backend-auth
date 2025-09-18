import { useState } from "react";
import { ActionProps } from "@/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { stripeSpecialCharacters } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import {
  useDataSource,
  useQuestions,
  UseCV,
  useCoverLetter,
  useGetCurrentUser,
} from "@/lib/react-query/queries";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";

const Action = ({
  documentType,
  documentName,
  baseLink,
  genTableId,
  documentIndex,
}: ActionProps) => {
  const navigate = useNavigate();
  const { user:dbUser } = useAuth();
  const [deleteActionDialog, setDeleteActionDialog] = useState(false);
  const handleDeleteActionDialog = () => {
    setDeleteActionDialog(!deleteActionDialog);
  };
  const [alertActionDialog, setAlertActionDialog] = useState(false);
  const handleAlertActionDialog = () => {
    setAlertActionDialog(!alertActionDialog);
  };
  const { mutateAsync: DataSource } = useDataSource();
  const { mutateAsync: QMutation } = useQuestions();
  const { mutateAsync: CLMutation } = useCoverLetter();
  const { mutateAsync: CVMutation } = UseCV();
  const deletePro = async () => {
    try {
      setAlertActionDialog(true);
      if (baseLink == "resume") {
        dbUser?.CV?.splice(documentIndex, 1);
        await CVMutation(dbUser?.CV);
      } else if (baseLink == "question") {
        dbUser?.questions?.splice(documentIndex, 1);
        await QMutation(dbUser?.questions);
      } else if (baseLink == "letter") {
        dbUser?.coverLetterHistory?.splice(documentIndex, 1);
        await CLMutation(dbUser?.coverLetterHistory);
      } else if (baseLink == "profile") {
        dbUser?.dataSource?.splice(documentIndex, 1);
        await DataSource(dbUser?.dataSource);
      }
      toast.success(
        `${stripeSpecialCharacters(documentName)} successfully saved.`
      );
      setTimeout(() => {
        setAlertActionDialog(false);
      }, 5000);
    } catch (error) {
      console.error(error);
      setAlertActionDialog(false);
    } finally {
      setAlertActionDialog(false);
    }
  };
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div>
            <MoreHorizontal className="h-4 w-4 rotate-90" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-32 bg-white">
          <DropdownMenuItem
            className="hover:cursor-pointer"
            onClick={() => {
              navigate(`/dashboard/${baseLink}/${genTableId}`, {
                replace: true,
              });
            }}
          >
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="hover:cursor-pointer"
            onClick={() => {
              navigate(`/dashboard/${baseLink}/${genTableId}`, {
                replace: true,
              });
            }}
          >
            Preview
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setDeleteActionDialog(true);
            }}
          >
            <p className="hover:cursor-pointer text-red-500 hover:text-white ">
              Delete
            </p>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={deleteActionDialog}
        onOpenChange={handleDeleteActionDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              <span className="text-red-500">
                <q>{stripeSpecialCharacters(documentName)}</q>
              </span>{" "}
              {documentType} from our database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                deletePro();
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={alertActionDialog}
        onOpenChange={handleAlertActionDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center flex items-center my-6 justify-center">
              <img src="/assets/icons/BigCheckCircle.svg" />
            </AlertDialogTitle>
            <div>
              <div className="text-green-500 text-[22px] text-center mb-2">
                Action Successful!
              </div>
              <div className="text-center mt-4">
                {documentType} deleted successfully.
              </div>
            </div>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Action;
