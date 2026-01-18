"use client";

import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { usePathname, useRouter } from "next/navigation";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: React.ComponentType<{ className?: string }>;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
    external?: boolean;
  }[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobile, toggleSidebar } = useSidebar();

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          const isItemActive =
            pathname === item.url ||
            pathname.startsWith(item.url) ||
            // item.items?.some((subItem) => pathname === subItem.url) ||
            false;
          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={isItemActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={isItemActive}
                    onClick={() => {
                      if (isMobile) {
                        toggleSidebar();
                        setTimeout(() => {
                          if (item?.external) {
                            window.open(item.url, "_blank");
                            return;
                          }
                          router.push(item.url);
                        }, 500);
                        return;
                      }
                      if (item?.external) {
                        window.open(item.url, "_blank");
                        return;
                      }
                      router.push(item.url);
                    }}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    {item.external && <div className="bg-green-500 size-1 animate-ping rounded-full" />}
                  </SidebarMenuButton>
                </CollapsibleTrigger>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
