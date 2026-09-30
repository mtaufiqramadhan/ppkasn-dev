import { PublicShell } from "@/components/layout";
import { Skeleton } from "@/components/ui/skeleton";

export default function BeritaDetailLoading() {
  return (
    <PublicShell>
      <article className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-20 sm:pb-28">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-2 mb-6">
          <Skeleton className="h-4 w-16 rounded" />
          <span className="text-neutral-400">/</span>
          <Skeleton className="h-4 w-16 rounded" />
          <span className="text-neutral-400">/</span>
          <Skeleton className="h-4 w-32 rounded" />
        </div>

        {/* Title Skeleton */}
        <div className="space-y-3 mb-6">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-8 sm:h-12 w-full rounded-xl" />
          <Skeleton className="h-8 sm:h-12 w-4/5 rounded-xl" />
        </div>

        {/* Meta Skeleton */}
        <div className="flex items-center gap-4 pb-6 border-b border-neutral-200/80 dark:border-neutral-800 mb-8">
          <Skeleton className="size-10 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-3.5 w-24 rounded" />
          </div>
        </div>

        {/* Banner Image Skeleton */}
        <div className="rounded-2xl sm:rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 overflow-hidden mb-10">
          <Skeleton className="aspect-[16/9] w-full rounded-none" />
        </div>

        {/* Content Paragraphs Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-5 w-full rounded" />
          <Skeleton className="h-5 w-11/12 rounded" />
          <Skeleton className="h-5 w-4/5 rounded" />
          <div className="py-2" />
          <Skeleton className="h-5 w-full rounded" />
          <Skeleton className="h-5 w-10/12 rounded" />
          <Skeleton className="h-5 w-3/4 rounded" />
        </div>
      </article>
    </PublicShell>
  );
}
