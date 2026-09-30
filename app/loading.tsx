import { Skeleton } from "@/components/ui/skeleton";

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navbar Skeleton */}
      <div className="w-full border-b border-border/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <Skeleton className="h-9 w-36 rounded-xl" />
        <div className="hidden md:flex items-center gap-6">
          <Skeleton className="h-5 w-16 rounded" />
          <Skeleton className="h-5 w-16 rounded" />
          <Skeleton className="h-5 w-16 rounded" />
          <Skeleton className="h-5 w-16 rounded" />
        </div>
        <Skeleton className="h-9 w-24 rounded-full" />
      </div>

      {/* Hero Banner Skeleton */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-6 flex-1">
        <div className="space-y-4 max-w-2xl">
          <Skeleton className="h-10 sm:h-12 w-3/4 rounded-xl" />
          <Skeleton className="h-5 w-full rounded" />
          <Skeleton className="h-5 w-2/3 rounded" />
          <div className="flex gap-3 pt-2">
            <Skeleton className="h-11 w-32 rounded-full" />
            <Skeleton className="h-11 w-32 rounded-full" />
          </div>
        </div>

        {/* Content Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-[#141414] overflow-hidden p-6 space-y-4 shadow-none"
            >
              <Skeleton className="h-12 w-12 rounded-xl" />
              <Skeleton className="h-6 w-3/4 rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-5/6 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
