import { Skeleton } from "@/components/ui/skeleton";

export default function CMSAssetsLoading() {
  return (
    <div className="space-y-6 py-4">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-44 rounded-lg" />
          <Skeleton className="h-4 w-64 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>

      {/* Filter and Search Bar Skeleton */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Skeleton className="h-10 flex-1 w-full rounded-xl" />
        <Skeleton className="h-10 w-36 rounded-xl" />
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>

      {/* Table Skeleton */}
      <div className="rounded-2xl border border-dashed border-border bg-white dark:bg-card overflow-hidden">
        <div className="p-4 border-b border-border/80 flex items-center justify-between">
          <Skeleton className="h-5 w-32 rounded" />
          <Skeleton className="h-5 w-20 rounded" />
        </div>
        <div className="divide-y divide-border/60">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <Skeleton className="size-10 rounded-lg shrink-0" />
                <div className="space-y-1.5 flex-1 max-w-sm">
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <Skeleton className="h-3.5 w-1/2 rounded" />
                </div>
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-4 w-24 rounded hidden sm:block" />
              <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
