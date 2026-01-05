"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { prefetchDashboardData } from "../prefetch/dashboard.prefetch";
import { JobFilters } from "@/lib/types/jobs";

type UseDashboardPrefetchProps = {
  filters: JobFilters;
  autoApplyFilters: JobFilters;
  enabled?: boolean;
};

export function useDashboardPrefetch({
  filters,
  autoApplyFilters,
  enabled = true,
}: UseDashboardPrefetchProps) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    prefetchDashboardData(queryClient, {
      filters,
      autoApplyFilters,
    });
    console.count("useDashboardPrefetch Rendered");
  }, [queryClient, filters, autoApplyFilters, enabled]);
}
