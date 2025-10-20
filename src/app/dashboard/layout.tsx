import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { UserMenu } from "@/components/UserMenu";
import { DynamicBreadcrumb } from "./components/DynamicBreadcrumb";
import { requireAuth } from "@/lib/server-auth";

interface DashboardLayoutProps {
  children: React.ReactNode;
  params?: any;
  searchParams?: any;
}

const DashboardLayout = async ({ children }: DashboardLayoutProps) => {
  const session = await requireAuth();

  return (
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
            <UserMenu initialUser={session} />
          </div>
        </header>
        <div className="w-full min-h-screen bg-[#F5F7FA]">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardLayout;
