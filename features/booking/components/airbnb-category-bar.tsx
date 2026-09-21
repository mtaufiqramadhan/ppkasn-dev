"use client";

import React, { useRef } from "react";
import {
  LayoutGrid,
  Presentation,
  Building,
  MessagesSquare,
  Video,
  Bed,
  Monitor,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type RoomCategory,
  type BookingFilterCriteria,
} from "../types";

interface AirbnbCategoryBarProps {
  filter: BookingFilterCriteria;
  onFilterChange: (next: Partial<BookingFilterCriteria>) => void;
  onOpenFilters?: () => void;
  totalMatched?: number;
  onResetFilter?: () => void;
}

const AIRBNB_CATEGORIES: {
  key: RoomCategory;
  label: string;
  icon: React.ElementType;
}[] = [
  { key: "all", label: "Semua Fasilitas", icon: LayoutGrid },
  { key: "ruang_rapat", label: "Ruang Rapat", icon: Presentation },
  { key: "ruang_daring", label: "Ruang Daring", icon: Video },
  { key: "ruang_diskusi", label: "Ruang Diskusi", icon: MessagesSquare },
  { key: "auditorium", label: "Auditorium & Kelas", icon: Building },
  { key: "studio_lab", label: "Studio & Lab PC", icon: Monitor },
  { key: "asrama", label: "Kamar Asrama", icon: Bed },
];

export const AirbnbCategoryBar: React.FC<AirbnbCategoryBarProps> = ({
  filter,
  onFilterChange,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="sticky top-20 z-30 w-full border-b border-[#ebebeb] bg-white pt-2 dark:border-neutral-800 dark:bg-[#121212] transition-colors">
      <div className="mx-auto max-w-[2520px] px-4 sm:px-8 xl:px-12">
        <div className="flex items-center justify-between">
          
          {/* Categories List (On the Left) */}
          <div className="relative flex-1 overflow-hidden">
            <div
              ref={scrollContainerRef}
              className="flex items-center gap-7 sm:gap-9 overflow-x-auto scrollbar-none py-1"
            >
              {AIRBNB_CATEGORIES.map((cat) => {
                const isActive = filter.category === cat.key;
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => onFilterChange({ category: cat.key })}
                    className={cn(
                      "group flex shrink-0 flex-col items-center gap-1.5 pb-2.5 pt-1 text-center transition-all cursor-pointer select-none",
                      isActive
                        ? "border-b-2 border-neutral-900 text-neutral-900 dark:border-white dark:text-white"
                        : "border-b-2 border-transparent text-neutral-500 hover:text-neutral-900 hover:border-neutral-300 dark:text-neutral-400 dark:hover:text-neutral-200"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5 sm:h-6 sm:w-6 transition-transform group-hover:scale-105",
                        isActive ? "opacity-100 stroke-[2.2]" : "opacity-70 stroke-[1.8]"
                      )}
                    />
                    <span className="text-[12px] font-semibold whitespace-nowrap tracking-tight">
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
