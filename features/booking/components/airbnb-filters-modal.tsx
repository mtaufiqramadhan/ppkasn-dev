"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  X,
  Check,
  Search,
  Calendar as CalendarIcon,
  Clock,
  Users,
  Building,
  RotateCcw,
  Sparkles,
  Presentation,
  Video,
  Mic,
  Wind,
  SquarePen,
  Monitor,
  Tv,
} from "lucide-react";
import { format, addDays, nextMonday } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  type BookingFilterCriteria,
  type TimeSlotType,
} from "../types";

interface AirbnbFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  filter: BookingFilterCriteria;
  onFilterChange: (next: Partial<BookingFilterCriteria>) => void;
  onReset: () => void;
  totalMatched: number;
}

const POPULAR_SUGGESTIONS = [
  "Auditorium",
  "Ruang Rapat 1",
  "Ruang Rapat 2",
  "Ruang Diskusi",
  "Studio Podcast",
  "Lab Komputer",
];

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

const FACILITIES_LIST = [
  { key: "Projector", label: "Proyektor 4K & Layar", icon: Presentation },
  { key: "Sound System", label: "Sound System & Mic", icon: Mic },
  { key: "Smart TV", label: "Smart TV / Display", icon: Tv },
  { key: "AC", label: "AC Central Pendingin", icon: Wind },
  { key: "Whiteboard", label: "Papan Tulis Kaca", icon: SquarePen },
  { key: "Video Conference", label: "Video Conference Cam", icon: Video },
  { key: "PC", label: "Komputer PC CBT", icon: Monitor },
];

