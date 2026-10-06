import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-neutral-200/80 dark:bg-neutral-800/80 animate-pulse rounded-2xl sm:rounded-3xl", className)}
      {...props}
    />
  )
}

export { Skeleton }
