"use client";
import {
  Contact,
  CreditCard,
  Home,
  LayoutDashboard,
  LogOut,
  PiggyBank,
  Shield,
  User,
  Mail,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { useUserLocation } from "@/hooks/get-user-location";
import { ThemeToggle } from "./mode-toggle-navbar";
import { useRouter } from "next/navigation";
import { useGetCurrentUser } from "@/lib/queries";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/index";
import { useGetPageUrl } from "@/hooks/use-page-url";
import { useAuth } from "@/context/AuthContext";

export const UserMenu = () => {
  const {user} = useAuth();
  const { data: dbUser } = useGetCurrentUser(user);
  console.log("dbUser in user menu", dbUser);
  const { country, flag } = useUserLocation();
  const router = useRouter();

  const { pathname } = useGetPageUrl();
  const Uid = pathname?.split("/")[2];
  console.log(pathname, Uid, dbUser);
  const isAdmin = dbUser?.role === "superadmin";

  const menuItems = [
    {
      icon: <Home />,
      title: "Home",
      isAdmin: true,
      onClick: () => {
        router.push("/");
      },
    },
    {
      icon: <LayoutDashboard />,
      title: "Dashboard",
      isAdmin: true,
      onClick: () => {
        router.push("/dashboard");
      },
    },
    {
      icon: <PiggyBank />,
      title: "Deposit",
      isAdmin: true,
      onClick: () => {
        router.push("/dashboard/deposit");
      },
    },
    {
      icon: <CreditCard />,
      title: "WithDraw",
      isAdmin: true,
      onClick: () => {
        router.push("/dashboard/withdraw");
      },
    },
    {
      icon: <Shield />,
      title: "Admin",
      isAdmin,
      onClick: () => {
        router.push("/admin");
      },
    },
    {
      icon: <Contact />,
      title: "Send Email",
      isAdmin,
      onClick: () => {
        router.push("/admin/email");
      },
    },

    {
      icon: <User />,
      title: "Profile",
      isAdmin: true,
      onClick: () => {
        router.push(`/dashboard/${dbUser?.uid}`);
      },
    },
  ];

  return (
    <div className="flex ">
      <Sheet>
        <SheetTrigger
          asChild
          className="rounded-xl flex items-center gap-2 hover:cursor-pointer mr-4"
        >
          <button className="flex">
            <Avatar className="size-10">
              <AvatarImage src={dbUser?.photoURL as string} alt="@avatar" />
              <AvatarFallback>{dbUser?.firstName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="max-w-[100px] overflow-hidden">
              <div className="text-nowrap font-bold text-sm text-left w-full overflow-hidden max-w-[100px]">
                {dbUser?.firstName} {dbUser?.lastName}
              </div>
              <div className="text-xs flex items-center text-nowrap gap-1">
                {country}{" "}
                <span className="">
                  {flag && (
                    <div className="size-4 shrink-0">
                      <img loading="lazy" src={flag} alt="" />
                    </div>
                  )}
                </span>
              </div>
            </div>
          </button>
        </SheetTrigger>
        <SheetContent className="w-78">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <div className="">
            <div className="flex items-center gap-3  p-4">
              <Avatar className="size-10">
                <AvatarImage src={dbUser?.photoURL as string} alt="@avatar" />
                <AvatarFallback>{dbUser?.firstName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 max-w-[190px] overflow-hidden">
                  <h3 className="font-semibold text-nowrap overflow-hidden">
                    {dbUser?.firstName} {dbUser?.lastName}
                  </h3>
                  <span className="-mb-2">
                    {flag && (
                      <div className="size-4 shrink-0">
                        <img loading="lazy" src={flag} alt="" />
                      </div>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>{dbUser?.email}</span>
                  <Mail className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
                </div>
              </div>
            </div>

            {/* <div className="px-4">
              <div className="flex bg-gray-100 dark:bg-zinc-900 rounded-lg p-1 mb-6 ">
                <button className="flex-1 py-2 px-4 text-sm font-medium bg-white dark:bg-zinc-800 rounded-md shadow-sm">
                  Crypto
                </button>
                <button className="flex-1 py-2 px-4 text-sm font-medium ">
                  Bank
                </button>
              </div>
            </div> */}

            <SheetClose className="w-full">
              {menuItems?.map((item) => {
                return item.isAdmin ? (
                  <div
                    key={item.title}
                    onClick={() => item.onClick()}
                    className="flex items-center gap-3 p-3 px-4 hover:bg-muted cursor-pointer border-t"
                  >
                    <span className=" font-medium">{item.icon}</span>
                    <span className=" font-medium">{item.title}</span>
                  </div>
                ) : null;
              })}
            </SheetClose>
            <div className="flex items-center gap-3 p-3 px-4  hover:bg-muted cursor-pointer border-t">
              <ThemeToggle />
            </div>
            <div
              onClick={() => {
                signOut(auth);
              }}
              className="flex items-center gap-3 p-3 px-4  hover:bg-muted cursor-pointer border-t border-b"
            >
              <LogOut /> Logout
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
