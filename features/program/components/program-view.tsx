"use client";

import React, { useState, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { ProgramItem, ProgramType } from "../types";

import { ProgramHero } from "./program-hero";
import { ProgramListItem } from "./program-list-item";
import { ProgramCard } from "./program-card";
import { Inbox, List, LayoutGrid } from "lucide-react";
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

export function ProgramView({ programs }: { programs: ProgramItem[] }) {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab");
  const catalogTopRef = useRef<HTMLDivElement>(null);

  const [activeType, setActiveType] = useState<"all" | ProgramType>(
    initialTab === "diklat" || initialTab === "luar-negeri" ? initialTab : "all"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [currentPage, setCurrentPage] = useState(1);

  // Sync activeType when initialTab changes in URL query
  const [prevInitialTab, setPrevInitialTab] = useState(initialTab);
  if (initialTab !== prevInitialTab) {
    setPrevInitialTab(initialTab);
    if (initialTab === "diklat" || initialTab === "luar-negeri") {
      setActiveType(initialTab);
    }
  }

  // Reset pagination to first page when any filter or search changes during render
  const [prevFilters, setPrevFilters] = useState({
    activeType,
    selectedCategory,
    selectedStatus,
    searchQuery,
  });

  if (
    prevFilters.activeType !== activeType ||
    prevFilters.selectedCategory !== selectedCategory ||
    prevFilters.selectedStatus !== selectedStatus ||
    prevFilters.searchQuery !== searchQuery
  ) {
    setPrevFilters({
      activeType,
      selectedCategory,
      selectedStatus,
      searchQuery,
    });
    setCurrentPage(1);
  }

  const categories = useMemo(() => Array.from(new Set(programs.map(program => program.category))), [programs]);
  const stats = useMemo(() => ({
    total: programs.length,
    diklatCount: programs.filter(program => program.type === "diklat").length,
    lnCount: programs.filter(program => program.type === "luar-negeri").length,
    openCount: programs.filter(program => program.status === "buka").length,
  }), [programs]);
  const filteredPrograms = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return programs.filter(program =>
      (activeType === "all" || program.type === activeType) &&
      (selectedCategory === "all" || program.category === selectedCategory) &&
      (selectedStatus === "all" || program.status === selectedStatus) &&
      (!query || [program.title, program.organizer, program.shortDescription, program.category, program.location, program.country ?? "", ...program.tags, ...(program.subPelatihan ?? []).map(sub => `${sub.title} ${sub.code ?? ""}`)].some(text => text.toLowerCase().includes(query)))
    );
  }, [programs, activeType, selectedCategory, selectedStatus, searchQuery]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredPrograms.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredPrograms.length);

  const paginatedPrograms = useMemo(() => {
    return filteredPrograms.slice(startIndex, endIndex);
  }, [filteredPrograms, startIndex, endIndex]);

  const paginationRange = useMemo(() => {
    return getPaginationRange(currentPage, totalPages);
  }, [currentPage, totalPages]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    setCurrentPage(newPage);
    if (catalogTopRef.current) {
      const topOffset = catalogTopRef.current.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top: topOffset, behavior: "smooth" });
    }
  };

  const handleResetFilters = () => {
    setActiveType("all");
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedStatus("all");
    setCurrentPage(1);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-2 sm:pb-4">
      {/* Hero & Filters Section */}
      <ProgramHero
        activeType={activeType}
        onTypeChange={setActiveType}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        categories={categories}
        stats={stats}
      />

      {/* Program Results List Header */}
      <div ref={catalogTopRef} className="scroll-mt-24">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
              Menampilkan <strong className="text-neutral-900 dark:text-white">{filteredPrograms.length}</strong> program pelatihan
            </p>
            {(searchQuery || selectedCategory !== "all" || selectedStatus !== "all" || activeType !== "all") && (
              <>
                <span className="text-neutral-300 dark:text-neutral-700">•</span>
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-primary hover:underline font-medium cursor-pointer"
                >
                  Reset Filter
                </button>
              </>
            )}
          </div>

          {/* View Mode Toggle: List vs Grid */}
          <div className="flex items-center gap-1 p-0.5 rounded-2xl sm:rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100/70 dark:bg-neutral-900">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              title="Tampilan Daftar"
              className={`p-1.5 rounded-2xl sm:rounded-3xl transition-colors cursor-pointer ${
                viewMode === "list"
                  ? "bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-xs"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              <List className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              title="Tampilan Kartu"
              className={`p-1.5 rounded-2xl sm:rounded-3xl transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-xs"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              <LayoutGrid className="size-4" />
            </button>
          </div>
        </div>

        {/* Results Container */}
        {filteredPrograms.length > 0 ? (
          <>
            {viewMode === "list" ? (
              /* Clean Sequential List of Program Rows (Highly readable and calm) */
              <div className="rounded-2xl sm:rounded-3xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-[#141414] overflow-hidden divide-y divide-neutral-200/80 dark:divide-neutral-800">
                {paginatedPrograms.map((program) => (
                  <ProgramListItem
                    key={program.id}
                    program={program}
                  />
                ))}
              </div>
            ) : (
              /* Simple Grid View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {paginatedPrograms.map((program) => (
                  <ProgramCard
                    key={program.id}
                    program={program}
                  />
                ))}
              </div>
            )}

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
        ) : (
          /* Empty state */
          <div className="text-center py-16 rounded-2xl sm:rounded-3xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 p-6">
            <div className="size-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-3 text-neutral-400">
              <Inbox className="size-6" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-neutral-100 mb-1.5">
              Tidak ada program yang sesuai
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto mb-5">
              Tidak ditemukan pelatihan dengan filter yang Anda gunakan. Silakan ubah kata kunci atau reset filter.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={handleResetFilters}
              className="rounded-2xl sm:rounded-3xl text-xs font-medium h-9 border-neutral-300 dark:border-neutral-700"
            >
              Tampilkan Semua Program
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
