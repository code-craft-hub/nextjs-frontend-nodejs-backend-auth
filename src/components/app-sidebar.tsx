"use client";

import { BsExclamationCircle } from "react-icons/bs";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { NavMain } from "./nav-main";
import HomeIcon from "./icons/homeIcon";
import UserIcon from "./icons/userIcon";
import JobIcon from "./icons/jobIcon";
import SettingIcon from "./icons/settingIcon";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { userQueries } from "@/lib/queries/user.queries";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: user } = useQuery(userQueries.detail());
  const { open } = useSidebar();
  const isPro = user?.isPro;

  const leftSidebarData = {
    user: {
      name: user?.firstName ?? "",
      email: user?.email ?? "",
      avatar: user?.photoURL ?? "",
    },
    teams: {
      name: "Cver AI",
      logo: "/cverai-logo.png",
      plan: "Enterprise",
    },
    menus: [
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
      // {
      //   title: "Analytics",
      //   icon: AnalyticIcon,
      //   url: "/dashboard/analytics",
      // },
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
    ],
  };

  const router = useRouter();
  const handleCardClick = () => {
    router.push(`/dashboard/account?tab=billing`);
  };

  return (
    <Sidebar className="" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <Image
                  src={"/cverai-logo.png"}
                  width={70}
                  height={100}
                  alt={"Logo"}
                />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={leftSidebarData.menus} />
      </SidebarContent>
      <SidebarFooter>
        {!isPro && (
          <div
            onClick={() => {
              handleCardClick();
            }}
            className={cn("p-3", !open && "hidden")}
          >
            <div className="bg-primary text-white p-4 rounded-2xl">
              <div className="rounded-full bg-white p-2 w-fit">
                <BsExclamationCircle className="rotate-180 size-6 text-primary " />
              </div>
              <h1 className="font-medium my-2">Upgrade</h1>
              <p className="text-sm">
                Unlock more - upgrade your account for new and improved features
              </p>
            </div>
          </div>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
