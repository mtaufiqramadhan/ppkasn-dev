"use client";

import React from "react";
import Link from "next/link";
import {
  Search,
  RotateCcw,
  Building2,
} from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { type BookingFilterCriteria, type RoomCategory } from "../types";

export interface AirbnbHeaderProps {
  filter: BookingFilterCriteria;
  onFilterChange: (next: Partial<BookingFilterCriteria>) => void;
  onSearch?: () => void;
  totalMatched?: number;
  onReset?: () => void;
  onOpenFiltersModal?: () => void;
  onScrollToHero?: () => void;
  isScrolled?: boolean;
}

function getCategorySearchLabel(cat: RoomCategory): string {
  switch (cat) {
    case "ruang_rapat":
      return "Ruang Rapat";
    case "auditorium":
      return "Auditorium";
    case "diskusi":
      return "Ruang Diskusi";
    case "studio_lab":
      return "Studio & Lab";
    default:
      return "Semua Kategori";
  }
}

export const AirbnbHeader: React.FC<AirbnbHeaderProps> = ({
  filter,
  onFilterChange,
  totalMatched = 0,
  onReset,
  onScrollToHero,
  isScrolled = true,
}) => {
  const selectedDateObj = filter.selectedDate
    ? new Date(filter.selectedDate)
    : new Date();

  const activeFiltersCount =
    (filter.searchTerm.trim() ? 1 : 0) +
    (filter.category !== "all" ? 1 : 0) +
    (filter.timeSlot !== "all" ? 1 : 0) +
    (filter.minCapacity > 0 ? 1 : 0) +
    (filter.selectedFeatures.length > 0 ? 1 : 0);

  const dateText = format(selectedDateObj, "dd MMM", { locale: localeId });
  const timeText =
    filter.timeSlot === "pagi"
      ? "Pagi (08-12)"
      : filter.timeSlot === "siang"
      ? "Siang (13-17)"
      : filter.timeSlot === "seharian"
      ? "Seharian"
      : "Semua Waktu";
  const capacityText = filter.minCapacity > 0 ? `${filter.minCapacity}+ Orang` : "Kapasitas";

  const handlePillClick = () => {
    if (onScrollToHero) {
      onScrollToHero();
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#ebebeb] bg-white/95 backdrop-blur-md transition-all dark:border-neutral-800 dark:bg-[#121212]/95">
      <div className="mx-auto max-w-[2520px] px-3 sm:px-6 lg:px-8 xl:px-12">
        
        {/* Unified Responsive Navbar Row */}
        <div className="relative flex items-center justify-between h-20">
          
          {/* 1. Left: Brand Logo */}
          <div className="shrink-0 flex items-center z-10">
            <Link
              href="/booking"
              className="flex items-center gap-2.5 focus:outline-none group select-none"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#FF385C] to-rose-500 text-white shadow-xs shadow-rose-500/20 transition-transform group-hover:scale-105">
                <Building2 className="h-5 w-5 stroke-[2.3]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-[#FF385C] leading-none uppercase">
                  SARPRAS
                </span>
                <span className="text-[9px] uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-bold mt-0.5 hidden md:inline">
                  PPKASN
                </span>
              </div>
            </Link>
          </div>

          {/* 2. Absolute Dead-Center: Search Pill Button (Proportionally Hugs Content & Smooth scrolls to Hero) */}
          <div
            className={cn(
              "absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-300 transform",
              isScrolled
                ? "opacity-100 scale-100 pointer-events-auto"
                : "opacity-0 scale-95 pointer-events-none"
            )}
          >
            <button
              type="button"
              onClick={handlePillClick}
              title="Klik untuk kembali ke filter pencarian di atas"
              className="group inline-flex items-center justify-between sm:justify-start rounded-full border border-neutral-300 bg-white py-1.5 sm:py-2 pl-3.5 sm:pl-4 pr-1.5 sm:pr-2 shadow-none transition-all hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 cursor-pointer select-none"
            >
              {/* A. Mobile Layout (< sm): Stacked non-truncated title & subtitle matching hero filter */}
              <div className="flex sm:hidden items-center gap-2 min-w-0 max-w-[200px] text-left">
                <div className="flex flex-col min-w-0 flex-1 overflow-hidden leading-tight">
                  <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate">
                    {filter.searchTerm.trim() ? filter.searchTerm : "Cari Ruangan"}
                  </span>
                  <span className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate font-medium">
                    {dateText} • {timeText}{filter.minCapacity > 0 ? ` • ${filter.minCapacity}+ Org` : ""}
                  </span>
                </div>
              </div>

              {/* B. Tablet & Desktop Layout (>= sm): 4 Proportionally Spaced Segments matching Hero Search */}
              <div className="hidden sm:flex items-center divide-x divide-neutral-200 dark:divide-neutral-700 min-w-0">
                
                {/* Segment 1: Pencarian / Nama Ruangan */}
                <div className="pr-3 sm:pr-3.5 truncate min-w-0">
                  <span className="block text-xs sm:text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                    {filter.searchTerm.trim() ? filter.searchTerm : "Cari Ruangan"}
                  </span>
                </div>

                {/* Segment 2: Tanggal Kegiatan */}
                <div className="px-3 sm:px-3.5 truncate min-w-0">
                  <span className="block text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-300 truncate">
                    {dateText}
                  </span>
                </div>

                {/* Segment 3: Waktu Kegiatan */}
                <div className="px-3 sm:px-3.5 truncate min-w-0">
                  <span className="block text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-300 truncate">
                    {timeText}
                  </span>
                </div>

                {/* Segment 4: Kapasitas Peserta */}
                <div className="px-3 sm:px-3.5 truncate min-w-0">
                  <span className="block text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-300 truncate">
                    {capacityText}
                  </span>
                </div>

              </div>

              {/* Red Search Icon Circle with Active Filter Badge */}
              <div className="relative flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-[#FF385C] text-white transition-transform group-hover:scale-105 shadow-none ml-2 sm:ml-2.5">
                <Search className="h-3 w-3 sm:h-3.5 sm:w-3.5 stroke-[2.5]" />
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-900 text-[9px] font-bold text-white border-2 border-white dark:border-neutral-900 dark:bg-white dark:text-neutral-900">
                    {activeFiltersCount}
                  </span>
                )}
              </div>
            </button>
          </div>

          {/* 3. Right: Quick Reset (if active filters) or Minimal Balance */}
          <div className="shrink-0 flex items-center gap-1.5 sm:gap-2 z-10 min-w-[70px] justify-end">
            {activeFiltersCount > 0 && onReset && (
              <button
                type="button"
                onClick={onReset}
                title="Reset Semua Filter"
                className="flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 cursor-pointer transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};

