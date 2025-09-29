import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { IconType } from "react-icons";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";

export function NavProjects({
  projects,
}: {
  projects: {
    title: string;
    link: string;
    icon: LucideIcon | IconType;
  }[];
}) {
  const pathname = usePathname();

  // const { isMobile } = useSidebar();

  const activeLink = (link: string) => {
    // console.log(pathname, link)
    const active = link === pathname;
    // const active = !!link?.startsWith(pathname);
    return active;
  };

  const router = useRouter();
  const { isMobile, toggleSidebar } = useSidebar();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      {/* <SidebarGroupLabel>Menus</SidebarGroupLabel> */}
      <SidebarMenu>
        {projects.map((item) => (
          <SidebarMenuItem className="" key={item.title}>
            <SidebarMenuButton
              className={cn(
                activeLink(item.link) ? "text-primary": "text-black",
                "hover:text-white hover:bg-primary/80 group"
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
                <item.icon className="text-black group-hover:text-white"/>
                <span className="ml-1">{item.title}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