export const AirbnbFiltersModal: React.FC<AirbnbFiltersModalProps> = ({
  isOpen,
  onClose,
  filter,
  onFilterChange,
  onReset,
  totalMatched,
}) => {
  const selectedDateObj = filter.selectedDate
    ? new Date(filter.selectedDate)
    : new Date();

  const activeFiltersCount =
    (filter.searchTerm.trim() ? 1 : 0) +
    (filter.timeSlot !== "all" ? 1 : 0) +
    (filter.minCapacity > 0 ? 1 : 0) +
    (filter.selectedFeatures.length > 0 ? filter.selectedFeatures.length : 0);

  const toggleFacility = (fac: string) => {
    const exists = filter.selectedFeatures.includes(fac);
    const next = exists
      ? filter.selectedFeatures.filter((f) => f !== fac)
      : [...filter.selectedFeatures, fac];
    onFilterChange({ selectedFeatures: next });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-4xl w-full rounded-2xl sm:rounded-3xl p-0 border-neutral-200 dark:border-neutral-800 dark:bg-[#181818] overflow-hidden flex flex-col max-h-[92vh] shadow-2xl"
      >
        {/* 1. Modal Header */}
        <DialogHeader className="flex flex-row items-center justify-between border-b border-neutral-200/80 px-4 sm:px-6 py-3.5 sm:py-4 dark:border-neutral-800 shrink-0 bg-white/90 dark:bg-[#181818]/90 backdrop-blur-md">
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup pengaturan pencarian"
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-700 dark:hover:bg-neutral-800 dark:text-neutral-200 cursor-pointer transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          
          <div className="text-center">
            <DialogTitle className="text-sm sm:text-base font-bold text-neutral-900 dark:text-neutral-100">
              Filter &amp; Pengaturan Pencarian
            </DialogTitle>
            <p className="text-[10px] sm:text-[11px] text-neutral-500 dark:text-neutral-400">
              Gedung PPKASN Kemensetneg RI
            </p>
          </div>

          <span className="rounded-full bg-rose-50 border border-rose-200 text-[#FF385C] dark:bg-rose-950/40 dark:border-rose-900/50 px-2.5 sm:px-3 py-1 text-[11px] font-bold">
            {totalMatched} Ruangan
          </span>
        </DialogHeader>

        {/* 2. Active Filter Pills Summary */}
        {activeFiltersCount > 0 && (
          <div className="bg-neutral-50/90 dark:bg-neutral-900/60 border-b border-neutral-200/70 dark:border-neutral-800 px-4 sm:px-6 py-2 shrink-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 shrink-0 mr-1">
                  Filter Aktif ({activeFiltersCount}):
                </span>

                {filter.searchTerm.trim() && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-2.5 py-0.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200 shrink-0">
                    &quot;{filter.searchTerm}&quot;
                    <button
                      type="button"
                      onClick={() => onFilterChange({ searchTerm: "" })}
                      className="text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}

                {filter.timeSlot !== "all" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-2.5 py-0.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200 shrink-0">
                    {filter.timeSlot === "pagi"
                      ? "Sesi Pagi"
                      : filter.timeSlot === "siang"
                      ? "Sesi Siang"
                      : "Seharian"}
                    <button
                      type="button"
                      onClick={() => onFilterChange({ timeSlot: "all" })}
                      className="text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}

                {filter.minCapacity > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-2.5 py-0.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200 shrink-0">
                    Min. {filter.minCapacity} Orang
                    <button
                      type="button"
                      onClick={() => onFilterChange({ minCapacity: 0 })}
                      className="text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}

                {filter.selectedFeatures.map((f) => (
                  <span
                    key={f}
                    className="inline-flex items-center gap-1 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-2.5 py-0.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200 shrink-0"
                  >
                    {f}
                    <button
                      type="button"
                      onClick={() => toggleFacility(f)}
                      className="text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>

              <button
                type="button"
                onClick={onReset}
                className="text-xs font-semibold text-[#FF385C] hover:underline shrink-0 pl-2 cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {/* 3. Spacious 2-Column Responsive Body */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            
            {/* COLUMN 1: Ruangan, Lantai, & Kapasitas */}
            <div className="space-y-6">
              
              {/* 1. Nama Ruangan & Saran Cepat */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-200 flex items-center gap-1.5">
                    <Search className="h-3.5 w-3.5 text-[#FF385C]" />
                    <span>Nama Ruangan / Kata Kunci</span>
                  </label>
                  {filter.searchTerm && (
                    <button
                      type="button"
                      onClick={() => onFilterChange({ searchTerm: "" })}
                      className="text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
                    >
                      Hapus
                    </button>
                  )}
                </div>

                <div className="relative">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="text"
                    value={filter.searchTerm}
                    onChange={(e) => onFilterChange({ searchTerm: e.target.value })}
                    placeholder="Contoh: Auditorium, Rapat 1, Studio..."
                    className="w-full rounded-2xl border border-neutral-200 bg-neutral-50/80 py-2.5 pl-10 pr-10 text-xs sm:text-sm font-semibold text-neutral-900 placeholder:text-neutral-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:ring-white transition-all shadow-2xs"
                  />
                  {filter.searchTerm && (
                    <button
                      type="button"
                      onClick={() => onFilterChange({ searchTerm: "" })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer p-0.5"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* 1-Tap Suggestions */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 mr-0.5">
                    Saran:
                  </span>
                  {POPULAR_SUGGESTIONS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => onFilterChange({ searchTerm: item })}
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-medium border transition-colors cursor-pointer",
                        filter.searchTerm.toLowerCase() === item.toLowerCase()
                          ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                          : "border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                      )}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Waktu / Sesi Kegiatan */}
              <div className="space-y-2.5 pt-4 border-t border-neutral-100 dark:border-neutral-800/80">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-200 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-[#FF385C]" />
                    <span>Waktu / Sesi Kegiatan</span>
                  </label>
                  {filter.timeSlot !== "all" && (
                    <button
                      type="button"
                      onClick={() => onFilterChange({ timeSlot: "all" })}
                      className="text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
                    >
                      Semua Waktu
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {TIME_SLOT_OPTIONS.map((item) => {
                    const isSelected = filter.timeSlot === item.val;
                    return (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => onFilterChange({ timeSlot: item.val })}
                        className={cn(
                          "flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer select-none",
                          isSelected
                            ? "border-neutral-900 bg-neutral-900 text-white shadow-2xs dark:border-white dark:bg-white dark:text-neutral-900"
                            : "border-neutral-200 bg-white text-neutral-800 hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-200"
                        )}
                      >
                        <div className="min-w-0 pr-1">
                          <div className="flex items-center gap-1.5">
                            <span className="block text-xs font-bold truncate">
                              {item.label}
                            </span>
                            <span
                              className={cn(
                                "text-[10px] font-semibold px-1.5 py-0.5 rounded",
                                isSelected
                                  ? "bg-white/20 text-white"
                                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                              )}
                            >
                              {item.time}
                            </span>
                          </div>
                          <span
                            className={cn(
                              "text-[10px] block mt-0.5 leading-tight truncate",
                              isSelected
                                ? "text-neutral-300 dark:text-neutral-600"
                                : "text-neutral-500 dark:text-neutral-400"
                            )}
                          >
                            {item.desc}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white text-neutral-900 dark:bg-neutral-900 dark:text-white ml-1">
                            <Check className="h-2.5 w-2.5 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Kapasitas Peserta */}
              <div className="space-y-2.5 pt-4 border-t border-neutral-100 dark:border-neutral-800/80">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-200 flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-[#FF385C]" />
                      <span>Kapasitas Tamu</span>
                    </label>
                    <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      {filter.minCapacity === 0
                        ? "Bebas kapasitas"
                        : `Minimal ${filter.minCapacity} orang`}
                    </span>
                  </div>

                  {/* Stepper */}
                  <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800/80 p-1 rounded-full">
                    <button
                      type="button"
                      onClick={() =>
                        onFilterChange({ minCapacity: Math.max(0, filter.minCapacity - 5) })
                      }
                      disabled={filter.minCapacity === 0}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-bold text-neutral-900 shadow-2xs hover:bg-neutral-200 disabled:opacity-30 dark:bg-neutral-700 dark:text-neutral-100 cursor-pointer transition-colors"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100">
                      {filter.minCapacity === 0 ? "0" : filter.minCapacity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onFilterChange({ minCapacity: filter.minCapacity + 5 })}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-bold text-neutral-900 shadow-2xs hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-100 cursor-pointer transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { cap: 0, label: "Bebas" },
                    { cap: 5, label: "5+ (Pod)" },
                    { cap: 10, label: "10+ (Rapat)" },
                    { cap: 20, label: "20+ (Pleno)" },
                    { cap: 50, label: "50+ (Seminar)" },
                  ].map((item) => (
                    <button
                      key={item.cap}
                      type="button"
                      onClick={() => onFilterChange({ minCapacity: item.cap })}
                      className={cn(
                        "rounded-lg px-2.5 py-1 text-xs font-semibold cursor-pointer transition-colors border",
                        filter.minCapacity === item.cap
                          ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                          : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* COLUMN 2: Tanggal & Fasilitas Penunjang */}
            <div className="space-y-6 md:pl-2">
              
              {/* 4. Tanggal Kegiatan */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-200 flex items-center gap-1.5">
                    <CalendarIcon className="h-3.5 w-3.5 text-[#FF385C]" />
                    <span>Tanggal Kegiatan</span>
                  </label>
                  <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                    {format(selectedDateObj, "EEEE, dd MMM yyyy", { locale: localeId })}
                  </span>
                </div>

                {/* Quick Date Shortcuts */}
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      onFilterChange({ selectedDate: format(new Date(), "yyyy-MM-dd") })
                    }
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-semibold border transition-colors cursor-pointer",
                      filter.selectedDate === format(new Date(), "yyyy-MM-dd")
                        ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                        : "border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                    )}
                  >
                    Hari Ini
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onFilterChange({
                        selectedDate: format(addDays(new Date(), 1), "yyyy-MM-dd"),
                      })
                    }
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-semibold border transition-colors cursor-pointer",
                      filter.selectedDate === format(addDays(new Date(), 1), "yyyy-MM-dd")
                        ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                        : "border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                    )}
                  >
                    Besok
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onFilterChange({
                        selectedDate: format(nextMonday(new Date()), "yyyy-MM-dd"),
                      })
                    }
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-semibold border transition-colors cursor-pointer",
                      filter.selectedDate === format(nextMonday(new Date()), "yyyy-MM-dd")
                        ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                        : "border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                    )}
                  >
                    Senin Depan
                  </button>
                </div>

                {/* Direct Inline Calendar */}
                <div className="flex justify-center pt-1">
                  <div className="border border-neutral-200 dark:border-neutral-800 rounded-2xl p-1.5 bg-neutral-50/50 dark:bg-neutral-900/40">
                    <Calendar
                      mode="single"
                      selected={selectedDateObj}
                      onSelect={(d) => {
                        if (d) {
                          onFilterChange({ selectedDate: format(d, "yyyy-MM-dd") });
                        }
                      }}
                      className="rounded-xl scale-95 origin-top"
                    />
                  </div>
                </div>
              </div>

              {/* 5. Fasilitas Penunjang */}
              <div className="space-y-2.5 pt-4 border-t border-neutral-100 dark:border-neutral-800/80">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-200 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-[#FF385C]" />
                    <span>Fasilitas Penunjang</span>
                  </label>
                  {filter.selectedFeatures.length > 0 && (
                    <button
                      type="button"
                      onClick={() => onFilterChange({ selectedFeatures: [] })}
                      className="text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
                    >
                      Hapus Pilihan
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {FACILITIES_LIST.map((fac) => {
                    const isChecked = filter.selectedFeatures.includes(fac.key);
                    const IconComponent = fac.icon;
                    return (
                      <button
                        key={fac.key}
                        type="button"
                        onClick={() => toggleFacility(fac.key)}
                        className={cn(
                          "flex items-center justify-between p-2 rounded-xl border text-left transition-all cursor-pointer select-none",
                          isChecked
                            ? "border-neutral-900 bg-neutral-900 text-white shadow-2xs dark:border-white dark:bg-white dark:text-neutral-900"
                            : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-300"
                        )}
                      >
                        <div className="flex items-center gap-2 truncate pr-1">
                          <IconComponent className={cn(
                            "h-3.5 w-3.5 shrink-0",
                            isChecked ? "text-white dark:text-neutral-900" : "text-neutral-500 dark:text-neutral-400"
                          )} />
                          <span className="text-xs font-semibold truncate">
                            {fac.label}
                          </span>
                        </div>

                        <div
                          className={cn(
                            "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-md border transition-colors",
                            isChecked
                              ? "bg-white border-white text-neutral-900 dark:bg-neutral-900 dark:border-neutral-900 dark:text-white"
                              : "border-neutral-300 dark:border-neutral-600"
                          )}
                        >
                          {isChecked && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* 4. Sticky Modal Footer */}
        <div className="flex items-center justify-between border-t border-neutral-200/80 px-4 sm:px-6 py-3 sm:py-3.5 dark:border-neutral-800 shrink-0 bg-white dark:bg-[#181818]">
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-600 underline hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Semua Filter</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-[#FF385C] hover:bg-[#D90B38] text-white px-5 sm:px-7 py-2.5 sm:py-3 text-xs sm:text-sm font-bold shadow-md transition-all hover:scale-102 active:scale-98 cursor-pointer"
          >
            Tampilkan {totalMatched} Ruangan
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
