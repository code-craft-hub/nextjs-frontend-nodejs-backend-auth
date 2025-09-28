"use client";

import * as React from "react";
import { Briefcase } from "lucide-react";

import { NavProjects } from "@/components/nav-projects";
import { BsExclamationCircle } from "react-icons/bs";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";
import { IoDocumentTextOutline } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { VscCreditCard } from "react-icons/vsc";
import { CgFileDocument } from "react-icons/cg";
import { BiHome } from "react-icons/bi";
import { LuFileQuestion } from "react-icons/lu";
import { useAuth } from "@/hooks/use-auth";
import Image from "next/image";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();

  const data = {
    user: {
      name: user?.firstName ?? "",
      email: user?.email ?? "",
      avatar: user?.photoURL ?? "",
    },
    teams: {
      name: "Cver AI",
      logo: "/logo.svg",
      plan: "Enterprise",
    },
    menus: [
      {
        title: "Home",
        icon: BiHome,
        link: "/dashboard",
      },
      {
        title: "Jobs",
        icon: CgFileDocument,
        link: "/dashboard/resumes",
      },
      {
        title: "Analytics",
        icon: IoDocumentTextOutline,
        link: "/dashboard/cover-letters",
      },
      {
        title: "Settings",
        icon: LuFileQuestion,
        link: "/dashboard/interview-questions",
      },
      {
        title: "Account",
        icon: Briefcase,
        link: "/dashboard/job-listings",
      },
      {
        title: "Profiles",
        icon: FaUser,
        link: "/dashboard/profile",
      },
      {
        title: "Credits",
        icon: VscCreditCard,
        link: "/dashboard/credit",
      },
    
    ],
  };
  return (
    <Sidebar collapsible="icon" {...props}>
      <div className=" p-4">
        <Image src={"/logo.svg"} width={100} height={100} alt={"Logo"} />
      </div>

      <SidebarContent>
        <NavProjects projects={data.menus} />
      </SidebarContent>
      <SidebarFooter className="p-6">
        <div className="bg-primary text-white p-4 rounded-2xl">
          <div className="rounded-full bg-white p-2 w-fit">
            <BsExclamationCircle className="rotate-180 size-6 text-primary " />
          </div>
          <h1 className="font-medium my-2">Upgrade</h1>
          <p className="text-sm">
            Unlock more - upgrade your account for new and improved features
          </p>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
