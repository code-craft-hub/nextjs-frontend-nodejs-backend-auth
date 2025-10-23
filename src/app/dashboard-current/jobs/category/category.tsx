"use client";

import { IUser } from "@/types";
import { cn } from "@/lib/utils";
import { JSX, memo, useCallback, useMemo } from "react";
import { ApplicationHistory } from "../components/ApplicationHistory";
import { SavedJobs } from "../components/SavedJobs";
import { AIRecommendations } from "../components/AIRecommendations";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MdLocationSearching } from "react-icons/md";
import { Separator } from "@/components/ui/separator";
import { FaChevronDown } from "react-icons/fa";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { IoLocationOutline } from "react-icons/io5";
import { SearchIcon } from "lucide-react";

// Types
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
  initialUser: Partial<IUser>;
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

// Component registry pattern for better scalability
const COMPONENT_MAP: Record<ComponentId, () => JSX.Element> = {
  overview: AIRecommendations,
  "ai-recommendations": AIRecommendations,
  "saved-jobs": SavedJobs,
  "application-history": ApplicationHistory,
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
      <div className="size-4 flex-shrink-0">
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
      <span className="text-xs font-medium hidden lg:flex">{item.label}</span>
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

      // Navigate to the new URL
      router.push(item.url);

      // Optional: Keep toast for debugging, remove in production
      if (process.env.NODE_ENV === "development") {
        toast.success(`Navigated to ${item.label}`);
      }
    },
    [router]
  );

  // Get the active component based on current tab
  const ActiveComponent = useMemo(() => {
    return COMPONENT_MAP[activeTab as ComponentId] || AIRecommendations;
  }, [activeTab]);

  return (
    <div className="flex  gap-4 lg:gap-6">
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
  );
});

Category.displayName = "Category";

export const SearchBar = () => {
  return (
    <Card className="bg-white grid grid-cols-2 md:grid-cols-4 gap-4 py-4 max-w-screen-md mx-auto rounded-xl items-center px-2 ">
      <div className="relative w-full">
        <input
          type="text"
          placeholder="Job title / company name"
          className="w-full bg-transparent focus:outline-none pl-8 "
        />
        <SearchIcon className="absolute top-1/2 -translate-y-1/2 left-2 size-4" />
      </div>
      <div className="flex gap-1 items-center">
        <div className="">
          <Separator
            className="h-8 w-[1px]  bg-gray-400 mx-2"
            orientation="vertical"
          />
        </div>
        <IoLocationOutline className="shrink-0 text-black/50" />
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full text-start text-black/50 border-none focus:border-none focus:outline-none">
            Location
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Job Locations</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup>
              <DropdownMenuRadioItem value="united states">
                United states
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="united kingdom">
                United Kingdom
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex gap-1 items-center">
        <div className="">
          <Separator
            className="h-8 max-md:hidden w-[0.5px] bg-gray-400 mx-2"
            orientation="vertical"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="w-full focus:outline-none">
            <div className="flex gap-2 items-center w-full text-black/50">
              <MdLocationSearching />
              <span className="text-black/50">Remote</span>
              <FaChevronDown />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Job Types</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup>
              <DropdownMenuRadioItem value="remote">
                Remote
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="sponsorships">
                Sponsorship
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex mr-2 ml-auto">
        <Button className="text-xs">Search</Button>
      </div>
    </Card>
  );
};
