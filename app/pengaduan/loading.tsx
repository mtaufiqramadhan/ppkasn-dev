import { PublicShell } from "@/components/layout";
import { Skeleton } from "@/components/ui/skeleton";

export default function PengaduanLoading() {
  return (
    <PublicShell>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-20 sm:pb-28 space-y-10">
        {/* Hero Section Skeleton */}
        <div className="space-y-4 max-w-2xl">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-10 sm:h-12 w-4/5 rounded-xl" />
          <Skeleton className="h-5 w-full rounded" />
          <Skeleton className="h-5 w-3/4 rounded" />
        </div>

        {/* Banner Skeleton */}
        <div className="rounded-2xl sm:rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 overflow-hidden">
          <Skeleton className="aspect-[21/9] min-h-[220px] w-full rounded-none" />
        </div>

        {/* Channels Grid Skeleton */}
        <div className="space-y-6">
          <Skeleton className="h-8 w-56 rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-[#141414] p-6 sm:p-7 space-y-4">
              <Skeleton className="h-4 w-12 rounded" />
              <Skeleton className="h-6 w-3/4 rounded-lg" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-5/6 rounded" />
              <Skeleton className="h-10 w-44 rounded-xl pt-2" />
            </div>
            <div className="rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-[#141414] p-6 sm:p-7 space-y-4">
              <Skeleton className="h-4 w-12 rounded" />
              <Skeleton className="h-6 w-3/4 rounded-lg" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-5/6 rounded" />
              <Skeleton className="h-10 w-44 rounded-xl pt-2" />
            </div>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
