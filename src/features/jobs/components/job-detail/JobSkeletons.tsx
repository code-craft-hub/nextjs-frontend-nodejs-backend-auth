import { Skeleton } from "@/components/ui/skeleton";

export function JobDescriptionSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 items-center">
      {Array.from({ length: 6 }).map((_, i) => (
        <div className="space-y-2 w-full" key={i}>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
}

export function JobTitleSkeleton() {
  return (
    <div className="flex gap-4">
      <Skeleton className="h-16 w-16" />
      <div className="gap-2 grid">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-6 w-32" />
      </div>
    </div>
  );
}
