import { PublicShell } from "@/components/layout";
import { Skeleton } from "@/components/ui/skeleton";
import { NewsCardSkeleton } from "@/features/news";

export default function BeritaLoading() {
  return (
    <PublicShell>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-20 sm:pb-28">
        {/* Header & Search Skeleton */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-12 pb-6 border-b border-neutral-200/80 dark:border-neutral-800">
          <div className="space-y-2">
            <Skeleton className="h-9 sm:h-10 w-48 sm:w-64 rounded-2xl sm:rounded-3xl" />
            <Skeleton className="h-5 w-72 sm:w-96 rounded" />
          </div>
          <Skeleton className="h-10 w-full md:w-80 rounded-full" />
        </div>

        {/* Featured Story Skeleton */}
        <div className="mb-10 sm:mb-14 rounded-2xl sm:rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-[#141414] overflow-hidden shadow-none">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[320px]">
            <Skeleton className="lg:col-span-7 min-h-[260px] lg:min-h-full rounded-none" />
            <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-7 w-5/6 rounded-2xl sm:rounded-3xl" />
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-4/5 rounded" />
              </div>
              <Skeleton className="h-4 w-32 rounded" />
            </div>
          </div>
        </div>

        {/* Section Title Skeleton */}
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-7 w-40 rounded" />
          <Skeleton className="h-4 w-32 rounded" />
        </div>

        {/* Articles Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <NewsCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </PublicShell>
  );
}
