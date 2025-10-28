"use client";
import { memo } from "react";
import JobDashboard from "./FindJobClient";
import { jobsQueries } from "@/lib/queries/jobs.queries";
import { useQuery } from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";
import { ColumnDef } from "@tanstack/react-table";
import {
  BookmarkIcon,
  Calendar,
  DollarSign,
  MapPin,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { humanDate, randomPercentage } from "@/lib/utils/helpers";
import { JobType } from "@/types";
import { JobFilters } from "@/lib/types/jobs";
import { Toggle } from "@/components/ui/toggle";
import { apiService } from "@/hooks/use-auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
// import {
//   HoverCard,
//   HoverCardContent,
//   HoverCardTrigger,
// } from "@/components/ui/hover-card";
// import { Badge } from "@/components/ui/badge";
// Move column definition outside component and make it a function
export const getFindJobsColumns = (
  router: AppRouterInstance
): // updateJobs: ReturnType<typeof useUpdateJobMutation>
ColumnDef<JobType>[] => [
  {
    accessorKey: "companyText",
    header: "Company",
    cell: ({ row }) => (
      <div className="shrink-0 flex items-center justify-center size-16">
        <img
          src={
            !!row.original.companyLogo
              ? row.original.companyLogo
              : "/placeholder.jpg"
          }
          alt={row.original.companyText}
          className="size-12"
        />
      </div>
    ),
  },

  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <div className="capitalize">
        <div className="flex gap-4 items-center">
          <div className="font-medium text-xs max-w-sm overflow-hidden">
            {row.getValue("title")}
          </div>
          <div className="bg-blue-50 rounded text-blue-600 px-2 py-1">
            <span className="text-2xs">
              {!!row.original.jobType
                ? row.original.jobType
                : row.original.employmentType}
            </span>
          </div>
        </div>
        <div className="flex gap-x-4 mt-1">
          <p className="flex gap-1 text-gray-400 items-center">
            <MapPin className="size-3" />
            <span className="text-2xs">{row.original.location}</span>
          </p>
          <p className="flex gap-1 text-gray-400 items-center">
            <DollarSign className="size-3" />
            <span className="text-2xs">
              {!!row.original?.salary ? row.original?.salary : "Not disclosed"}
            </span>
          </p>
          <p className="flex gap-1 text-gray-400 items-center">
            <Calendar className="size-3" />
            <span className="text-2xs">
              {humanDate(row.original?.scrapedAt)}
            </span>
          </p>
          <p className="text-2xs text-green-400">{randomPercentage(10)}</p>
        </div>
      </div>
    ),
  },

  {
    accessorKey: "isBookmarked",
    header: () => <div className=""></div>,
    cell: ({ row }) => {
      return (
        <div
          onClick={() => {
            // updateJobs.mutate({
            //   id: String(row.original.id),
            //   data: {
            //     isBookmarked: !row.original.isBookmarked,
            //   },
            // });
          }}
          className="flex justify-end"
        >
          <Toggle
            pressed={row.original.isBookmarked}
            aria-label="Toggle bookmark"
            size="sm"
            variant="outline"
            className="data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-blue-500 data-[state=on]:*:[svg]:stroke-blue-500"
          >
            <BookmarkIcon />
          </Toggle>
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <div className="flex justify-end">
          {/* <HoverCard>
            <HoverCardTrigger> */}
              <Button
                // onClick={() => {
                //   window.open(row.original.link, "_blank");
                // }}

                className="w-full"

                onClick={async () => {
                  if (!row.original?.emailApply) {
                    window.open(row.original.link, "__blank");
                    return;
                  }

                  const { isAuthorized } = await apiService.gmailOauthStatus();

                  if (!isAuthorized) {
                    toast.error(
                      "✨ Go to the Settings page and enable authorization for Cverai to send emails on your behalf. This option is located in the second card.",
                      {
                        action: {
                          label: "Authorize now",
                          onClick: () =>
                            router.push(
                              `/dashboard/settings?tab=ai-applypreference`
                            ),
                        },
                        classNames: {
                          actionButton:
                            "!bg-blue-600 hover:!bg-blue-700 !text-white !h-8",
                        },
                      }
                    );

                    return;
                  }

                  const params = new URLSearchParams();
                  params.set(
                    "jobDescription",
                    JSON.stringify(row.original?.descriptionText || "")
                  );
                  params.set(
                    "recruiterEmail",
                    encodeURIComponent(row.original?.emailApply)
                  );
                  router.push(
                    `/dashboard/tailor-cover-letter/${uuidv4()}?${params}&aiApply=true`
                  );
                }}
                variant={"button"}
              >
                {row.original?.emailApply ? "Auto Apply" : "Apply Now"}
                {row.original?.emailApply && (
                  <Sparkles className="text-3 text-yellow" />
                )}
              </Button>
            {/* </HoverCardTrigger>
            <HoverCardContent className="w-fit font-garamond">
              <p className="w-full p-1 bg-slate-100 mb-1">Recruiter email:</p>
              <p className="w-full p-1 text-xs bg-slate-100">
                {row.original?.emailApply
                  ? row.original?.emailApply
                  : "Not available"}
              </p>
            </HoverCardContent>
          </HoverCard> */}
        </div>
      );
    },
  },
];

export const FindJob = memo(({ filters }: { filters: JobFilters }) => {
  const { data: initialData } = useQuery({
    ...jobsQueries.all(filters),
    initialData: undefined, // Let it pull from cache
  });
  const router = useRouter();

  // const updateJobs = useUpdateJobMutation();

  // Generate columns with the mutation
  const columns = getFindJobsColumns(router);
  // updateJobs

  return (
    <div className="flex flex-col font-poppins h-screen relative">
      <h1 className="font-instrument text-3xl text-center tracking-tighter mb-8">
        AI Job Document Recommendation
      </h1>
      <div className="grid pb-16 bg">
        <JobDashboard
          initialJobs={initialData?.data ?? []}
          fingJobsColumns={columns}
          filters={filters}
        />
      </div>
    </div>
  );
});

FindJob.displayName = "FindJob";
