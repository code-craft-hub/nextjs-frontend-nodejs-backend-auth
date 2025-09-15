"use client";
// import { cn } from "@/lib/utils";
// import Nav from "./Nav";
// import NavMobile from "./NavMobile";
// import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
// import Link from "next/link";
import { User } from "@/types/auth";
export const Header = ({session}: {session: User}) => {
  console.log("session in header", session);
  const router = useRouter();
  return <div>
    {JSON.stringify(session)}
  </div>
  // return (
  //   <div
  //     className={cn(
  //       "sticky top-0 left-0 w-full h-16 z-50 flex-1 justify-between items-center backdrop-blur-3xl"
  //     )}
  //   >
  //     <div className="flex mx-auto h-full justify-between px-4 sm:px-8 max-w-screen-xl w-full  items-center">
  //       <Link href="/">
  //         <div className="max-w-32 justify-start flex ">
  //           <img src="/assets/images/CVER Logo.png" className="" alt="" />
  //         </div>
  //       </Link>
  //       <div className="max-lg:hidden">
  //         <Nav />
  //       </div>

  //       <div className="lg:ml-8 flex gap-4 items-center hover cursor-pointer">
  //         {!!user ? (
  //           <Button
  //             onClick={() => {
  //               router.push("/dashboard");
  //             }}
  //             className="w-full h-8"
  //           >
  //             Dashboard
  //           </Button>
  //         ) : (
  //           <Button
  //             onClick={() => {
  //               router.push("/auth/sign-in");
  //             }}
  //             className="w-full h-8 hidden xs:flex text-nowrap"
  //           >
  //             {!!user ? "Dashboard" : " Get Started"}
  //           </Button>
  //         )}
  //         <div className="lg:hidden">
  //           <NavMobile />
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );
};
