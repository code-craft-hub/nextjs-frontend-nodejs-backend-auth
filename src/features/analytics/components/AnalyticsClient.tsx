"use client";
import { AnalyticsCard } from "./AnalyticsCard";
import { UsageTrendDashboard } from "./line-bar-chart";
import { RecentResumes } from "./RecentResumes";
import { RecentCoverLetters } from "./RecentCoverLetters";
import { InterviewQuestionMetrics } from "./InterviewQuestionMetrics";
import { ActivityStats } from "./ActivityStats";

const AnalyticsClient = () => {
  return (
    <div className="space-y-8">
      {/* Totals */}
      <AnalyticsCard />

      {/* Usage trend — applications vs tailored docs over 12 months */}
      <UsageTrendDashboard />

      {/* Document metrics — resumes and cover letters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RecentResumes />
        <RecentCoverLetters />
      </div>

      {/* Interview questions and activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InterviewQuestionMetrics />
        <ActivityStats />
      </div>
    </div>
  );
};

export default AnalyticsClient;
