"use client";

import { memo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export const EmptyRecentActivity = memo(function EmptyRecentActivity() {
  const router = useRouter();

  const goToSettings = useCallback(() => {
    router.push("/dashboard/settings?tab=profile-management");
  }, [router]);

  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <img src="/empty.png" alt="Empty state" />
        </EmptyMedia>
        <EmptyTitle>Attention!!</EmptyTitle>
        <EmptyDescription>
          Please modify your Job title in the settings page to get more job
          recommendations. Click the button below to go to settings.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={goToSettings} variant="outline" size="sm">
          Go to Settings
        </Button>
      </EmptyContent>
    </Empty>
  );
});
