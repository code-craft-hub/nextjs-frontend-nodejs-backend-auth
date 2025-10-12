"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { memo } from "react";
import { AIApply } from "../(dashboard)/dashboard-tabs/ai-apply-tab/AIApply";
import { FindJob } from "../(dashboard)/dashboard-tabs/find-job-tab/FindJob";
import { InitialUser } from "@/types";
import { TAB_ITEMS } from "../../(landing-page)/constants";
import { AIJobCustomization } from "../(dashboard)/dashboard-tabs/ai-job-customization-tab/AIJobCustomization";

export const HomeClient = memo(({ initialUser }: InitialUser) => {

  
  return (
    <>
      <div
        className="absolute w-full h-64 top-0 pointer-events-none"
        style={{
          background: "url('/dashboard-gradient.svg')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center center",
        }}
      />

      <Tabs defaultValue="ai-apply" className="gap-y-13 w-full p-4 sm:p-8">
        <TabsList className="gap-3 justify-center bg-transparent flex flex-row w-full mt-24">
          {TAB_ITEMS.map((item) => (
            <TabsTrigger
              key={item.value}
              className={cn(
                "data-[state=active]:bg-primary data-[state=active]:hover:shadow-sm data-[state=active]:shadow-md data-[state=active]:hover:bg-blue-400 data-[state=active]:text-white h-[3.4rem] xs5:max-w-[7.833rem] shadow-md hover:shadow-sm hover:cursor-pointer shadow-blue-200 flex-1 items-center justify-center xs5:gap-3 rounded-2xl border border-white px-3 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&[data-state=active]_img]:invert [&[data-state=active]_img]:brightness-200"
              )}
              value={item.value}
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
          <AIApply />
        </TabsContent>
        <TabsContent value="tailor-cv">
          <AIJobCustomization />
        </TabsContent>
        <TabsContent value="find-jobs">
          <FindJob initialUser={initialUser} />
        </TabsContent>
      </Tabs>
    </>
  );
});

HomeClient.displayName = "HomeClient";
