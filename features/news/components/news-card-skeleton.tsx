import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function NewsCardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-[#141414] overflow-hidden shadow-none">
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <div className="p-5 sm:p-6 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-4 w-24 rounded" />
        </div>
        <Skeleton className="h-6 w-5/6 rounded" />
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-3/4 rounded" />
      </div>
    </div>
  );
}
