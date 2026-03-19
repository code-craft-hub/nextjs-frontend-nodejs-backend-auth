"use client";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { sendGTMEvent } from "@next/third-parties/google";
import { cn } from "@/lib/utils";
import { userQueries } from "@features/user";
import { ReportCard } from "@/features/jobs/components/ReportCard";
import { JobList } from "@/features/job-posts";
import { useCallback } from "react";
import { JobSearchForm } from "@/features/job-posts/components/JobSearchForm";
import { useSidebar } from "@/components/ui/sidebar";
import LeftMenu from "./LeftMenu";

export default function Overview() {
  const [query, setQuery] = useState<string | undefined>(undefined);
  const { data: user } = useQuery(userQueries.detail());
  const handleSearch = useCallback((value: string) => {
    const trimmed = value.trim();
    setQuery(trimmed.length ? trimmed : undefined);
  }, []);

  useEffect(() => {
    if (user?.firstName) {
      sendGTMEvent({
        event: "Job Page",
        value: `${user.firstName} viewed Job Page`,
      });
    }
  }, [user?.firstName]);

  const { open } = useSidebar();

  return (
    <div className={cn(!open && "flex flex-row gap-4")}>
      <div className={cn(open && "hidden")}>
        <LeftMenu />
      </div>
      <div className="grid grid-cols-1 gap-4 pb-16">
        <ReportCard matchPercentage={0} />
        <JobSearchForm onSubmit={handleSearch} />
        <JobList query={query} />
      </div>
    </div>
  );
}