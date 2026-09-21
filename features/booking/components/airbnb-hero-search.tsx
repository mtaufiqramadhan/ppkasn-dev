"use client";

import React, { useState } from "react";
import {
  Search,
  Clock,
  Calendar as CalendarIcon,
  Users,
  RotateCcw,
  X,
  ChevronDown,
  Check,
  Sparkles,
} from "lucide-react";
import { format, addDays } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  type BookingFilterCriteria,
  type RoomCategory,
  type TimeSlotType,
} from "../types";

export interface AirbnbHeroSearchProps {
  filter: BookingFilterCriteria;
  onFilterChange: (next: Partial<BookingFilterCriteria>) => void;
  totalMatched: number;
  onReset: () => void;
  onOpenFiltersModal?: () => void;
  onScrollToRooms?: () => void;
}

const TIME_SLOT_OPTIONS: {
  val: TimeSlotType;
  label: string;
  time: string;
  desc: string;
}[] = [
  { val: "all", label: "Semua Waktu", time: "Fleksibel", desc: "08:00 - 20:00 WIB (Bebas jam kerja)" },
  { val: "pagi", label: "Sesi Pagi", time: "08:00 - 12:00", desc: "08:00 - 12:00 WIB (Rapat & briefing pagi)" },
  { val: "siang", label: "Sesi Siang", time: "13:00 - 17:00", desc: "13:00 - 17:00 WIB (Seminar & agenda siang)" },
  { val: "seharian", label: "Seharian Penuh", time: "08:00 - 17:00", desc: "08:00 - 17:00 WIB (Diklat & acara dinas)" },
];

