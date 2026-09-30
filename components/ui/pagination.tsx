import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  )
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-wrap items-center gap-1.5 sm:gap-2", className)}
      {...props}
    />
  )
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationButtonProps = {
  isActive?: boolean
  size?: "default" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg"
} & React.ComponentProps<"button">

function PaginationButton({
  className,
  isActive,
  size = "icon-sm",
  ...props
}: PaginationButtonProps) {
  return (
    <button
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-button"
      data-active={isActive}
      className={cn(
        buttonVariants({
          variant: isActive ? "default" : "outline",
          size,
        }),
        "rounded-full transition-all cursor-pointer font-semibold text-xs",
        isActive
          ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-none"
          : "border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/80",
        className
      )}
      {...props}
    />
  )
}

type PaginationLinkProps = {
  isActive?: boolean
  size?: "default" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg"
} & React.ComponentProps<"a">

function PaginationLink({
  className,
  isActive,
  size = "icon-sm",
  ...props
}: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        buttonVariants({
          variant: isActive ? "default" : "outline",
          size,
        }),
        "rounded-full transition-all cursor-pointer font-semibold text-xs",
        isActive
          ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-none"
          : "border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/80",
        className
      )}
      {...props}
    />
  )
}

function PaginationPrevious({
  className,
  text = "Sebelumnya",
  ...props
}: React.ComponentProps<typeof PaginationButton> & { text?: string }) {
  return (
    <PaginationButton
      aria-label="Halaman Sebelumnya"
      size="sm"
      className={cn("gap-1 px-3 rounded-full text-xs font-medium", className)}
      {...props}
    >
      <ChevronLeft className="size-4" />
      <span className="hidden sm:inline">{text}</span>
    </PaginationButton>
  )
}

function PaginationNext({
  className,
  text = "Selanjutnya",
  ...props
}: React.ComponentProps<typeof PaginationButton> & { text?: string }) {
  return (
    <PaginationButton
      aria-label="Halaman Selanjutnya"
      size="sm"
      className={cn("gap-1 px-3 rounded-full text-xs font-medium", className)}
      {...props}
    >
      <span className="hidden sm:inline">{text}</span>
      <ChevronRight className="size-4" />
    </PaginationButton>
  )
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden="true"
      data-slot="pagination-ellipsis"
      className={cn("flex size-9 items-center justify-center text-neutral-400 dark:text-neutral-500", className)}
      {...props}
    >
      <MoreHorizontal className="size-4" />
      <span className="sr-only">Halaman lainnya</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationButton,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
}
