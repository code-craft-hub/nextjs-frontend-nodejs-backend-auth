"use client";
import { cn } from "@/lib/utils";
import { memo, useCallback, useMemo } from "react";
import { ApplicationHistory } from "./ApplicationHistory";
import { SavedJobs } from "./SavedJobs";
import { AIRecommendations } from "./AIRecommendations";
import { useRouter } from "next/navigation";
import Image from "next/image";

type ComponentId =
  | "overview"
  | "ai-recommendations"
  | "saved-jobs"
  | "application-history";

interface MenuItem {
  id: ComponentId;
  label: string;
  icon: string;
  url: string;
}

interface CategoryProps {
  tab: string;
}

// Constants - moved outside component to prevent recreation
const MENU_ITEMS: ReadonlyArray<MenuItem> = [
  {
    id: "overview",
    label: "Overview",
    icon: "/overview.svg",
    url: "/dashboard/jobs",
  },
  {
    id: "ai-recommendations",
    label: "AI Recommendations",
    icon: "/ai-recommendation.svg",
    url: "/dashboard/jobs/category?tab=ai-recommendations",
  },
  {
    id: "saved-jobs",
    label: "Saved Jobs",
    icon: "/saved-job.svg",
    url: "/dashboard/jobs/category?tab=saved-jobs",
  },
  {
    id: "application-history",
    label: "Application History",
    icon: "/application-history.svg",
    url: "/dashboard/jobs/category?tab=application-history",
  },
] as const;

const COMPONENT_MAP: Record<
  ComponentId,
  React.ComponentType<{ children?: React.ReactNode }>
> = {
  overview: ({ children }) => <AIRecommendations>{children}</AIRecommendations>,
  "ai-recommendations": ({ children }) => (
    <AIRecommendations>{children}</AIRecommendations>
  ),
  "saved-jobs": ({ children }) => <SavedJobs>{children}</SavedJobs>,
  "application-history": ({ children }) => (
    <ApplicationHistory>{children}</ApplicationHistory>
  ),
};

// Extracted MenuItem component for better performance and separation of concerns
const MenuItem = memo<{
  item: MenuItem;
  isActive: boolean;
  onClick: (item: MenuItem) => void;
}>(({ item, isActive, onClick }) => {
  const handleClick = useCallback(() => {
    onClick(item);
  }, [item, onClick]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "group flex gap-2 data-[state=active]:bg-primary  data-[state=active]:text-white  p-2 hover:bg-primary hover:text-white hover-cursor-pointer items-center justify-start rounded-md  hover:shadow-sm hover:cursor-pointer",

        isActive && "bg-primary text-white"
      )}
      aria-current={isActive ? "page" : undefined}
    >
      <div className="size-4 shrink-0">
        <Image
          src={item.icon}
          alt=""
          width={16}
          height={16}
          className={cn(
            "size-4 transition-all",
            "group-hover:brightness-0 group-hover:invert",
            isActive && "brightness-0 invert"
          )}
        />
      </div>
      <span className="text-xs font-medium hidden sm:flex">{item.label}</span>
    </button>
  );
});

MenuItem.displayName = "MenuItem";

// Main component
export const Category = memo<CategoryProps>(({ tab }) => {
  const router = useRouter();

  // Normalize tab to handle both query param and overview
  const activeTab = useMemo(() => {
    return tab || "overview";
  }, [tab]);

  // Memoized handler to prevent unnecessary recreations
  const handleComponentChange = useCallback(
    (item: MenuItem) => {
      if (item.id === "overview") {
        router.push("/dashboard/jobs");
        return;
      }

      router.push(item.url);
    },
    [router]
  );

  // Get the active component based on current tab
  const ActiveComponent = useMemo(() => {
    return COMPONENT_MAP[activeTab as ComponentId] || AIRecommendations;
  }, [activeTab]);

  return (
    <div className="">
      <div className="lg:hidden">
        <ActiveComponent>
          <div className="flex flex-col md:flex-row  gap-4 lg:gap-6">
            <nav className="bg-white p-3 justify-between h-fit w-full rounded-md flex flex-row gap-1">
              {MENU_ITEMS.map((item) => (
                <MenuItem
                  key={item.id}
                  item={item}
                  isActive={activeTab === item.id}
                  onClick={handleComponentChange}
                />
              ))}
            </nav>
          </div>
        </ActiveComponent>
      </div>
      <div className="hidden lg:flex  gap-4 lg:gap-6">
        <nav className="bg-white p-3 h-fit rounded-md flex flex-col gap-1">
          {MENU_ITEMS.map((item) => (
            <MenuItem
              key={item.id}
              item={item}
              isActive={activeTab === item.id}
              onClick={handleComponentChange}
            />
          ))}
        </nav>
        <main className="flex-1">
          <ActiveComponent />
        </main>
      </div>
    </div>
  );
});

Category.displayName = "Category";