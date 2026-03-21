"use client";
import { useState, useCallback, useMemo, JSX } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  CveraiChartTooltipContent,
} from "@/components/ui/chart";
import { userAnalyticsQueries } from "../queries/user-analytics.queries";

interface ChartDataPoint {
  month: string;
  applications: number;
  tailoredDocuments: number;
}

interface EnhancedChartDataPoint extends ChartDataPoint {
  topSection: number;
  bottomSection: number;
  Total: number;
  isActive: boolean;
}

interface ChartConfig {
  applications: {
    label: string;
    color: string;
  };
  tailoredDocuments: {
    label: string;
    color: string;
  };
}

const chartConfig = {
  applications: {
    label: "Auto Applications",
    color: "#878890",
  },
  tailoredDocuments: {
    label: "Tailored Documents",
    color: "#4680EE",
  },
} satisfies ChartConfig;

export const UsageTrendDashboard = (): JSX.Element => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const { data: analyticsData } = useQuery(userAnalyticsQueries.trend());

  const chartData: ChartDataPoint[] = (analyticsData?.trend ?? []).map((d) => ({
    month: d.month,
    applications: d.applications,
    tailoredDocuments: d.resumes + d.coverLetters + d.interviewQuestions,
  }));

  // Memoized chart data transformation for performance
  const chartDataWithBars = useMemo((): EnhancedChartDataPoint[] => {
    return chartData.map((item, index) => {
      const maxValue = Math.max(item.applications, item.tailoredDocuments);
      const minValue = Math.min(item.applications, item.tailoredDocuments);
      const Total = maxValue + minValue;

      // Determine which value is larger to assign colors correctly
      const isApplicationsLarger = item.applications >= item.tailoredDocuments;

      return {
        ...item,
        topSection: maxValue,
        bottomSection: minValue,
        Total,
        isActive: index === activeIndex,
        topColor: isApplicationsLarger
          ? chartConfig.applications.color
          : chartConfig.tailoredDocuments.color,
        bottomColor: isApplicationsLarger
          ? chartConfig.tailoredDocuments.color
          : chartConfig.applications.color,
      } as EnhancedChartDataPoint & { topColor: string; bottomColor: string };
    });
  }, [activeIndex, chartData]);

  const handleMouseEnter = useCallback((_data: any, index: number): void => {
    setActiveIndex(index);
  }, []);

  const handleMouseLeave = useCallback((): void => {
    setActiveIndex(null);
  }, []);

  const CustomBarShape = ({ payload, x, y, width, height, index }: any) => {
    if (!payload || index !== activeIndex) {
      // Render an invisible rect to satisfy the type requirement
      return (
        <rect x={x} y={y} width={width} height={height} fill="transparent" />
      );
    }
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill="url(#customGradient)"
          fillOpacity={0.6}
          rx={16}
        />
      </g>
    );
  };

  return (
    <Card className="w-full shadow-lg border border-gray-200 grid grid-cols-1 font-inter">
      <CardHeader className="flex items-center justify-between gap-4 flex-wrap pr-4">
        <div className="">
          <CardTitle className="text-2xl font-bold text-gray-900 text-nowrap">
            Usage Trend
          </CardTitle>
        </div>
        <div className="flex flex-wrap justify-center gap-4 ">
          <div className="flex items-center gap-2">
            <div
              className="size-2 rounded-full shrink-0"
              style={{ backgroundColor: chartConfig.applications.color }}
            />
            <span className="text-sm font-medium text-gray-700 text-nowrap">
              Auto Applications
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="size-2 rounded-full shrink-0"
              style={{ backgroundColor: chartConfig.tailoredDocuments.color }}
            />
            <span className="text-sm font-medium text-gray-700 text-nowrap">
              Tailored Documents
            </span>
          </div>
          <Select defaultValue="last-week">
            <SelectTrigger className="w-">
              <SelectValue placeholder="Select a duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Duration</SelectLabel>
                <SelectItem value="last-week">Last week</SelectItem>
                <SelectItem value="last-month">Last month</SelectItem>
                <SelectItem value="last-3-months">Last 3 months</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ChartContainer config={chartConfig} className="w-full h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartDataWithBars}
              margin={{
                top: 20,
                right: 30,
                bottom: 20,
              }}
              onMouseMove={(state) => {
                if (
                  state?.activeTooltipIndex !== undefined &&
                  state.activeTooltipIndex !== null
                ) {
                  handleMouseEnter(
                    //@ts-ignore
                    state.activePayload as any,
                    state.activeTooltipIndex as any
                  );
                }
              }}
              onMouseLeave={handleMouseLeave}
            >
              <CartesianGrid
                strokeDasharray="0 0"
                stroke="#E6EDFF"
                // strokeOpacity={1}
                vertical={false}
                // horizontal={false}
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#64748b",
                  fontSize: 12,
                  fontWeight: 500,
                  fontFamily: "Outfit",
                }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#64748b",
                  fontSize: 12,
                  fontWeight: 500,
                  fontFamily: "Outfit",
                }}
                dx={-10}
              />
              <defs>
                <linearGradient id="customGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E6EDFF" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#0F123F" stopOpacity={0.31} />
                </linearGradient>
              </defs>
              <ChartTooltip
                content={
                  <CveraiChartTooltipContent
                    // hideLabel
                    labelFormatter={(value) => {
                      return String(value);
                    }}
                  />
                }
                cursor={false}
                defaultIndex={1}
              />
              <Line
                type="monotone"
                dataKey="applications"
                stroke={chartConfig.applications.color}
                stroke-width={3}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="tailoredDocuments"
                stroke={chartConfig.tailoredDocuments.color}
                stroke-width={3}
                dot={false}
              />{" "}
              <Bar
                dataKey="Total"
                fill="transparent"
                stroke="none"
                barSize={40}
                shape={CustomBarShape}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
