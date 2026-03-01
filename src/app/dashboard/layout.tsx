import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { UserMenu } from "@/components/UserMenu";
import { DynamicBreadcrumb } from "./components/DynamicBreadcrumb";
import { requireOnboarding } from "@/lib/server-auth";
import { createServerQueryClient } from "@/lib/query/prefetch";
import { userQueries } from "@module/user";
import { HydrationBoundary } from "@/components/hydration-boundary";
import { dehydrate } from "@tanstack/react-query";
import { getCookiesToken } from "@/lib/auth.utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
  params?: any;
  searchParams?: any;
}

const DashboardLayout = async ({ children }: DashboardLayoutProps) => {
  await requireOnboarding();
  const token = await getCookiesToken();
  const queryClient = createServerQueryClient();
  // Only attempt server-side user fetch when an access token exists.
  // If there's no access token but a refresh token exists, the client
  // will perform rotation; skip server fetch to avoid a 401 during SSR.
  if (token) {
    await queryClient.fetchQuery(userQueries.detail(token));
  }
  // await queryClient.prefetchQuery(userQueries.detail(token));
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 bg-white/70 sticky top-0 z-30 border-b backdrop-blur-3xl">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <DynamicBreadcrumb />
            </div>
            <div className="ml-auto">
              <UserMenu />
            </div>
          </header>
          <div className="w-full min-h-screen bg-[#F5F7FA]">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </HydrationBoundary>
  );
};

export default DashboardLayout;
