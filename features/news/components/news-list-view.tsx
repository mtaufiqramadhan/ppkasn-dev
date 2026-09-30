"use client";

import React, { useState, useMemo, useRef } from "react";
import { Search, X, Inbox } from "lucide-react";
import { NewsService } from "../services/news-service";
import { NewsCard } from "./news-card";
import { NewsFeaturedHero } from "./news-featured-hero";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationButton,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";

export interface NewsListViewProps {
  initialCategory?: string;
}

const ITEMS_PER_PAGE = 6;

function getPaginationRange(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 6) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "ellipsis")[] = [];

  if (current <= 3) {
    pages.push(1, 2, 3, 4, "ellipsis", total);
  } else if (current >= total - 2) {
    pages.push(1, "ellipsis", total - 3, total - 2, total - 1, total);
  } else {
    pages.push(1, "ellipsis", current - 1, current, current + 1, "ellipsis", total);
  }

  return pages;
}

export function NewsListView({ initialCategory }: NewsListViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const gridTopRef = useRef<HTMLDivElement>(null);

  const featuredArticle = useMemo(() => {
    return NewsService.getFeaturedNews();
  }, []);

  const isDefaultView = !searchQuery.trim();

  const gridArticles = useMemo(() => {
    const all = NewsService.getAllNews({
      category: initialCategory,
      search: searchQuery,
      sort: "terbaru",
    });
    if (isDefaultView && featuredArticle) {
      return all.filter((a) => a.id !== featuredArticle.id);
    }
    return all;
  }, [searchQuery, initialCategory, isDefaultView, featuredArticle]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(gridArticles.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, gridArticles.length);

  const paginatedArticles = useMemo(() => {
    return gridArticles.slice(startIndex, endIndex);
  }, [gridArticles, startIndex, endIndex]);

  const paginationRange = useMemo(() => {
    return getPaginationRange(currentPage, totalPages);
  }, [currentPage, totalPages]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    setCurrentPage(newPage);
    if (gridTopRef.current) {
      const topOffset = gridTopRef.current.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top: topOffset, behavior: "smooth" });
    }
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-4 sm:pb-6 leading-loose">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-12 pb-6 border-b border-neutral-200/80 dark:border-neutral-800">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight leading-loose">
            Berita Terkini
          </h1>
          <p className="mt-2 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-loose">
            Informasi seputar pengembangan kompetensi dan kegiatan di PPKASN Kemensetneg
          </p>
        </div>

        {/* Clean Search Input */}
        <div className="relative w-full md:w-80 shrink-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Cari berita..."
            className="pl-10 pr-9 h-10 rounded-full border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141414] text-xs sm:text-sm focus-visible:ring-1"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-white"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Featured Story (when in default view and on first page) */}
      {isDefaultView && featuredArticle && currentPage === 1 && (
        <div className="mb-10 sm:mb-14">
          <NewsFeaturedHero article={featuredArticle} />
        </div>
      )}

      {/* Search Result Info */}
      {searchQuery && (
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 leading-loose">
            Menampilkan <span className="font-semibold text-neutral-900 dark:text-white">{gridArticles.length}</span> artikel untuk pencarian <span className="font-medium text-neutral-900 dark:text-white">&ldquo;{searchQuery}&rdquo;</span>
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearSearch}
            className="text-xs text-primary hover:text-primary/80 h-7 px-2"
          >
            Reset
          </Button>
        </div>
      )}

      {/* Main Grid Section */}
      <div ref={gridTopRef} className="scroll-mt-24">
        {/* Section Header with Item Count Info */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-950 dark:text-white tracking-tight">
            {isDefaultView ? "Kabar Terbaru" : `Hasil Pencarian (${gridArticles.length})`}
          </h2>
          {gridArticles.length > 0 && (
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              Menampilkan {startIndex + 1}–{endIndex} dari {gridArticles.length} artikel
            </span>
          )}
        </div>

        {/* Empty State */}
        {gridArticles.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-800 p-12 text-center my-12 bg-neutral-50/50 dark:bg-neutral-900/30">
            <div className="size-12 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400 flex items-center justify-center mx-auto mb-4">
              <Inbox className="size-6" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-1">
              Tidak ada artikel ditemukan
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
              Tidak ada berita yang cocok dengan kata kunci &ldquo;{searchQuery}&rdquo;.
            </p>
          </div>
        ) : (
          <>
            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {paginatedArticles.map((article) => (
                <NewsCard
                  key={article.id}
                  article={article}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 sm:mt-16 pt-8 border-t border-neutral-200/80 dark:border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs text-neutral-500 dark:text-neutral-400 order-2 sm:order-1">
                  Halaman <strong className="font-semibold text-neutral-900 dark:text-white">{currentPage}</strong> dari <strong className="font-semibold text-neutral-900 dark:text-white">{totalPages}</strong>
                </span>

                <div className="order-1 sm:order-2">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className={currentPage === 1 ? "opacity-40 cursor-not-allowed" : ""}
                        />
                      </PaginationItem>

                      {paginationRange.map((page, idx) => {
                        if (page === "ellipsis") {
                          return (
                            <PaginationItem key={`ellipsis-${idx}`}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }

                        return (
                          <PaginationItem key={`page-${page}`}>
                            <PaginationButton
                              isActive={currentPage === page}
                              onClick={() => handlePageChange(page as number)}
                            >
                              {page}
                            </PaginationButton>
                          </PaginationItem>
                        );
                      })}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className={currentPage === totalPages ? "opacity-40 cursor-not-allowed" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
