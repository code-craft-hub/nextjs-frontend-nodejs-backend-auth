"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { memo, useEffect, useState } from "react";
import { AIApply } from "@/features/ai-apply/components/AIApply";
import { FindJob } from "@/features/jobs/components/FindJob";
import { DashboardTab } from "@/shared/types";
import { TAB_ITEMS } from "@/features/landing/constants";
import { AIJobCustomization } from "@/features/ai-settings/components/AIJobCustomization";
import { TopGradient } from "@/components/shared/TopGradient";
import { JobFilters } from "@/shared/types/jobs.types";
import { userQueries } from "@features/user";
import { useQuery } from "@tanstack/react-query";
import { sendGTMEvent } from "@next/third-parties/google";
import { useDashboardPrefetch } from "@/shared/react-query/hooks/useDashboardPrefetch";
import InsufficientCreditsModal from "@/components/shared/InsufficientCreditsModal";
import AuthorizeGoogle from "@/features/email-application/hooks/AuthorizeGoogle";
import { NoResumeAlertDialog } from "./no-resume-alert-dialog";
import { JobDeckView } from "@/features/job-posts/components/JobDeckView";
import { useRunManager } from "@/features/job-posts/hooks/useRunManager";
import { useApplyOrchestrator } from "@/features/job-posts/hooks/useApplyOrchestrator";
import { useDeckApply } from "@/features/job-posts/hooks/useDeckApply";

export type ViewType = "deck" | "list";
export const HomeClient = memo(
  ({ tab, jobDescription }: { tab: DashboardTab; jobDescription: string }) => {
    const { data: user } = useQuery(userQueries.detail());
    const [isDeckView, setIsDeckView] = useState(true);

    const handleViewChange = (value: ViewType) => {
      setIsDeckView(value === "deck");
    };

    const filters: JobFilters = { page: 1, limit: 20 };
    const autoApplyFilters: JobFilters = { page: 1, limit: 30 };

    const { enqueueJob, runs, openRunModal, dismissRun } = useRunManager();
    const { extState } = useApplyOrchestrator({ enqueueJob });
    const handleDeckApply = useDeckApply({ enqueueJob, extState });

    useEffect(() => {
      if (user?.firstName)
        sendGTMEvent({
          event: `Dashboard`,
          value: `${user?.firstName} viewed Dashboard Page`,
        });
    }, [user?.firstName]);

    useDashboardPrefetch({ filters });

    return (
      <>
        <TopGradient />
        <div className="container relative">
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
            {isDeckView ? (
              <JobDeckView
                onApply={handleDeckApply}
                handleViewChange={handleViewChange}
                runs={runs}
                onOpenRun={openRunModal}
                onDismissRun={dismissRun}
              />
            ) : (
              <>
                <TabsContent value="ai-apply">
                  <AIApply jobDescription={jobDescription} handleViewChange={handleViewChange} />
                </TabsContent>
                <TabsContent value="tailor-cv">
                  <AIJobCustomization filters={autoApplyFilters} handleViewChange={handleViewChange}/>
                </TabsContent>
                <TabsContent value="find-jobs">
                  <FindJob />
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>
        <InsufficientCreditsModal />
        <AuthorizeGoogle hidden={true} />
        <NoResumeAlertDialog />
      </>
    );
  },
);
HomeClient.displayName = "HomeClient";
