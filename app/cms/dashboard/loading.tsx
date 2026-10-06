import { Skeleton } from "@/components/ui/skeleton";

export default function CMSDashboardLoading() {
  return (
    <div className="space-y-6 py-4">
      {/* Title */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48 rounded-2xl sm:rounded-3xl" />
        <Skeleton className="h-4 w-72 rounded" />
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-card border border-dashed border-border space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="size-10 rounded-2xl sm:rounded-3xl" />
              <Skeleton className="h-4 w-12 rounded" />
            </div>
            <Skeleton className="h-7 w-20 rounded" />
            <Skeleton className="h-3.5 w-32 rounded" />
          </div>
        ))}
      </div>

      {/* Chart & Activities Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-card border border-dashed border-border space-y-4">
          <Skeleton className="h-6 w-48 rounded" />
          <Skeleton className="h-64 w-full rounded-2xl sm:rounded-3xl" />
        </div>
        <div className="lg:col-span-4 p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-card border border-dashed border-border space-y-4">
          <Skeleton className="h-6 w-36 rounded" />
          <div className="space-y-3 pt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="size-9 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <Skeleton className="h-3 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
