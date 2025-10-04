"use client";
import {  LogOut, Mail } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { useUserLocation } from "@/hooks/get-user-location";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { IUser } from "@/types";
import HomeIcon from "./icons/homeIcon";
import JobIcon from "./icons/jobIcon";
import AnalyticIcon from "./icons/analyticIcon";
import SettingIcon from "./icons/settingIcon";
import UserIcon from "./icons/userIcon";

export const UserMenu = ({ initialUser }: { initialUser: Partial<IUser> }) => {
  const { user, logout } = useAuth();
  const dbUser = { ...initialUser, ...user };
  const { flag } = useUserLocation();
  const router = useRouter();

  const menuItems = [
    {
      title: "Home",
      icon: HomeIcon,
      url: "/dashboard/home",
    },
    {
      title: "Jobs",
      icon: JobIcon,
      url: "/dashboard/jobs",
    },
    {
      title: "Analytics",
      icon: AnalyticIcon,
      url: "/dashboard/analytics",
    },
    {
      title: "Settings",
      icon: SettingIcon,
      url: "/dashboard/settings",
    },
    {
      title: "Account",
      icon: UserIcon,
      url: "/dashboard/account",
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
              <AvatarFallback>
                {dbUser?.firstName?.charAt(0)}
                {dbUser?.lastName?.charAt(0)}{" "}
              </AvatarFallback>
            </Avatar>
          </button>
        </SheetTrigger>
        <SheetContent className="w-78">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <div className="">
            <div className="flex items-center gap-3  p-4">
              <Avatar className="size-10">
                <AvatarImage src={dbUser?.photoURL as string} alt="@avatar" />
                <AvatarFallback>
                  {dbUser?.firstName?.charAt(0)}
                  {dbUser?.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 max-w-[190px] overflow-hidden">
                  <h3 className="font-semibold text-nowrap overflow-hidden">
                    {dbUser?.firstName}
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

            <SheetClose className="w-full">
              {menuItems?.map(({ title, url, icon: Icon }) => {
                return (
                  <div
                    key={title}
                    onClick={() => router.push(url)}
                    className="flex items-center gap-3 p-3 px-4 hover:bg-muted cursor-pointer border-t group hover:cursor-pointer"
                  >
                      <Icon className="group-hover:text-primary"/>
                    <span className="group-hover:text-primary font-medium">{title}</span>
                  </div>
                );
              })}
            </SheetClose>

            <div
              onClick={() => {
                logout();
              }}
              className="flex hover:text-primary font-medium items-center gap-3 p-3 px-4  hover:bg-muted cursor-pointer border-t border-b"
            >
              <LogOut /> Logout
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
