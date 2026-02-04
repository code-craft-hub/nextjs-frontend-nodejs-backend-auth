"use client";

import { memo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const LoadingSkeleton = memo(function LoadingSkeleton() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-34 w-full rounded-xl" />
    </div>
  );
});
