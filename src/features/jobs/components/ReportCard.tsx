import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { userQueries } from "@features/user";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

interface ReportCardItem {
  id: string;
  label: string;
  icon: string;
  bgColor: string;
  url: string;
  count: number | undefined;
}

const BASE_ITEMS = [
  {
    id: "ai-recommendations",
    label: "AI Recommendations",
    icon: "/bell.svg",
    bgColor: "bg-[#E7F6EA]",
    url: "/dashboard/jobs/category?tab=ai-recommendations",
  },
  {
    id: "saved-jobs",
    label: "Saved Jobs",
    icon: "/save.svg",
    bgColor: "bg-[#FFF6E6]",
    url: "/dashboard/jobs/category?tab=saved-jobs",
  },
  {
    id: "application-history",
    label: "Application History",
    icon: "/briefcase-dasboard.svg",
    bgColor: "bg-[#E7F0FA]",
    url: "/dashboard/jobs/category?tab=application-history",
  },
] as const;
function CountBadge({ count }: { count: number | undefined }) {
  if (count === undefined) {
    // Skeleton pulse while loading
    return null;
  }
  return (
    <span className=" items-center justify-center rounded-full text-2xl font-bold tabular-nums">
      {count > 9999 ? "9999+" : count}
    </span>
  );
}

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
      <div className="ml-1 items-center">
        <CountBadge count={item.count} />
        <h1 className="font-poppins">{item.label}</h1>
      </div>
      <div className="bg-white p-3 size-fit rounded-sm">
        <img src={item.icon} alt={item.label} className="size-4" />
      </div>
    </div>
  );
}

export const ReportCard = () => {
  const router = useRouter();
  const { data: user } = useQuery(userQueries.detail());

  const menuItems: ReportCardItem[] = [
    {
      ...BASE_ITEMS[0],
      count: user?.aiRecommendationsCount,
    },
    {
      ...BASE_ITEMS[1],
      count: user?.savedJobsCount,
    },
    {
      ...BASE_ITEMS[2],
      count: user?.applicationHistoryCount,
    },
  ];

  return (
    <div>
      {/* Desktop: horizontal scrollable strip */}
      <ScrollArea className="hidden md:grid grid-cols-1">
        <div className="flex flex-row gap-4 py-4 mx-auto w-fit">
          {menuItems.map((item) => (
            <div key={item.id} className="w-64">
              <CardItem item={item} onClick={() => router.push(item.url)} />
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Mobile: stacked */}
      <div className="md:hidden flex flex-col w-full gap-4 py-4 mx-auto">
        {menuItems.map((item) => (
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
