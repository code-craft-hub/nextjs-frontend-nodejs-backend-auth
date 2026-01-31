"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { memo, useEffect } from "react";
import { AIApply } from "../(dashboard)/dashboard-tabs/ai-apply-tab/AIApply";
import { FindJob } from "../(dashboard)/dashboard-tabs/find-job-tab/FindJob";
import { DashboardTab } from "@/types";
import { TAB_ITEMS } from "../../(landing-page)/constants";
import { AIJobCustomization } from "../(dashboard)/dashboard-tabs/ai-job-customization-tab/AIJobCustomization";
import { TopGradient } from "@/components/shared/TopGradient";
import { JobFilters } from "@/lib/types/jobs";
import { userQueries } from "@/lib/queries/user.queries";
import { useQuery } from "@tanstack/react-query";
import { sendGTMEvent } from "@next/third-parties/google";
import { getDataSource } from "@/lib/utils/helpers";
import { useDashboardPrefetch } from "@/lib/react-query/hooks/useDashboardPrefetch";
import InsufficientCreditsModal from "@/components/shared/InsufficientCreditsModal";
import AuthorizeGoogle from "@/hooks/gmail/AuthorizeGoogle";

export const HomeClient = memo(
  ({ tab, jobDescription }: { tab: DashboardTab; jobDescription: string }) => {
    const { data: user } = useQuery(userQueries.detail());
    const title = getDataSource(user)?.title;

    console.log("user data source in home", getDataSource(user));
    const rolesOfInterest = getDataSource(user)?.rolesOfInterest?.map(
      (role: any) => role.value,
    );
    console.log(title, rolesOfInterest, user?.dataSource);
    const filters: JobFilters = {
      page: 1,
      limit: 20,
      title: title || "",
    };
    const autoApplyFilters: JobFilters = {
      page: 1,
      limit: 30,
      title: title || "",
      skills: JSON.stringify(rolesOfInterest),
    };

    useEffect(() => {
      if (user?.firstName)
        sendGTMEvent({
          event: `Dashboard`,
          value: `${user?.firstName} viewed Dashboard Page`,
        });
    }, [user?.firstName]);

    useDashboardPrefetch({
      filters,
      autoApplyFilters,
    });

    return (
      <>
        <TopGradient />
        <div className="container">
          <div className="w-full mt-4"></div>
          <Tabs
            defaultValue={tab ?? "ai-apply"}
            className="gap-y-13 w-full p-4 sm:p-8"
          >
            <TabsList className="gap-3 justify-center bg-transparent flex flex-row w-full mt-24">
              {TAB_ITEMS.map((item) => (
                <TabsTrigger
                  key={item.value}
                  className={cn(
                    "data-[state=active]:bg-primary data-[state=active]:hover:shadow-sm data-[state=active]:shadow-md data-[state=active]:hover:bg-blue-400 data-[state=active]:text-white h-[3.4rem] xs5:max-w-[7.833rem] shadow-md hover:shadow-sm hover:cursor-pointer shadow-blue-200 flex-1 items-center justify-center xs5:gap-3 rounded-2xl border border-white px-3 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&[data-state=active]_img]:invert [&[data-state=active]_img]:brightness-200",
                  )}
                  value={item.value}
                  onClick={() => {
                    sendGTMEvent({
                      event: `Dashboard - ${item.title}`,
                      value: `User clicked on the ${item.title} tab in the dashboard`,
                    });
                  }}
                >
                  <img
                    src={item.icon}
                    alt={item.title}
                    className="max-xs3:size-3.5"
                    loading="lazy"
                  />
                  <span className="max-xs2:text-[0.7rem]">{item.title}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="ai-apply">
              <AIApply
                jobDescription={jobDescription}
                filters={autoApplyFilters}
              />
            </TabsContent>
            <TabsContent value="tailor-cv">
              <AIJobCustomization filters={autoApplyFilters} />
            </TabsContent>
            <TabsContent value="find-jobs">
              <FindJob filters={filters} />
            </TabsContent>
          </Tabs>
        </div>
        <InsufficientCreditsModal />
        <AuthorizeGoogle hidden={true} />
      </>
    );
  },
);
HomeClient.displayName = "HomeClient";
