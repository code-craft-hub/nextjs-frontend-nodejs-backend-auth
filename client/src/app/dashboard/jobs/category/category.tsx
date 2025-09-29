"use client";
import { InitialUser, IUser } from "@/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { memo, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ApplicationHistory } from "../components/ApplicationHistory";
import { SavedJobs } from "../components/SavedJobs";
import { AIRecommendations } from "../components/AIRecommendations";
import { useParams, useRouter } from "next/navigation";

interface ProfileOption {
  value: string;
  label: string;
  icon: string;
}

type ActionValue =
  | "select-profile"
  | "upload-file"
  | "upload-photo"
  | "tailor-resume"
  | "tailor-cover-letter"
  | "generate-interview-questions";

const SelectOptions = memo(
  ({
    options,
    value,
    onValueChange,
    placeholder,
    className = "",
    triggerClassName = "",
  }: {
    options: readonly ProfileOption[];
    value: ActionValue;
    onValueChange: (value: ActionValue) => void;
    placeholder: string;
    className?: string;
    triggerClassName?: string;
  }) => (
    <div className={cn("w-full max-w-md mx-auto", className)}>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={cn("w-full", triggerClassName)}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1">
          {options.map(({ value, label, icon }) => (
            <SelectItem
              key={value}
              value={value}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
            >
              <div className="flex items-center gap-3 w-full">
                <img src={icon} alt={value} loading="lazy" />
                {/* {icon} */}
                {/* <Icon /> */}
                <span className="text-gray-900 font-medium">{label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
);

SelectOptions.displayName = "SelectOptions";

const RecentActivityCard = memo(() => {
  const badgeData = useMemo(
    () => [
      { text: "Full-Time", variant: "teal" as const },
      { text: "Lagos, Nigeria", variant: "blue" as const },
      { text: "92% match", variant: "orange" as const },
    ],
    []
  );

  return (
    <div className="flex bg-slate-50 p-4 sm:p-6 rounded-xl gap-4 sm:gap-6 border border-[#cbd5e1]">
      <div className="shrink-0">
        <img src="./company.svg" alt="" loading="lazy" />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="font-inter">Social Media Assistant</h1>
        <p className="font-poppins text-cverai-brown text-xs">
          Nomad · <span className="font-inter">$2,000-5,000 / Monthly</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {badgeData.map((badge, badgeIndex) => (
            <div key={badgeIndex} className="flex items-center gap-2">
              <Badge
                className={cn(
                  "rounded-full font-epilogue font-semibold",
                  badge.variant === "teal"
                    ? "bg-cverai-teal/10 text-cverai-teal"
                    : badge.variant === "blue"
                    ? "text-cverai-blue border-cverai-blue bg-white"
                    : "text-cverai-orange border-cverai-orange bg-white"
                )}
              >
                {badge.text}
              </Badge>
              {badgeIndex === 0 && <div className="bg-slate-500 w-[1px] h-7" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

RecentActivityCard.displayName = "RecentActivityCard";
export interface OnboardingFormProps {
  onNext: () => void;
  onPrev: () => void;
  initialUser: Partial<IUser>;
  children?: React.ReactNode;
}
const menuItems = [
  {
    id: "ai-recommendations",
    label: "AI Recommendations",
    icon: "/ai-recommendation.svg",
  },
  {
    id: "saved-jobs",
    label: "Saved Jobs",
    icon: "/saved-job.svg",
  },
  {
    id: "application-history",
    label: "Application history",
    icon: "/application-history.svg",
  },
];

export const Category = memo(
  ({ initialUser, tab }: { initialUser: Partial<IUser>; tab: string }) => {
    console.log(initialUser);
    const router = useRouter();
    const params = useParams();

    return (
      <div>
        Category page
        {JSON.stringify({ params, tab })}
        <Tabs
          defaultValue={tab ? tab : "ai-recommendations"}
          className="flex flex-col font-poppins h-screen relative p-4 sm:p-8"
        >
          <TabsList>
            <TabsTrigger
              className={cn(
                "group flex gap-2 data-[state=active]:bg-primary  data-[state=active]:text-white  p-2 hover:bg-primary hover:text-white hover-cursor-pointer items-center justify-start rounded-md w-44  hover:shadow-sm hover:cursor-pointer"
              )}
              value="ai-recommendations"
            >
              AI Recommendation
            </TabsTrigger>
            <TabsTrigger
              className={cn(
                "group flex gap-2 data-[state=active]:bg-primary  data-[state=active]:text-white  p-2 hover:bg-primary hover:text-white hover-cursor-pointer items-center justify-start rounded-md w-44  hover:shadow-sm hover:cursor-pointer"
              )}
              value="saved-jobs"
            >
              Saved Jobs
            </TabsTrigger>
            <TabsTrigger
              className={cn(
                "group flex gap-2 data-[state=active]:bg-primary  data-[state=active]:text-white  p-2 hover:bg-primary hover:text-white hover-cursor-pointer items-center justify-start rounded-md w-44  hover:shadow-sm hover:cursor-pointer"
              )}
              value="application-history"
            >
              Application History
            </TabsTrigger>
          </TabsList>
          <TabsContent value="ai-recommendations" className="grid mt-8">
            <AIRecommendations />
          </TabsContent>
          <TabsContent value="saved-jobs" className="grid mt-8">
            <SavedJobs />
          </TabsContent>
          <TabsContent value="application-history" className="grid mt-8">
            <ApplicationHistory />
          </TabsContent>
        </Tabs>
      </div>
    );
  }
);

Category.displayName = "Category";

//       <h1 className="font-instrument text-3xl text-center tracking-tighter mb-8">
//         AI Recommendations
//       </h1>
//       <div className="xl:flex xl:gap-8">
//         <div className="grid grid-cols-1">
//           <ScrollArea className="w-full whitespace-nowrap xl:hidden">
//             <div className="flex flex-col py-1 gap-2 bg-white w-fit h-fit rounded-sm">
//               <div
//                 onClick={() => {
//                   router.push("/dashboard/overview");
//                 }}
//                 className={cn(
//                   "group flex gap-2 data-[state=active]:bg-primary  data-[state=active]:text-white  p-2 hover:bg-primary hover:text-white hover-cursor-pointer items-center justify-start rounded-md w-44  hover:shadow-sm hover:cursor-pointer"
//                 )}
//               >
//                 <div className="size-fit rounded-sm">
//                   <img
//                     src={"/overview.svg"}
//                     alt={"overview"}
//                     className="size-4 group-hover:brightness-0 group-hover:invert group-data-[state=active]:brightness-0 group-data-[state=active]:invert"
//                   />
//                 </div>
//                 <div className="">
//                   <p className="text-xs">Overview</p>
//                 </div>
//               </div>
//               {menuItems.map((item) => (
//                 <TabsTrigger
//                   key={item.id}
//                   value={item.id}
// className={cn(
//   "group flex gap-2 data-[state=active]:bg-primary  data-[state=active]:text-white  p-2 hover:bg-primary hover:text-white hover-cursor-pointer items-center justify-start rounded-md w-44  hover:shadow-sm hover:cursor-pointer"
// )}
//                 >
//                   <div className="size-fit rounded-sm">
//                     <img
//                       src={item.icon}
//                       alt={item.label}
//                       className="size-4 group-hover:brightness-0 group-hover:invert group-data-[state=active]:brightness-0 group-data-[state=active]:invert"
//                     />
//                   </div>
//                   <div className="">
//                     <p className="text-xs">{item.label}</p>
//                   </div>
//                 </TabsTrigger>
//               ))}
//             </div>
//             <TabsList className="flex flex-row gap-2 py-4">
//               {menuItems.map((item) => (
//                 <TabsTrigger
//                   key={item.id}
//                   value={item.id}
//                   className={cn(
//                     "group flex data-[state=active]:bg-primary data-[state=active]:text-white  gap-2 items-center justify-start rounded-md w-48 p-4 hover:shadow-sm hover:cursor-pointer bg-white hover:text-white hover:bg-primary"
//                   )}
//                 >
//                   <div className="size-fit rounded-sm">
//                     <img
//                       src={item.icon}
//                       alt={item.label}
//                       className="size-4 group-hover:brightness-0 group-hover:invert group-data-[state=active]:brightness-0 group-data-[state=active]:invert"
//                     />
//                   </div>
//                   <div className="">
//                     <p className="text-xs">{item.label}</p>
//                   </div>
//                 </TabsTrigger>
//               ))}
//             </TabsList>
//             <ScrollBar orientation="horizontal" />
//           </ScrollArea>
//           <TabsList className="hidden xl:flex bg-transparent mt-13">
//             {/* <div className="flex flex-col py-1 gap-2 bg-white w-fit h-fit rounded-sm">
//               <div
//                 onClick={() => {
//                   router.push("/dashboard/overview");
//                 }}
//                 className={cn(
//                   "group flex gap-2 data-[state=active]:bg-primary  data-[state=active]:text-white  p-2 hover:bg-primary hover:text-white hover-cursor-pointer items-center justify-start rounded-md w-44  hover:shadow-sm hover:cursor-pointer"
//                 )}
//               >
//                 <div className="size-fit rounded-sm">
//                   <img
//                     src={"/overview.svg"}
//                     alt={"overview"}
//                     className="size-4 group-hover:brightness-0 group-hover:invert group-data-[state=active]:brightness-0 group-data-[state=active]:invert"
//                   />
//                 </div>
//                 <div className="">
//                   <p className="text-xs">Overview</p>
//                 </div>
//               </div>
//               {menuItems.map((item) => (
//                 <TabsTrigger
//                   key={item.id}
//                   value={item.id}
//                   className={cn(
//                     "group flex gap-2 data-[state=active]:bg-primary  data-[state=active]:text-white  p-2 hover:bg-primary hover:text-white hover-cursor-pointer items-center justify-start rounded-md w-44  hover:shadow-sm hover:cursor-pointer"
//                   )}
//                 >
//                   <div className="size-fit rounded-sm">
//                     <img
//                       src={item.icon}
//                       alt={item.label}
//                       className="size-4 group-hover:brightness-0 group-hover:invert group-data-[state=active]:brightness-0 group-data-[state=active]:invert"
//                     />
//                   </div>
//                   <div className="">
//                     <p className="text-xs">{item.label}</p>
//                   </div>
//                 </TabsTrigger>
//               ))}
//             </div> */}
//           </TabsList>
//         </div>

//
