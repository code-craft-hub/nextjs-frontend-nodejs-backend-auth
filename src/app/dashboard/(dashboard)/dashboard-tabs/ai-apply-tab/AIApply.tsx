"use client";
import { memo, useEffect, useState } from "react";
import { AIApplyInput } from "./AIApplyInput";
import { RecentActivityCard } from "../../components/RecentActivityCard";
import { AIApplyDatatable } from "./AIApplyDatatable";
import { jobsQueries } from "@/lib/queries/jobs.queries";
import { useQuery } from "@tanstack/react-query";
import { JobFilters } from "@/lib/types/jobs";
import { aiApplyQueries } from "@/lib/queries/ai-apply.queries";
import { checkAuthStatus } from "@/app/dashboard/settings/(google-gmail-authorization)/gmail-authorization-service";
import { useRouter } from "next/navigation";
import { userQueries } from "@/lib/queries/user.queries";

export const AIApply = memo(
  ({
    jobDescription,
    filters,
  }: {
    jobDescription: string;
    filters: JobFilters;
  }) => {
    const [notification, setNotification] = useState(false);
    const { data: aiApply } = useQuery(aiApplyQueries.all(filters));
    const { data: user } = useQuery(userQueries.detail());

    const noDataSource = user?.dataSource?.length === 0;
    // const aiApplyData =
    //   aiApply?.data?.map((item: any) => ({ ...item.data, id: item?.id })) || [];

    const { data: jobs } = useQuery(jobsQueries.all(filters));

    useEffect(() => {
      const checkAuthorization = async () => {
        const authStatus = await checkAuthStatus();
        if (authStatus?.success) {
          setNotification(authStatus?.data?.isAuthorized);
        }
      };
      checkAuthorization();
    }, [notification]);

    const router = useRouter();
    return (
      <div className="flex flex-col font-poppins relative">
        <div className="mb-12">
          <h1 className="font-instrument text-3xl text-center tracking-tighter ">
            AI Assist to Apply
          </h1>
          {!notification && (
            <p
              onClick={() =>
                router.push("/dashboard/settings?tab=ai-applypreference")
              }
              className="text-center mx-auto text-gray-400 text-xs mt-2 hover:underline cursor-pointer"
            >
              Authorize your email account to use email Auto apply
            </p>
          )}
          {noDataSource && (
            <p
              onClick={() =>
                router.push("/dashboard/settings?tab=ai-applypreference")
              }
              className="text-center mx-auto text-gray-400 text-xs  hover:underline cursor-pointer"
            >
              Please add at least one profile/resume, it&apos;ll be used for your job personalisation and applications.
            </p>
          )}
        </div>
        <div className="grid gap-y-16">
          <AIApplyInput jobDescription={jobDescription} />
          <AIApplyDatatable data={aiApply?.data ?? []} jobs={jobs} />
          <RecentActivityCard filters={filters} />
        </div>
      </div>
    );
  }
);
AIApply.displayName = "AIApply";
