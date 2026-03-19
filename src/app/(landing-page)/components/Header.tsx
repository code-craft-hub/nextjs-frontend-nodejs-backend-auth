"use client";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { navItems } from "../constants";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { smoothlyScrollToView } from "@/lib/utils/helpers";
import { useState } from "react";
import { IUser } from "@/types";
import { useUserQuery } from "@features/user";

export const Header = ({
  user,
}: {
  user?: Partial<IUser> | null;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [modal, setModal] = useState(false);
  const { data: currentUser } = useUserQuery();

  const isAuthenticated = !!currentUser || !!user;

  // Handle navigation: if not on homepage, go to homepage first then scroll to anchor
  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    navUrl: string,
  ) => {
    e.preventDefault();

    // Check if we're on the homepage
    const isHomepage = pathname === "/" || pathname === "";

    if (!isHomepage) {
      // Not on homepage, so navigate to homepage with the anchor
      router.push(`/${navUrl}`);
    } else {
      // Already on homepage, just scroll to the anchor
      smoothlyScrollToView(e, navUrl);
    }
  };

  return (
    <div>
      <header className="fixed w-full top-0 z-50  backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 z-50">
            <div className="flex items-center space-x-2">
              <img src="/cverai-logo.png" className="w-28 h-8" alt="" />
            </div>

            <nav className="hidden lg:flex items-center space-x-8 z-50">
              {navItems.map((nav) => (
                <Link
                  key={nav.name}
                  href={nav.url}
                  onClick={(e) => handleNavClick(e, nav.url)}
                  className="font-medium font-poppins text-black transition-colors hover:text-primary px-4 py-2 rounded-xl"
                >
                  {nav.name}
                </Link>
              ))}
            </nav>
            <div className="hidden lg:flex items-center space-x-4">
              {isAuthenticated ? (
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

            <Sheet open={modal} onOpenChange={setModal}>
              <SheetTrigger asChild className="lg:hidden p-2 rounded-lg">
                <Button variant="ghost">
                  <Menu size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-">
                <SheetTitle
                  className="sr-only"
                  aria-describedby="Mobile Sidebar"
                >
                  mobile nav
                </SheetTitle>
                <SheetDescription
                  className="sr-only"
                  aria-describedby="Mobile Sidebar"
                ></SheetDescription>
                <div className="flex items-center space-x-2 ml-4 mt-4">
                  <img src="/cverai-logo.png" className="w-28 h-8" alt="" />
                </div>

                <SheetClose className="">
                  <nav className="flex lg:hidden flex-col items-start">
                    {navItems.map((nav) => (
                      <Link
                        key={nav.name}
                        href={nav.url}
                        onClick={(e) => {
                          handleNavClick(e, nav.url);
                          setModal(false);
                        }}
                        className="font-poppins text-black hover:text-gray-900 transition-colors hover:bg-accent px-4 py-2 border-t w-full text-start flex gap-2"
                      >
                        {/* <p className="">{nav.icon}</p> */}
                        <p className="">{nav.name}</p>
                      </Link>
                    ))}
                  </nav>
                </SheetClose>

                <SheetFooter>
                  {isAuthenticated ? (
                    <SheetClose asChild>
                      <Button
                        onClick={() => {
                          router.push("/dashboard/home");
                        }}
                      >
                        Dashboard
                      </Button>
                    </SheetClose>
                  ) : (
                    <div className="flex flex-col w-full gap-4">
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
                    </div>
                  )}
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </div>
  );
};
