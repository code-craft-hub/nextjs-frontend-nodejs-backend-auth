"use client";
import { AnalyticsCard } from "./AnalyticsCard";
import { UsageTrendDashboard } from "./line-bar-chart";
import { AnalyticsBarChart } from "./AnalyticsBarChart";
const AnalyticsClient = () => {
    
  return (
    <div className="space-y-8">
      <AnalyticsCard />
      <UsageTrendDashboard />
      <AnalyticsBarChart />
    </div>
  );
};

export default AnalyticsClient;
