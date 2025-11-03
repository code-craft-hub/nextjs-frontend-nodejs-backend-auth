"use client";
import { AnalyticsCard } from "./components/AnalyticsCard";
import { UsageTrendDashboard } from "./components/line-bar-chart";
import { AnalyticsBarChart } from "./components/AnalyticsBarChart";
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
