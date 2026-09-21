"use client";

import React from "react";
import {
  LayoutGrid,
  List,
  Map,
  SlidersHorizontal,
  RotateCcw,
  Check,
  Building,
  Presentation,
  Users,
  Video,
  Layers,
  Sparkles,
  Tv,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  type BookingFilterCriteria,
  type RoomCategory,
} from "../types";

interface BookingFilterToolbarProps {
  filter: BookingFilterCriteria;
  onFilterChange: (next: Partial<BookingFilterCriteria>) => void;
  onResetFilter: () => void;
  filteredCount: number;
  totalCount: number;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  onOpenFloorMap: () => void;
}

const CATEGORY_TABS: {
  key: RoomCategory;
  label: string;
  icon: React.ElementType;
}[] = [
  { key: "all", label: "Semua Ruangan", icon: LayoutGrid },
  { key: "ruang_rapat", label: "Ruang Rapat", icon: Presentation },
  { key: "ruang_daring", label: "Ruang Daring", icon: Video },
  { key: "ruang_diskusi", label: "Ruang Diskusi", icon: Users },
  { key: "auditorium", label: "Auditorium & Seminar", icon: Building },
  { key: "studio_lab", label: "Studio & Lab PC", icon: Video },
];

const COMMON_FACILITIES = [
  "Projector",
  "Sound System",
  "Smart TV",
  "AC",
  "Whiteboard",
  "Video Conference",
  "PC",
];

export const BookingFilterToolbar: React.FC<BookingFilterToolbarProps> = ({
  filter,
  onFilterChange,
  onResetFilter,
  filteredCount,
  totalCount,
  viewMode,
  onViewModeChange,
  onOpenFloorMap,
}) => {
  const isFiltered =
    filter.category !== "all" ||
    filter.floor !== "all" ||
    filter.minCapacity > 0 ||
    filter.selectedFeatures.length > 0 ||
    filter.searchTerm.trim().length > 0;

  const toggleFeature = (feature: string) => {
    const exists = filter.selectedFeatures.includes(feature);
    const next = exists
      ? filter.selectedFeatures.filter((f) => f !== feature)
      : [...filter.selectedFeatures, feature];
    onFilterChange({ selectedFeatures: next });
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Category Tabs (Chisfis Stay Categories Style) */}
      <div className="flex items-center overflow-x-auto pb-2 scrollbar-none gap-2 sm:gap-3 border-b border-neutral-200/80 dark:border-neutral-800">
        {CATEGORY_TABS.map((tab) => {
          const isActive = filter.category === tab.key;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onFilterChange({ category: tab.key })}
              className={cn(
                "group flex shrink-0 cursor-pointer items-center gap-2.5 rounded-full px-5 py-3 text-sm font-semibold transition-all select-none",
                isActive
                  ? "bg-neutral-900 text-white shadow-md shadow-neutral-900/10 dark:bg-neutral-100 dark:text-neutral-950"
                  : "bg-transparent text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 transition-transform group-hover:scale-110",
                  isActive
                    ? "text-amber-400 dark:text-amber-600"
                    : "text-neutral-400 dark:text-neutral-500"
                )}
              />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filter Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Summary Count & Popover Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100 pr-2">
            {filteredCount} {filteredCount === 1 ? "ruangan" : "ruangan"} ditemukan
          </span>

          {/* Lantai Pill */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={cn(
                  "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                  filter.floor !== "all"
                    ? "border-amber-500 bg-amber-500/10 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300"
                    : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
                )}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>
                  {filter.floor === "all" ? "Lantai" : `Lantai ${filter.floor}`}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-56 rounded-2xl p-2 border-neutral-200 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="space-y-1">
                {[
                  { val: "all", label: "Semua Lantai" },
                  { val: 1, label: "Lantai 1" },
                  { val: 2, label: "Lantai 2" },
                  { val: 3, label: "Lantai 3" },
                  { val: 4, label: "Lantai 4" },
                ].map((item) => (
                  <button
                    key={String(item.val)}
                    type="button"
                    onClick={() =>
                      onFilterChange({ floor: item.val as number | "all" })
                    }
                    className={cn(
                      "flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-colors",
                      filter.floor === item.val
                        ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold"
                        : "hover:bg-neutral-100 text-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    )}
                  >
                    <span>{item.label}</span>
                    {filter.floor === item.val && (
                      <Check className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    )}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Fasilitas Pill Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={cn(
                  "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                  filter.selectedFeatures.length > 0
                    ? "border-amber-500 bg-amber-500/10 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300"
                    : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
                )}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>Fasilitas</span>
                {filter.selectedFeatures.length > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] text-white">
                    {filter.selectedFeatures.length}
                  </span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-64 rounded-2xl p-3 border-neutral-200 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-neutral-400">
                Pilih Fasilitas
              </p>
              <div className="space-y-1.5">
                {COMMON_FACILITIES.map((fac) => {
                  const checked = filter.selectedFeatures.includes(fac);
                  return (
                    <button
                      key={fac}
                      type="button"
                      onClick={() => toggleFeature(fac)}
                      className={cn(
                        "flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-xs transition-colors",
                        checked
                          ? "bg-amber-500/10 font-bold text-amber-700 dark:text-amber-300"
                          : "hover:bg-neutral-100 text-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                      )}
                    >
                      <span>{fac}</span>
                      {checked && (
                        <Check className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>

          {/* Reset Filters button if any active */}
          {isFiltered && (
            <button
              type="button"
              onClick={onResetFilter}
              className="inline-flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors dark:text-rose-400 dark:hover:bg-rose-950/40"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>

        {/* Right: Denah Lantai (Floor Map) & Grid/List View switch */}
        <div className="flex items-center gap-2">
          {/* Denah Lantai / Floor Map Trigger */}
          <button
            type="button"
            onClick={onOpenFloorMap}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-neutral-700 shadow-xs hover:bg-neutral-100 transition-colors dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <Map className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <span>Lihat Denah Gedung</span>
          </button>

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-full border border-neutral-200 bg-neutral-100 p-0.5 dark:border-neutral-800 dark:bg-neutral-900">
            <button
              type="button"
              onClick={() => onViewModeChange("grid")}
              aria-label="Tampilan Grid"
              className={cn(
                "flex h-7 w-7 cursor-pointer items-center justify-center rounded-full transition-colors",
                viewMode === "grid"
                  ? "bg-white text-neutral-900 shadow-xs dark:bg-neutral-800 dark:text-neutral-100"
                  : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("list")}
              aria-label="Tampilan List"
              className={cn(
                "flex h-7 w-7 cursor-pointer items-center justify-center rounded-full transition-colors",
                viewMode === "list"
                  ? "bg-white text-neutral-900 shadow-xs dark:bg-neutral-800 dark:text-neutral-100"
                  : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
              )}
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
