import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { NewsArticle } from "../types";

export interface NewsFeaturedHeroProps {
  article: NewsArticle;
}

export function NewsFeaturedHero({ article }: NewsFeaturedHeroProps) {
  const detailHref = `/berita/${article.slug}`;

  return (
    <Link
      href={detailHref}
      className="group block mb-10 sm:mb-12 rounded-2xl sm:rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-[#141414] overflow-hidden hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-300 shadow-none cursor-pointer"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
        {/* Thumbnail Image (Fills full height of card on desktop) */}
        <div className="lg:col-span-7 relative w-full aspect-[16/10] sm:aspect-[16/9] lg:aspect-auto lg:h-full min-h-[260px] sm:min-h-[300px] lg:min-h-full overflow-hidden bg-neutral-100 dark:bg-neutral-900 block">
          <img
            src={article.image || "/empty-news.webp"}
            alt={article.title}
            loading="eager"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        {/* Content Details */}
        <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
              <span className="font-semibold text-primary">{article.category}</span>
              <span>•</span>
              <span>{article.publishedAt}</span>
            </div>

            {/* Title (Flat color, does not change color on hover) */}
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-950 dark:text-white leading-normal">
              {article.title}
            </h2>

            <p className="text-xs sm:text-sm md:text-base text-neutral-600 dark:text-neutral-300 leading-loose line-clamp-3">
              {article.excerpt}
            </p>
          </div>

          <div className="pt-4 mt-3 flex items-center justify-end">
            <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary group-hover:text-primary/80 transition-colors py-1 px-2 rounded-lg group-hover:bg-primary/5 dark:group-hover:bg-primary/10">
              <span>Baca Selengkapnya</span>
              <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
