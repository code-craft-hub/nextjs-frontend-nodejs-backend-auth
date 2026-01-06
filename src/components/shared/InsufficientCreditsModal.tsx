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
import { useUpdateUserMutation } from "@/lib/mutations/user.mutations";
import { userQueries } from "@/lib/queries/user.queries";
import { formatFirestoreDate } from "@/lib/utils/helpers";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function InsufficientCreditsModal() {
  const router = useRouter();
  const updateUser = useUpdateUserMutation();

  const { data: user } = useQuery(userQueries.detail());
  const isCreditExpired =
    user?.expiryTime === undefined
      ? true
      : new Date(formatFirestoreDate(user?.expiryTime)) < new Date();

  useEffect(() => {
    if (isCreditExpired) {
      console.warn(`${user?.firstName} has insufficient credits.`);
      updateUser.mutate({
        data: {
          credit: 0,
          isPro: false,
        },
      });
    }
  }, []);

  return (
    isCreditExpired && (
      <AlertDialog defaultOpen>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex-between">
              {/* <p className="p-16-semibold text-dark-400">Insufficient Credits</p> */}
              <AlertDialogCancel
                className="bg-transparent border-0"
                onClick={() => router.push("/dashboard/account?tab=billing")}
              >
                <img
                  src="/assets/icons/close.svg"
                  alt="credit coins"
                  width={24}
                  height={24}
                  className="cursor-pointer"
                />
              </AlertDialogCancel>
            </div>

            <img
              src="/assets/images/stacked-coins.png"
              alt="credit coins"
              width={462}
              height={122}
            />

            <AlertDialogTitle className="p-24-bold text-dark-600">
              Oops.... Looks like you&#39;ve run out of free credits!
            </AlertDialogTitle>

            <AlertDialogDescription className="p-16-regular py-3">
              No worries, though - you can keep enjoying our services by
              upgrading or refer Cver AI to someone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              className="button w-full bg-blue-400  bg-cover"
              onClick={() => router.push("/dashboard/account?tab=billing")}
            >
              Upgrade or Refer a friend.
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  );
}
