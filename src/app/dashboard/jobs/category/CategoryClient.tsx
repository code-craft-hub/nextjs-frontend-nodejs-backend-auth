"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { memo, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";

import { AIRecommendations } from "./AIRecommendations";
import { SavedJobs } from "./SavedJobs";
import { ApplicationHistory } from "./ApplicationHistory";

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId = "ai-recommendations" | "saved-jobs" | "application-history";

interface NavItem {
  id: TabId;
  label: string;
  icon: string;
  url: string;
}

interface CategoryProps {
  tab: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const NAV_ITEMS: ReadonlyArray<NavItem> = [
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

/** Maps a valid tab ID to the component that renders its content. */
const TAB_COMPONENTS: Record<TabId, React.ComponentType<{ children?: React.ReactNode }>> = {
  "ai-recommendations": AIRecommendations,
  "saved-jobs": SavedJobs,
  "application-history": ApplicationHistory,
};

const DEFAULT_TAB: TabId = "ai-recommendations";

// ─── NavButton ────────────────────────────────────────────────────────────────

const NavButton = memo<{
  item: NavItem;
  isActive: boolean;
  onClick: (item: NavItem) => void;
}>(function NavButton({ item, isActive, onClick }) {
  const handleClick = useCallback(() => onClick(item), [item, onClick]);

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "group flex gap-2 p-2 hover:bg-primary hover:text-white items-center justify-start rounded-md hover:shadow-sm hover:cursor-pointer",
        isActive && "bg-primary text-white",
      )}
    >
      <div className="size-4 shrink-0">
        <Image
          src={item.icon}
          alt=""
          width={16}
          height={16}
          className={cn(
            "size-4 transition-all group-hover:brightness-0 group-hover:invert",
            isActive && "brightness-0 invert",
          )}
        />
      </div>
      <span className="text-xs font-medium hidden sm:flex">{item.label}</span>
    </button>
  );
});

// ─── Category ─────────────────────────────────────────────────────────────────

export const Category = memo<CategoryProps>(function Category({ tab }) {
  const router = useRouter();

  const activeTab = useMemo<TabId>(() => {
    const isValid = (t: string): t is TabId =>
      t in TAB_COMPONENTS;
    return isValid(tab) ? tab : DEFAULT_TAB;
  }, [tab]);

  const handleNavClick = useCallback(
    (item: NavItem) => {
      router.push(item.url);
    },
    [router],
  );

  const ActiveComponent = TAB_COMPONENTS[activeTab];

  const nav = (
    <nav className="bg-white p-3 h-fit rounded-md flex gap-1">
      {NAV_ITEMS.map((item) => (
        <NavButton
          key={item.id}
          item={item}
          isActive={activeTab === item.id}
          onClick={handleNavClick}
        />
      ))}
    </nav>
  );

  return (
    <div>
      {/* Mobile: nav above content */}
      <div className="lg:hidden">
        <ActiveComponent>
          <div className="flex flex-col md:flex-row gap-4 lg:gap-6">
            <div className="w-full">{nav}</div>
          </div>
        </ActiveComponent>
      </div>

      {/* Desktop: nav on the left, content on the right */}
      <div className="hidden lg:flex gap-4 lg:gap-6">
        <nav className="bg-white p-3 h-fit rounded-md flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              isActive={activeTab === item.id}
              onClick={handleNavClick}
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
