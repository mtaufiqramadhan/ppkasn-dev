"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewsService, NewsCard } from "@/features/news";

export function LandingNews() {
  const articles = NewsService.getAllNews({ limit: 3 });

  return (
    <section id="berita-section" className="scroll-mt-16 pt-16 sm:pt-20 md:pt-24 pb-12 sm:pb-14 md:pb-16 bg-white dark:bg-[#0d0d0d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobbin Header */}
        <div className="flex items-center justify-between mb-8 sm:mb-10">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
              Publikasi &amp; Informasi
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight leading-loose">
              Berita Terkini
            </h2>
          </div>
          <Button
            asChild
            variant="ghost"
            className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white gap-1.5 hidden sm:inline-flex"
          >
            <Link href="/berita">
              <span>Semua Berita</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>

        {/* Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {articles.map((article) => (
            <NewsCard
              key={article.id}
              article={article}
            />
          ))}
        </div>

        {/* Load more news link */}
        <div className="text-center mt-12 sm:mt-16">
          <Button
            asChild
            variant="outline"
            className="rounded-full border-neutral-200 dark:border-neutral-800 px-6 sm:px-8 py-2 font-medium text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <Link href="/berita">
              Lihat Berita Lainnya
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

