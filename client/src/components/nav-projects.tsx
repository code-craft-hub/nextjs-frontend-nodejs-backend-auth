import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import UserIcon from "./icons/userIcon";

export function NavProjects({
  projects,
}: {
  projects: {
    title: string;
    link: string;
    icon: string;
  }[];
}) {
  const pathname = usePathname();
  const activeLink = (link: string) => {
    const active = link === pathname;
    return active;
  };

  const router = useRouter();
  const { isMobile, toggleSidebar } = useSidebar();

  return (
    <div>
      <div className="group flex gap-2 cursor-pointer">
        <UserIcon className="text-[#B1B1B1] group-hover:text-[#4680EE] group-active:text-[#4680EE]" />
        <h1 className="group-hover:text-[#4680EE] text-[#B1B1B1]">User</h1>
      </div>
    </div>
  );

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarMenu>
        {projects.map((item) => (
          <SidebarMenuItem className="" key={item.title}>
            <SidebarMenuButton
              className={cn(
                activeLink(item.link) ? "text-primary" : "text-black",
                "hover:text-primary hover:bg-transparent hover:cursor-pointer group"
              )}
              asChild
            >
              <div
                onClick={() => {
                  router.push(item.link);
                  setTimeout(() => {
                    if (isMobile) {
                      toggleSidebar();
                    }
                  }, 500);
                }}
                className=""
              >
                <span className="text-[#B1B1B1] font-medium hover:text-primary">
                  {item.title}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
