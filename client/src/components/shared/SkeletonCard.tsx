import { Skeleton } from "@/components/ui/skeleton";

export default function SkeletonCard() {
  return (
    <div>
      <div className="flex gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-12 rounded-md bg-skeleton" />
          <Skeleton className="h-2 w-6 rounded-md bg-skeleton" />
          <Skeleton className="h-4 w-12 rounded-md bg-skeleton" />
        </div>
        <div>
          <Skeleton className="h-10 w-[230px] bg-skeleton " />
          <div className="space-y-2 mt-2">
            <Skeleton className="h-4 w-[230px] bg-skeleton" />
          </div>
        </div>
      </div>
    </div>
  );
}
