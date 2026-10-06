import { PublicShell } from "@/components/layout";
import { Skeleton } from "@/components/ui/skeleton";

export default function BookingLoading() {
  return (
    <PublicShell>
      {/* Search Header Skeleton */}
      <div className="w-full border-b border-neutral-100 dark:border-neutral-800/80 py-8 sm:py-10 bg-white dark:bg-[#121212]">
        <div className="mx-auto max-w-4xl px-4 sm:px-8 space-y-6">
          <Skeleton className="h-10 sm:h-12 w-64 sm:w-80 mx-auto rounded-2xl sm:rounded-3xl" />
          <Skeleton className="h-14 w-full rounded-2xl sm:rounded-3xl sm:rounded-full border border-neutral-300 dark:border-neutral-700" />
        </div>
      </div>

      {/* Categories Bar Skeleton */}
      <div className="w-full border-b border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#101112] py-4">
        <div className="mx-auto max-w-[2520px] px-4 sm:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Skeleton className="size-6 rounded-full" />
                <Skeleton className="h-3 w-16 rounded" />
              </div>
            ))}
          </div>
          <Skeleton className="h-10 w-28 rounded-2xl sm:rounded-3xl shrink-0" />
        </div>
      </div>

      {/* Main Grid Skeleton */}
      <div className="mx-auto w-full max-w-[2520px] px-4 sm:px-8 xl:px-12 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-x-6 gap-y-10">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <Skeleton className="aspect-[20/19] w-full rounded-2xl sm:rounded-3xl" />
              <div className="space-y-1.5 pt-0.5">
                <Skeleton className="h-4 w-3/4 rounded" />
                <Skeleton className="h-3.5 w-1/2 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </PublicShell>
  );
}