export const AirbnbHeroSearch: React.FC<AirbnbHeroSearchProps> = ({
  filter,
  onFilterChange,
  totalMatched,
  onReset,
  onOpenFiltersModal,
  onScrollToRooms,
}) => {
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [isTimeOpen, setIsTimeOpen] = useState(false);
  const [isCapacityOpen, setIsCapacityOpen] = useState(false);

  const selectedDateObj = filter.selectedDate
    ? new Date(filter.selectedDate)
    : new Date();

  const activeFiltersCount =
    (filter.searchTerm.trim() ? 1 : 0) +
    (filter.category !== "all" ? 1 : 0) +
    (filter.timeSlot !== "all" ? 1 : 0) +
    (filter.minCapacity > 0 ? 1 : 0) +
    (filter.selectedFeatures.length > 0 ? 1 : 0);

  const selectedTimeOption =
    TIME_SLOT_OPTIONS.find((t) => t.val === filter.timeSlot) ||
    TIME_SLOT_OPTIONS[0];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onScrollToRooms) {
      onScrollToRooms();
    } else {
      window.scrollTo({ top: 380, behavior: "smooth" });
    }
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-8 sm:pt-10 sm:pb-10 border-b border-neutral-100 dark:border-neutral-800/80 bg-gradient-to-b from-white via-neutral-50/50 to-white dark:from-[#121212] dark:via-[#161616] dark:to-[#121212] transition-colors">
      {/* Soft Ambient Radial Background */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 flex justify-center overflow-hidden">
        <div className="h-64 w-96 rounded-full bg-[#FF385C]/5 blur-3xl" />
        <div className="mt-8 ml-32 h-64 w-96 rounded-full bg-amber-500/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-[2520px] px-4 sm:px-8 xl:px-12">
        {/* Hero Title */}
        <div className="mx-auto max-w-3xl text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
            Layanan Peminjaman Ruangan
          </h1>
        </div>

        {/* Floating Hero Search Pill Bar: Urutan: Pencarian -> Tanggal -> Waktu -> Kapasitas */}
        <div className="mx-auto max-w-4xl">
          <form
            onSubmit={handleSearchSubmit}
            className="relative rounded-2xl sm:rounded-full border border-neutral-300 bg-white p-2 sm:p-2.5 shadow-none dark:border-neutral-700 dark:bg-[#1c1c1c]"
          >
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center divide-y sm:divide-y-0 sm:divide-x divide-neutral-200 dark:divide-neutral-700/80 gap-1 sm:gap-0">

              {/* 1. Pencarian: Keyword / Nama Ruangan */}
              <div className="flex-1 px-3 sm:px-4 py-2 sm:py-1 min-w-0">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                  Nama Ruangan
                </label>
                <div className="relative mt-0.5 flex items-center">
                  <Search className="h-3.5 w-3.5 text-neutral-400 shrink-0 mr-2" />
                  <input
                    type="text"
                    value={filter.searchTerm}
                    onChange={(e) => onFilterChange({ searchTerm: e.target.value })}
                    placeholder="Cari ruangan..."
                    className="w-full bg-transparent text-xs sm:text-sm font-semibold text-neutral-900 placeholder:text-neutral-400 placeholder:font-normal focus:outline-none dark:text-neutral-100"
                  />
                  {filter.searchTerm && (
                    <button
                      type="button"
                      onClick={() => onFilterChange({ searchTerm: "" })}
                      className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* 2. Tanggal Kegiatan (Popover) */}
              <div className="flex-1 px-3 sm:px-4 py-2 sm:py-1 min-w-0">
                <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="w-full text-left focus:outline-none group select-none cursor-pointer"
                    >
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                        Tanggal Kegiatan
                      </span>
                      <div className="mt-0.5 flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 truncate">
                          <CalendarIcon className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                          <span className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                            {format(selectedDateObj, "dd MMM yyyy", { locale: localeId })}
                          </span>
                        </div>
                        <ChevronDown className="h-3.5 w-3.5 text-neutral-400 shrink-0 transition-transform group-hover:translate-y-0.5" />
                      </div>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="center"
                    className="w-auto rounded-2xl p-3 border-neutral-200 dark:border-neutral-800 dark:bg-[#1a1a1a] shadow-none"
                  >
                    <div className="flex gap-2 mb-2 pb-2 border-b border-neutral-100 dark:border-neutral-800">
                      <button
                        type="button"
                        onClick={() => {
                          onFilterChange({ selectedDate: format(new Date(), "yyyy-MM-dd") });
                          setIsDateOpen(false);
                        }}
                        className="rounded-full bg-neutral-100 dark:bg-neutral-800 px-3 py-1 text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200"
                      >
                        Hari Ini
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onFilterChange({ selectedDate: format(addDays(new Date(), 1), "yyyy-MM-dd") });
                          setIsDateOpen(false);
                        }}
                        className="rounded-full bg-neutral-100 dark:bg-neutral-800 px-3 py-1 text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200"
                      >
                        Besok
                      </button>
                    </div>
                    <Calendar
                      mode="single"
                      selected={selectedDateObj}
                      onSelect={(d) => {
                        if (d) {
                          onFilterChange({ selectedDate: format(d, "yyyy-MM-dd") });
                          setIsDateOpen(false);
                        }
                      }}
                      className="rounded-xl"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* 3. Waktu Kegiatan (Popover: Menggantikan Lantai) */}
              <div className="flex-1 px-3 sm:px-4 py-2 sm:py-1 min-w-0">
                <Popover open={isTimeOpen} onOpenChange={setIsTimeOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="w-full text-left focus:outline-none group select-none cursor-pointer"
                    >
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                        Waktu Kegiatan
                      </span>
                      <div className="mt-0.5 flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 truncate">
                          <Clock className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                          <span className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                            {filter.timeSlot === "all"
                              ? "Semua Waktu"
                              : selectedTimeOption.time}
                          </span>
                        </div>
                        <ChevronDown className="h-3.5 w-3.5 text-neutral-400 shrink-0 transition-transform group-hover:translate-y-0.5" />
                      </div>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="center"
                    className="w-72 rounded-2xl p-2 border-neutral-200 dark:border-neutral-800 dark:bg-[#1a1a1a] shadow-none"
                  >
                    <div className="px-2 py-1.5 border-b border-neutral-100 dark:border-neutral-800 mb-1">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                        Pilih Sesi / Waktu
                      </p>
                    </div>
                    <div className="space-y-1">
                      {TIME_SLOT_OPTIONS.map((item) => {
                        const isSelected = filter.timeSlot === item.val;
                        return (
                          <button
                            key={item.val}
                            type="button"
                            onClick={() => {
                              onFilterChange({ timeSlot: item.val });
                              setIsTimeOpen(false);
                            }}
                            className={cn(
                              "w-full flex items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-colors cursor-pointer",
                              isSelected
                                ? "bg-neutral-900 text-white font-semibold dark:bg-white dark:text-neutral-900"
                                : "hover:bg-neutral-100 text-neutral-700 dark:hover:bg-neutral-800 dark:text-neutral-200"
                            )}
                          >
                            <div>
                              <span className="block font-medium">{item.label}</span>
                              <span
                                className={cn(
                                  "text-[10px] block",
                                  isSelected
                                    ? "text-neutral-300 dark:text-neutral-600"
                                    : "text-neutral-400"
                                )}
                              >
                                {item.desc}
                              </span>
                            </div>
                            {isSelected && <Check className="h-3.5 w-3.5 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* 4. Kapasitas & Quick Presets */}
              <div className="flex-1 px-3 sm:px-4 py-2 sm:py-1 min-w-0">
                <Popover open={isCapacityOpen} onOpenChange={setIsCapacityOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="w-full text-left focus:outline-none group select-none cursor-pointer"
                    >
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                        Kapasitas Peserta
                      </span>
                      <div className="mt-0.5 flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 truncate">
                          <Users className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                          <span className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                            {filter.minCapacity > 0
                              ? `${filter.minCapacity}+ Orang`
                              : "Bebas Kapasitas"}
                          </span>
                        </div>
                        <ChevronDown className="h-3.5 w-3.5 text-neutral-400 shrink-0 transition-transform group-hover:translate-y-0.5" />
                      </div>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="end"
                    className="w-64 rounded-2xl p-3 border-neutral-200 dark:border-neutral-800 dark:bg-[#1a1a1a] shadow-none"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800 mb-2">
                      <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                        Minimal Peserta
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            onFilterChange({ minCapacity: Math.max(0, filter.minCapacity - 5) })
                          }
                          disabled={filter.minCapacity === 0}
                          className="h-7 w-7 rounded-full border flex items-center justify-center font-bold text-xs disabled:opacity-30"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-xs font-bold">
                          {filter.minCapacity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            onFilterChange({ minCapacity: filter.minCapacity + 5 })
                          }
                          className="h-7 w-7 rounded-full border flex items-center justify-center font-bold text-xs"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {[
                        { val: 0, label: "Semua" },
                        { val: 5, label: "5+" },
                        { val: 10, label: "10+" },
                        { val: 20, label: "20+" },
                        { val: 50, label: "50+" },
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => {
                            onFilterChange({ minCapacity: item.val });
                            setIsCapacityOpen(false);
                          }}
                          className={cn(
                            "rounded-lg px-2.5 py-1 text-xs font-medium cursor-pointer transition-colors",
                            filter.minCapacity === item.val
                              ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                              : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                          )}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* 5. Right Action Button: Primary Search Button */}
              <div className="flex items-center justify-end gap-2 p-1.5 sm:p-1 shrink-0">
                {/* Primary Red Airbnb Search Button */}
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-full bg-[#FF385C] hover:bg-[#D90B38] text-white px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold shadow-none transition-all hover:scale-102 active:scale-98 cursor-pointer"
                >
                  <Search className="h-3.5 w-3.5 stroke-[2.5]" />
                  <span>Cari</span>
                  <span className="hidden sm:inline font-normal opacity-90">
                    ({totalMatched})
                  </span>
                </button>
              </div>

            </div>
          </form>

          {/* Quick Active Filter Indicator & Reset */}
          {activeFiltersCount > 0 && (
            <div className="mt-3 flex items-center justify-center gap-3 text-xs">
              <span className="text-neutral-500 dark:text-neutral-400 font-medium">
                {activeFiltersCount} filter aktif diterapkan • {totalMatched} ruangan ditemukan
              </span>
              <button
                type="button"
                onClick={onReset}
                className="flex items-center gap-1 font-semibold text-[#FF385C] hover:underline cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset Semua Filter</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </section>
  );
};
