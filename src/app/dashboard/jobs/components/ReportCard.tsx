import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { userQueries } from "@/lib/queries/user.queries";
import { cn } from "@/lib/utils";
import { randomNumber } from "@/lib/utils/helpers";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export const ReportCard = ({
  matchPercentage,
}: {
  matchPercentage?: number;
}) => {
  const router = useRouter();
  const { data: user } = useQuery(userQueries.detail());
  const bookmarkedJobs = user?.bookmarkedJobs?.length || 0;
  const appliedJobs = user?.appliedJobs?.length || 0;
  const menuItems = [
    {
      id: "ai-recommendations",
      count: `${matchPercentage ?? randomNumber(-1)}`,
      label: "AI Recommendations",
      icon: "/bell.svg",
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
      countColor: "text-green-800",
      labelColor: "text-green-700",
      url: "/dashboard/jobs/category?tab=ai-recommendations",
    },
    {
      id: "saved-jobs",
      count: bookmarkedJobs,
      label: "Saved Jobs",
      icon: "/save.svg",
      bgColor: "bg-yellow-100",
      iconColor: "text-yellow-600",
      countColor: "text-yellow-800",
      labelColor: "text-yellow-700",
      url: "/dashboard/jobs/category?tab=saved-jobs",
    },
    {
      id: "application-history",
      count: appliedJobs,
      label: "Application history",
      icon: "/briefcase-dasboard.svg",
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
      countColor: "text-blue-800",
      labelColor: "text-blue-700",
      url: "/dashboard/jobs/category?tab=application-history",
    },
  ];
  return (
    <div>
      <ScrollArea className="hidden md:grid grid-cols-1">
        <div className="flex flex-row gap-4 py-4 mx-auto w-fit">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className={cn(
                item.bgColor,
                "flex justify-between p-4 items-center rounded-md w-64 hover:shadow-sm hover:cursor-pointer"
              )}
              onClick={() => {
                router.push(item.url);
              }}
            >
              <div className="">
                <h1 className="font-bold mb-1">{item.count}</h1>
                <p className="text-xs">{item.label}</p>
              </div>
              <div className="bg-white p-3 size-fit rounded-sm">
                <img src={item.icon} alt={item.label} className="size-4" />
              </div>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <div className="md:hidden flex flex-col w-full gap-4 py-4 mx-auto">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className={cn(
              item.bgColor,
              "flex justify-between p-4 items-center rounded-md w-full hover:shadow-sm hover:cursor-pointer"
            )}
            onClick={() => {
              router.push(item.url);
            }}
          >
            <div className="">
              <h1 className="font-bold font-inter mb-1">{item.count}</h1>
              <p className="text-xs font-inter">{item.label}</p>
            </div>
            <div className="bg-white p-3 size-fit rounded-sm">
              <img src={item.icon} alt={item.label} className="size-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
