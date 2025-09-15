import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IoIosInfinite } from "react-icons/io";
import { menuItemsT } from "@/types";
import { MdOutlineAdminPanelSettings } from "react-icons/md";
import { useGetCurrentUser, useSignOutAccount } from "@/lib/queries";
import { useRouter } from "next/navigation";
import { contextUser } from "@/lib/utils/constants";
import { menuItems } from "@/constants/jobs-data";
import { useAuth } from "@/context/AuthContext";
export default function AvatarComponent() {
  const { user } = useAuth();
  const { data: dbUser } = useGetCurrentUser(user);
  const router = useRouter();
  const { mutateAsync: signOutAccount } = useSignOutAccount();
  const signOut = async () => {
    try {
      await signOutAccount();
      localStorage.removeItem("array");
      localStorage.clear();
      router.push("/");
    } catch (error) {
      console.error(error);
    }
  };
  const email = user?.email;
  const adminEmail = ["onlinehassle1234@gmail.com", "odafe25@gmail.com"];
  const Email = email?.split("@");
  const firstName = dbUser?.firstName?.substring(0, 1);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="hover:cursor-pointer">
          <div className="flex items-center justify-center gap-2">
            <div className="flex flex-col lg:flex-row items-center">
              <div className="w-12 h-12 rounded-full cursor-pointer flex items-center justify-center relative overflow-hidden">
                <Avatar>
                  <AvatarImage
                    src={dbUser?.firestoreProfileImage || dbUser?.photoURL}
                  />
                  <AvatarFallback>{firstName}</AvatarFallback>
                </Avatar>
              </div>
              <div className="hidden lg:block ml-2">
                <p className="capitalize text-black text-nowrap truncate overflow-hidden max-w-[155px]">
                  {dbUser?.firstName || contextUser.firstName}{" "}
                  {contextUser.lastName || dbUser?.lastName}
                </p>
                <p className="text-gray-300 text-[12px] -mt-1">
                  {Email && Email[0]?.substring(0, 5)}
                  {Email && Email[0].length > 6 && "..."}
                  {"@"}
                  {Email && Email[1]}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 !p-0 !py-2">
        <div className="flex flex-col ">
          <div className="px-2">
            <DropdownMenuLabel>{dbUser?.firstName}</DropdownMenuLabel>
            <div className="line-clamp-1 text-wrap text-sm ml-2">
              {dbUser?.email}
            </div>
          </div>
          <DropdownMenuSeparator />
          <div className=" w-full ">
            <div className="flex border-1 gap-0.5  p-0.5 place-items-center h-full  bg-gray-50 py-2 text-sm sm:text-md px-4">
              {dbUser?.credit <= 5 ? (
                <div>
                  You have{" "}
                  <span className="px-1 font-robotoBold text-black">
                    {dbUser?.credit}
                  </span>{" "}
                  credit remaining
                </div>
              ) : (
                <div className="flex justify-center items-center">
                  You have{" "}
                  <span className="px-1 font-robotoBold text-blue-500">
                    <IoIosInfinite className="w-5 h-5" />
                  </span>{" "}
                  credit
                </div>
              )}
            </div>
          </div>
        </div>
        {adminEmail?.includes(email!) && (
          <>
            <DropdownMenuSeparator />
            <div
              onClick={() => router.push("/admin")}
              className="px-4 flex gap-1 hover:cursor-pointer hover:font-bold"
            >
              <MdOutlineAdminPanelSettings className="h-5 w-5" />
              <p className="">Admin</p>
            </div>
          </>
        )}

        <div className="px-2">
          {menuItems.map(
            ({ last, title, icon, link }: menuItemsT, index: number) => {
              const Icon = icon;
              return (
                <div key={index}>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="flex my-1 gap-2 hover:cursor-pointer hover:underline"
                    onClick={() => {
                      if (last) {
                        signOut();
                      } else {
                        if (!link) return;
                        router.push(link);
                      }
                    }}
                  >
                    <div className={`${last ? "text-red-500" : ""}`}>
                      {Icon && <Icon className="w-4 h-4" />}
                    </div>
                    <div
                      className={`${
                        last ? "text-red-500" : ""
                      } hover:font-bold`}
                    >
                      {title}
                    </div>
                    {index === 2 && (
                      <div className="ml-auto">
                        <div className="size-2 bg-green-500 animate-ping rounded-full" />
                      </div>
                    )}
                  </DropdownMenuItem>
                </div>
              );
            }
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
