"use client";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { useAuth } from "@/hooks/use-auth";
import { useUserLocation } from "@/hooks/get-user-location";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { navItems } from "../constants";
import { Button } from "@/components/ui/button";
import { Mail, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { smoothlyScrollToView } from "@/lib/utils/helpers";
export const Header = () => {
  const { user } = useAuth();
  const { flag } = useUserLocation();
  const router = useRouter();

  return (
    <div>
      <header className="fixed w-full top-0 z-50  backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 z-50">
            <div className="flex items-center space-x-2">
              <img src="/logo.svg" alt="" />
            </div>

            <nav className="hidden lg:flex items-center space-x-8 z-50">
              {navItems.map((nav) => (
                <Link
                  key={nav.name}
                  href={nav.url}
                  onClick={(e) => smoothlyScrollToView(e, nav.url)}
                  className="font-semibold font-poppins text-black hover:text-gray-900 transition-colors hover:bg-accent px-4 py-2 rounded-xl"
                >
                  {nav.name}
                </Link>
              ))}
            </nav>
            <div className="hidden lg:flex items-center space-x-4">
              {!!user ? (
                <Button
                  onClick={() => router.push(`/dashboard/home`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-lg"
                >
                  Dashboard
                </Button>
              ) : (
                <Button
                  onClick={() => router.push(`/register`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-lg"
                >
                  Get started
                </Button>
              )}
            </div>

            <Sheet>
              <SheetTrigger asChild className="lg:hidden p-2 rounded-lg">
                <Button variant="ghost">
                  <Menu size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[50%]">
                <SheetTitle className="sr-only">mobile nav</SheetTitle>
                <div className="flex items-center space-x-2 ml-4 mt-4">
                  <img src="/logo.svg" alt="" />
                </div>
                {!!user && (
                  <div className="flex items-center gap-3  p-4">
                    <Avatar className="size-10">
                      <AvatarImage
                        src={user?.photoURL as string}
                        alt="@avatar"
                      />
                      <AvatarFallback>
                        {user?.firstName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 max-w-[190px] overflow-hidden">
                        <h3 className="font-semibold text-nowrap overflow-hidden">
                          {user?.firstName} {user?.lastName}
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
                        <span>{user?.email}</span>
                        <Mail className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
                      </div>
                    </div>
                  </div>
                )}
                <SheetClose className="">
                  {navItems?.map((item) => {
                    return (
                      <div
                        key={item.name}
                        // onClick={() => item.onClick()}
                        className="flex items-center gap-3 p-3 px-4 hover:bg-muted cursor-pointer border-t"
                      >
                        <span className=" font-medium">{item.icon}</span>
                        <span className=" font-medium">{item.name}</span>
                      </div>
                    );
                  })}
                </SheetClose>

                <SheetFooter>
                  <SheetClose asChild>
                    <Button
                      variant="outline"
                      className="text-gray-600 hover:text-gray-900"
                      onClick={() => {
                        router.push("/login");
                      }}
                    >
                      Log in
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button
                      onClick={() => {
                        router.push("/dashboard/home");
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                    >
                      Get started
                    </Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </div>
  );
};
