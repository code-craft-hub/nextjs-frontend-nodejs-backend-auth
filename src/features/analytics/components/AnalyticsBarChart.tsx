"use client";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { ChevronDown } from "lucide-react";

const data = [
  { month: "JAN", value: 0 },
  { month: "FEB", value: 1 },
  { month: "MAR", value: 2 },
  { month: "APR", value: 3 },
  { month: "MAY", value: 4 },
  { month: "JUN", value: 5 },
  { month: "JUL", value: 6 },
  { month: "AUG", value: 7 },
  { month: "SEP", value: 8 },
  { month: "OCT", value: 9 },
  { month: "NOV", value: 16 },
  { month: "DEC", value: 0 },
];
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-4 py-3 rounded-xl shadow-lg border border-gray-100">
        <p className="text-sm font-medium text-gray-900">
          {payload[0].payload.month}
        </p>
        <p className="text-lg font-semibold text-indigo-600">
          {payload[0].value}%
        </p>
      </div>
    );
  }
  return null;
};
export const AnalyticsBarChart = () => {
  return (
    <div className="w-full bg-white rounded-3xl p-8 shadow-sm">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">
          Job Match Metrics
        </h1>
        <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
          Past 7 days
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      <div className="w-full h-96 border-t">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: -20, bottom: 20 }}
          >
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9CA3AF", fontSize: 14 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9CA3AF", fontSize: 14 }}
              ticks={[0, 50, 70, 90, 100]}
              tickFormatter={(value) => `${value}%`}
              domain={[0, 100]}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "transparent" }}
            />

            <Bar
              dataKey="value"
              fill="#6366F1"
              radius={[50, 50, 50, 50]}
              barSize={28}
              background={{ fill: "#F2F7FF", radius: 50 }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
