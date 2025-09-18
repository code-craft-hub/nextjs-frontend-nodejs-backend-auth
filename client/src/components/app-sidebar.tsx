"use client";

import * as React from "react";
import {
  Briefcase,
  GalleryVerticalEnd,
} from "lucide-react";

import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { IoDocumentTextOutline } from "react-icons/io5";
import { MdManageAccounts } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { VscCreditCard } from "react-icons/vsc";
import { CgFileDocument } from "react-icons/cg";
import { BiHome } from "react-icons/bi";
import { LuFileQuestion } from "react-icons/lu";
import { useAuth } from "@/hooks/use-auth";


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const {user} = useAuth();
  const data = {
    user: {
      name: user?.firstName ?? "",
      email: user?.email ?? "",
      avatar: user?.photoURL ?? "",
    },
    teams: [
      {
        name: "Cver AI",
        logo: GalleryVerticalEnd,
        plan: "Enterprise",
      },
    ],
    menus: [
      {
        title: "Dashboard",
        icon: BiHome,
        link: "/dashboard",
      },
      {
        title: "My Resumes",
        icon: CgFileDocument,
        link: "/dashboard/resumes",
      },
      {
        title: "My Cover Letters",
        icon: IoDocumentTextOutline,
        link: "/dashboard/cover-letters",
      },
      {
        title: "My Interview Questions",
        icon: LuFileQuestion,
        link: "/dashboard/interview-questions",
      },
      {
        title: "Job Listings",
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
      {
        title: "Account",
        icon: MdManageAccounts,
        link: "/dashboard/account",
      },
    ],
  };
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavProjects projects={data.menus} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
