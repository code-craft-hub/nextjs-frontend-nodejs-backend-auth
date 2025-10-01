"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { memo } from "react";
import { AIApply } from "./(dashboard)/dashboard-tabs/AIApply";
import { TailorResume } from "./(dashboard)/components/TailorResume";
import { FindJob } from "./(dashboard)/dashboard-tabs/FindJob";
import { InitialUser } from "@/types";

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

const TAB_ITEMS = [
  {
    title: "AI Apply",
    icon: "/white-ai-apply.svg",
    value: "ai-apply",
  },
  {
    title: "Tailor Cv",
    icon: "/dashboard-tailor.svg",
    value: "tailor-cv",
  },
  {
    title: "Find Jobs",
    icon: "/findJob.svg",
    value: "find-jobs",
  },
] as const;

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

export const DashboardClient = memo(({ initialUser }: InitialUser) => {
  console.log(initialUser);

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
          <AIApply initialUser={initialUser} />
        </TabsContent>
        <TabsContent value="tailor-cv">
          <TailorResume initialUser={initialUser} />
        </TabsContent>
        <TabsContent value="find-jobs">
          <FindJob initialUser={initialUser} />
        </TabsContent>
      </Tabs>
    </>
  );
});

DashboardClient.displayName = "DashboardClient";
