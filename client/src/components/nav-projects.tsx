
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { IconType } from "react-icons";
import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export function NavProjects({
  projects,
}: {
  projects: {
    title: string;
    link: string;
    icon: LucideIcon | IconType;
  }[];
}) {

  const pathname = usePathname()
  
  // const { isMobile } = useSidebar();

  const activeLink = (link: string) => {
    // console.log(pathname, link)
    const active = link === pathname;
    // const active = !!link?.startsWith(pathname);
    return active;
  };
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Menus</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              className={cn(activeLink(item.link) && "bg-accent")}
              asChild
            >
              <Link href={item.link}>
                <item.icon />
                <span>
                  {item.title}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
