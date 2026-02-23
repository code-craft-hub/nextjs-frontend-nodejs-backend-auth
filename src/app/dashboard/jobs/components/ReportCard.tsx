import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { userQueries } from "@module/user";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

interface ReportCardItem {
  id: string;
  label: string;
  icon: string;
  bgColor: string;
  url: string;
}

const MENU_ITEMS: ReportCardItem[] = [
  {
    id: "ai-recommendations",
    label: "AI Recommendations",
    icon: "/bell.svg",
    bgColor: "bg-green-100",
    url: "/dashboard/jobs/category?tab=ai-recommendations",
  },
  {
    id: "saved-jobs",
    label: "Saved Jobs",
    icon: "/save.svg",
    bgColor: "bg-yellow-100",
    url: "/dashboard/jobs/category?tab=saved-jobs",
  },
  {
    id: "application-history",
    label: "Application History",
    icon: "/briefcase-dasboard.svg",
    bgColor: "bg-blue-100",
    url: "/dashboard/jobs/category?tab=application-history",
  },
];

function CardItem({
  item,
  onClick,
}: {
  item: ReportCardItem;
  onClick: () => void;
}) {
  return (
    <div
      className={cn(
        item.bgColor,
        "flex justify-between p-4 items-center rounded-md hover:shadow-sm hover:cursor-pointer",
      )}
      onClick={onClick}
    >
      <h1 className="font-bold font-inter mb-1">{item.label}</h1>
      <div className="bg-white p-3 size-fit rounded-sm">
        <img src={item.icon} alt={item.label} className="size-4" />
      </div>
    </div>
  );
}

export const ReportCard = ({
  matchPercentage,
}: {
  /**
   * Count of high-scoring AI match jobs calculated in the parent.
   * Shown as the AI Recommendations badge count.
   * Pass 0 (not a random number) when the value is unavailable.
   */
  matchPercentage?: number;
}) => {
  const router = useRouter();
  const { data: user } = useQuery(userQueries.detail());

  // Intentionally unused — the counts were removed from the card UI
  // to avoid showing stale/random data. The label alone is sufficient.
  void matchPercentage;
  void user?.bookmarkedJobs;
  void user?.appliedJobs;

  return (
    <div>
      {/* Desktop: horizontal scrollable strip */}
      <ScrollArea className="hidden md:grid grid-cols-1">
        <div className="flex flex-row gap-4 py-4 mx-auto w-fit">
          {MENU_ITEMS.map((item) => (
            <div key={item.id} className="w-64">
              <CardItem item={item} onClick={() => router.push(item.url)} />
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Mobile: stacked */}
      <div className="md:hidden flex flex-col w-full gap-4 py-4 mx-auto">
        {MENU_ITEMS.map((item) => (
          <CardItem
            key={item.id}
            item={item}
            onClick={() => router.push(item.url)}
          />
        ))}
      </div>
    </div>
  );
};
