import { Skeleton } from "@/components/ui/skeleton";

export default function CMSRoomLoading() {
  return (
    <div className="space-y-6 py-4">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <Skeleton className="h-4 w-72 rounded" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>

      {/* Grid Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-dashed border-border bg-white dark:bg-card overflow-hidden p-4 space-y-3"
          >
            <Skeleton className="aspect-[16/10] w-full rounded-xl" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-3/5 rounded" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-1/3 rounded" />
            <div className="pt-2 flex justify-end gap-2 border-t border-border/60">
              <Skeleton className="h-8 w-16 rounded-lg" />
              <Skeleton className="h-8 w-16 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
