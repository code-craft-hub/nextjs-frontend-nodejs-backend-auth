"use client";
import { cn } from "@/lib/utils";
import React from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface StatItem {
  id: string;
  count: number;
  title: string;
  subtitle: string;
  iconBg: string;
  iconColor: string;
  trend: "up" | "down";
  trendColor: string;
  shadow: string;
}

const statsData: StatItem[] = [
  {
    id: "1",
    count: 281,
    title: "Auto Applications",
    subtitle: "18 minutes saved per application",
    iconBg: "bg-white",
    iconColor: "text-gray-600",
    trend: "up",
    trendColor: "text-green-500",
    shadow: "shadow-gray-300",
  },
  {
    id: "2",
    count: 463,
    title: "Tailored Resume",
    subtitle: "12 tailored resumes this week",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    trend: "up",
    trendColor: "text-green-500",
    shadow: "shadow-blue-200",
  },
  {
    id: "3",
    count: 463,
    title: "Tailored Cover Letters",
    subtitle: "4 tailored cover letters this week",
    iconBg: "bg-green-50",
    iconColor: "text-green-600",
    trend: "down",
    trendColor: "text-red-500",
    shadow: "shadow-green-200",
  },
  {
    id: "4",
    count: 463,
    title: "Tailored Interview Questions",
    subtitle: "4 tailored interview questions this week",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-600",
    trend: "down",
    trendColor: "text-red-500",
    shadow: "shadow-gray-200",
  },
];

const StatCard: React.FC<{ stat: StatItem }> = ({ stat }) => {
  const getIcon = (title: string) => {
    switch (title) {
      case "Auto Applications":
        return (
          <svg
            className={`size-4 sm:size-6 ${stat.iconColor}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 18 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M1.28566 6.22937L9.51173 10.9879L17.7378 6.22937M9.51173 20.4766V10.9784M17.9922 14.7475V7.20933C17.9919 6.87886 17.9046 6.55427 17.7392 6.26816C17.5738 5.98204 17.3361 5.74444 17.0499 5.5792L10.454 1.8101C10.1675 1.6447 9.84253 1.55762 9.51173 1.55762C9.18092 1.55762 8.85594 1.6447 8.56945 1.8101L1.97353 5.5792C1.68732 5.74444 1.4496 5.98204 1.28421 6.26816C1.11883 6.55427 1.03159 6.87886 1.03125 7.20933V14.7475C1.03159 15.078 1.11883 15.4026 1.28421 15.6887C1.4496 15.9748 1.68732 16.2124 1.97353 16.3777L8.56945 20.1468C8.85594 20.3122 9.18092 20.3993 9.51173 20.3993C9.84253 20.3993 10.1675 20.3122 10.454 20.1468L17.0499 16.3777C17.3361 16.2124 17.5738 15.9748 17.7392 15.6887C17.9046 15.4026 17.9919 15.078 17.9922 14.7475Z"
            />
          </svg>
        );
      case "Tailored Resume":
        return (
          <svg
            className={`size-4 sm:size-6 ${stat.iconColor}`}
            fill="none"
            stroke="currentColor"
            // viewBox="0 0 24 24"
            width="16"
            height="20"
            viewBox="0 0 16 20"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11.3359 3.33268H13.0026C13.4446 3.33268 13.8686 3.50828 14.1811 3.82084C14.4937 4.1334 14.6693 4.55732 14.6693 4.99935V16.666C14.6693 17.108 14.4937 17.532 14.1811 17.8445C13.8686 18.1571 13.4446 18.3327 13.0026 18.3327H3.0026C2.56058 18.3327 2.13665 18.1571 1.82409 17.8445C1.51153 17.532 1.33594 17.108 1.33594 16.666V4.99935C1.33594 4.55732 1.51153 4.1334 1.82409 3.82084C2.13665 3.50828 2.56058 3.33268 3.0026 3.33268H4.66927M5.5026 1.66602H10.5026C10.9628 1.66602 11.3359 2.03911 11.3359 2.49935V4.16602C11.3359 4.62625 10.9628 4.99935 10.5026 4.99935H5.5026C5.04237 4.99935 4.66927 4.62625 4.66927 4.16602V2.49935C4.66927 2.03911 5.04237 1.66602 5.5026 1.66602Z"
            />
          </svg>
        );
      case "Tailored Cover Letters":
        return (
          <svg
            className={`size-4 sm:size-6 ${stat.iconColor}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        );
      case "Tailored Interview Questions":
        return (
          <svg
            className={`size-4 sm:size-6 ${stat.iconColor}`}
            fill="none"
            stroke="currentColor"
            // viewBox="0 0 24 24"
            width="16"
            height="20"
            viewBox="0 0 16 20"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 9.83333V14.8333C14 15.2754 13.8244 15.6993 13.5118 16.0118C13.1993 16.3244 12.7754 16.5 12.3333 16.5H3.16667C2.72464 16.5 2.30072 16.3244 1.98816 16.0118C1.67559 15.6993 1.5 15.2754 1.5 14.8333V5.66667C1.5 5.22464 1.67559 4.80072 1.98816 4.48816C2.30072 4.17559 2.72464 4 3.16667 4H8.16667M11.5 1.5H16.5M16.5 1.5V6.5M16.5 1.5L7.33333 10.6667"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative h-full py-3 sm:py-6 group hover:cursor-pointer">
      <div className="px-4 sm:px-8">
        <div className="flex items-center justify-between ">
          <div className="text-xl sm:text-3xl font-semibold ">{stat.count}</div>
          <div
            className={cn(
              `size-8 sm:size-12 bg-white rounded-lg flex items-center justify-center`,
              "shadow-[0_0_10px_0] group-hover:shadow-xs",
              stat.shadow
            )}
          >
            {getIcon(stat.title)}
          </div>
        </div>
        <h3 className="text-xs sm:text-lg font-medium mb-2">{stat.title}</h3>
        <div className="flex items-center gap-1">
          <svg
            className={`size-3 sm:size-4 ${stat.trendColor} ${
              stat.trend === "down" ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 17l9.2-9.2M17 17V7H7"
            />
          </svg>
          <span className="text-2xs sm:text-sm text-gray-400 text-nowrap">
            {stat.subtitle}
          </span>
        </div>
      </div>
      <div
        className={cn(
          "h-full inset-y-0 absolute justify-center flex items-center shrink-0",
          stat.id === "1" && "hidden"
        )}
      >
        <div className="bg-gray-200 shrink-0 w-0.5 h-14 sm:h-20 " />
      </div>
    </div>
  );
};

export const AnalyticsCard: React.FC = () => {
  return (
    <div className="grid grid-cols-1">
      <ScrollArea>
        <div className="flex bg-white rounded-md mb-4 ">
          {statsData.map((stat) => (
            <StatCard key={stat.id} stat={stat} />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};
