"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NewsArticle } from "../types";

export interface NewsCardProps {
  article: NewsArticle;
  variant?: "standard" | "compact";
  index?: number;
  hoveredIndex?: number | null;
  setHoveredIndex?: (index: number | null) => void;
}

export function NewsCard({
  article,
  variant = "standard",
}: NewsCardProps) {
  const detailHref = `/berita/${article.slug}`;

  if (variant === "compact") {
    return (
      <Link
        href={detailHref}
        className="group flex gap-3.5 items-start p-2.5 rounded-xl hover:bg-neutral-100/70 dark:hover:bg-neutral-900/60 transition-colors cursor-pointer"
      >
        <div className="relative shrink-0 w-20 sm:w-24 aspect-[4/3] rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800">
          <img
            src={article.image || "/empty-news.webp"}
            alt={article.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.src.includes("empty-news.webp")) {
                target.src = "/empty-news.webp";
              }
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 mb-1">
            <span className="font-semibold text-primary">{article.category}</span>
            <span>•</span>
            <span>{article.publishedAt}</span>
          </div>
          <h4 className="text-xs sm:text-sm font-semibold text-neutral-950 dark:text-white leading-loose line-clamp-2">
            {article.title}
          </h4>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary group-hover:text-primary/80 mt-2 transition-colors">
            <span>Baca Selengkapnya</span>
            <ArrowRight className="size-3 transition-transform duration-200 group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={detailHref}
      className="group flex flex-col rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-[#141414] overflow-hidden hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-300 ease-out shadow-none cursor-pointer block"
    >
      {/* Thumbnail (Flat, no hover zoom/pop animation) */}
      <div className="block relative aspect-[16/10] overflow-hidden bg-neutral-100 dark:bg-neutral-900">
        <img
          src={article.image || "/empty-news.webp"}
          alt={article.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.currentTarget;
            if (!target.src.includes("empty-news.webp")) {
              target.src = "/empty-news.webp";
            }
          }}
        />
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Category & Date */}
          <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
            <span className="font-semibold text-primary">{article.category}</span>
            <span>•</span>
            <span>{article.publishedAt}</span>
          </div>

          {/* Title (Flat color, does not change color on hover) */}
          <h3 className="text-sm sm:text-base font-bold text-neutral-950 dark:text-white leading-loose line-clamp-2">
            {article.title}
          </h3>

          {/* Excerpt */}
          <p className="text-xs sm:text-[13px] text-neutral-600 dark:text-neutral-300 leading-loose line-clamp-2">
            {article.excerpt}
          </p>
        </div>

        {/* Read More Link (Borderless) */}
        <div className="pt-3 mt-3 flex items-center justify-end">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:text-primary/80 transition-colors py-1 px-2 rounded-lg group-hover:bg-primary/5 dark:group-hover:bg-primary/10">
            <span>Baca Selengkapnya</span>
            <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}
