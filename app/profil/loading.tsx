import { PublicShell } from "@/components/layout";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilLoading() {
  return (
    <PublicShell>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-20 sm:pb-28 space-y-12">
        {/* Header / Hero Skeleton */}
        <div className="space-y-4 max-w-3xl pb-8 border-b border-neutral-200/80 dark:border-neutral-800">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-10 sm:h-12 w-3/4 rounded-2xl sm:rounded-3xl" />
          <Skeleton className="h-5 w-full rounded" />
          <Skeleton className="h-5 w-4/5 rounded" />
        </div>

        {/* Vision & Mission Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-7">
          <div className="lg:col-span-5 rounded-2xl sm:rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-[#141414] p-6 sm:p-8 space-y-4">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-8 w-full rounded-2xl sm:rounded-3xl" />
            <Skeleton className="h-4 w-3/4 rounded" />
          </div>
          <div className="lg:col-span-7 rounded-2xl sm:rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-[#141414] p-6 sm:p-8 space-y-4">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-8 w-4/5 rounded-2xl sm:rounded-3xl" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Skeleton className="h-14 rounded-2xl sm:rounded-3xl" />
              <Skeleton className="h-14 rounded-2xl sm:rounded-3xl" />
              <Skeleton className="h-14 rounded-2xl sm:rounded-3xl" />
              <Skeleton className="h-14 rounded-2xl sm:rounded-3xl" />
            </div>
          </div>
        </div>

        {/* Org Structure Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-56 rounded-2xl sm:rounded-3xl" />
          <div className="rounded-2xl sm:rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 overflow-hidden">
            <Skeleton className="aspect-[16/9] w-full rounded-none" />
          </div>
        </div>

        {/* Facilities Grid Skeleton */}
        <div className="space-y-6">
          <Skeleton className="h-8 w-48 rounded-2xl sm:rounded-3xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl sm:rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-[#141414] overflow-hidden"
              >
                <Skeleton className="aspect-[16/10] w-full rounded-none" />
                <div className="p-5 space-y-2.5">
                  <Skeleton className="h-5 w-3/4 rounded" />
                  <Skeleton className="h-4 w-full rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
