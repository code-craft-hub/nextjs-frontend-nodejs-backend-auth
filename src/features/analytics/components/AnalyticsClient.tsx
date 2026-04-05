"use client";
import { AnalyticsCard } from "./AnalyticsCard";
import { UsageTrendDashboard } from "./UsageTrendDashboard";
import { AnalyticBarChart } from "./AnalyticBarChart";

const AnalyticsClient = () => {
  return (
    <div className="space-y-8">
      <AnalyticsCard />
      <UsageTrendDashboard />
      <AnalyticBarChart />    
    </div>
  );
};

export default AnalyticsClient;
