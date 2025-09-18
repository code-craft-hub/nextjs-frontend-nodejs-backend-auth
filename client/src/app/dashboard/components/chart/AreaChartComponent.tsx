"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { isEmpty } from "lodash";

const chartConfig = {
  question: {
    label: "Interview Questions",
    color: "hsl(var(--chart-1))",
  },
  letter: {
    label: "Cover Letter",
    color: "hsl(var(--chart-1))",
  },
  resume: {
    label: "Resume",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function AreaChartComponent({ dbUser, isLoading }: any) {
  const documents = dbUser?.CV?.concat(
    dbUser?.coverLetterHistory,
    dbUser?.questions
  );

  const [timeRange, setTimeRange] = React.useState("90d");
  const [userData, setUserData] = React.useState<any[]>([]);

  // Memoized reducedData to prevent unnecessary recalculations
  const reducedData = React.useMemo(() => {
    if (!documents) return [];
    return documents
      .reduce((accumulator: any, current: any) => {
        const dateKey = new Date(current.createdAt).toISOString().split("T")[0]; // Standardized date format

        const existingEntry = accumulator.find(
          (entry: any) => entry.createdAt === dateKey
        );

        if (existingEntry) {
          existingEntry[current.category] =
            (existingEntry[current.category] || 0) + 1;
        } else {
          accumulator.push({
            createdAt: dateKey,
            resume: 0,
            letter: 0,
            question: 0,
            [current.category]: 1,
          });
        }

        return accumulator;
      }, [])
      .sort(
        (a: any, b: any) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
  }, [JSON.stringify(documents)]);

  React.useEffect(() => {
    const filteredDates = reducedData.filter((item: any) => {
      const date = new Date(item.createdAt);
      const referenceDate = new Date();
      let daysToSubtract = 90;

      if (timeRange === "30d") {
        daysToSubtract = 30;
      } else if (timeRange === "7d") {
        daysToSubtract = 7;
      }

      const startDate = new Date(referenceDate);
      startDate.setDate(startDate.getDate() - daysToSubtract);
      return date >= startDate;
    });

    setUserData(filteredDates);
  }, [timeRange, reducedData]);

  if (isLoading) {
    return (
      <Card>
        <div className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1 text-center sm:text-left px-2 sm:px-6">
            <Skeleton className="w-44 sm-w-64 h-7" />
            <div>
              <Skeleton className="w-44 sm-w-64 h-7" />
            </div>
          </div>
          <div className="px-2 sm:px-6">
            <Skeleton className="w-24 h-12" />
          </div>
        </div>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <Skeleton className="w-full h-[350px]" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-x-hidden">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Usage Analytics</CardTitle>
          <CardDescription>
            Total documents generated in the last{" "}
            {timeRange === "90d"
              ? "3 months"
              : timeRange === "30d"
              ? "30 days"
              : "7 days"}
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[160px] rounded-lg sm:ml-auto">
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d">Last 3 months</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {isEmpty(documents) ? (
          <div>
            <div className="flex justify-center">
              <div className="size-44">
                <img src="/assets/undraw/addNotes.svg" alt="" />
              </div>
            </div>
            <h1 className="my-4 text-gray-300 text-center text-[11px] leading-3 max-w-64 mx-auto">
              Start creating resumes, cover letters, and interview questions to see the analytics here
            </h1>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[350px] w-full"
          >
            <AreaChart data={userData}>
              <defs>
                <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#388B12" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#388B12" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4680EE" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#4680EE" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="question" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F0811A" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#F0811A" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid horizontal={false} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                hide={true}
                domain={["dataMin - 0.1", "dataMax + 0.5"]}
              />
              <XAxis
                dataKey="createdAt"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    }
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="resume"
                type="natural"
                fill="url(#fillMobile)"
                stroke="#388B12"
                stackId="a"
              />
              <Area
                dataKey="letter"
                type="natural"
                fill="url(#fillDesktop)"
                stroke="#4680EE"
                stackId="a"
              />
              <Area
                dataKey="question"
                type="natural"
                fill="url(#question)"
                stroke="#F0811A"
                stackId="a"
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
