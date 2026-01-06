import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function CompletedPaymentModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
}) {
  const router = useRouter();
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Show Dialog</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Welcome to the 60-Day Job Application Sprint.
          </AlertDialogTitle>
          <AlertDialogDescription>
            {/* <h1 className="font-bold text-md">Step </h1> */}
            <p className="">● Set up your profile Step</p>
            <p className="">● Upload your details once Step</p>
            <p className="">● Start applying daily</p>
            <p className="mt-4 text-xs">
              Your only job now is consistency. We&apos;ll be sharing tips to
              help you maximize your results.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            onClick={() => {
              router.push("/dashboard/home");
            }}
          >
            Let&apos;s Get Started
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
`



`;
