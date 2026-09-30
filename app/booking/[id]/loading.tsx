import { PublicShell } from "@/components/layout";
import { Skeleton } from "@/components/ui/skeleton";

export default function BookingDetailLoading() {
  return (
    <PublicShell>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Title & Actions Bar */}
        <div className="space-y-3">
          <Skeleton className="h-8 sm:h-10 w-2/3 max-w-lg rounded-xl" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
          </div>
        </div>

        {/* Photo Gallery Skeleton */}
        <div className="rounded-2xl sm:rounded-3xl overflow-hidden border border-neutral-200/80 dark:border-neutral-800">
          <Skeleton className="aspect-[21/9] min-h-[300px] w-full rounded-none" />
        </div>

        {/* Content & Booking Form Columns Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Details */}
          <div className="lg:col-span-7 space-y-6">
            <div className="pb-6 border-b border-neutral-200/80 dark:border-neutral-800 space-y-3">
              <Skeleton className="h-6 w-48 rounded" />
              <Skeleton className="h-4 w-64 rounded" />
            </div>

            <div className="space-y-3">
              <Skeleton className="h-5 w-36 rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-3/4 rounded" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <Skeleton className="h-12 rounded-xl" />
              <Skeleton className="h-12 rounded-xl" />
            </div>
          </div>

          {/* Right Column: Reservation Box */}
          <div className="lg:col-span-5 rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6 space-y-4 shadow-none">
            <Skeleton className="h-6 w-36 rounded" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
