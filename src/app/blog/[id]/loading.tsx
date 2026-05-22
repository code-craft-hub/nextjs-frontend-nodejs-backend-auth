import { Skeleton } from "@/components/ui/skeleton";

export default function BlogPostLoading() {
  return (
    <section className="min-h-screen">
      <div className="py-10">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          <Skeleton className="h-10 w-3/4" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-72 w-full rounded-xl" />
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className={`h-4 ${i % 4 === 3 ? "w-2/3" : "w-full"}`} />
            ))}
          </div>
          <div className="space-y-3 pt-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className={`h-4 ${i % 3 === 2 ? "w-3/4" : "w-full"}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
