"use client";

import React, { useState } from "react";
import {
  Search,
  MapPin,
  Calendar as CalendarIcon,
  Users,
  ChevronDown,
  Building,
  Check,
  RotateCcw,
} from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type BookingFilterCriteria } from "../types";

interface BookingHeroSearchProps {
  filter: BookingFilterCriteria;
  onFilterChange: (next: Partial<BookingFilterCriteria>) => void;
  onSearch: () => void;
  totalRoomsCount: number;
}

const FLOOR_OPTIONS = [
  { value: "all", label: "Semua Lantai (1 - 4)", desc: "Seluruh ruangan gedung" },
  { value: 1, label: "Lantai 1", desc: "Auditorium & Ruang Rapat 1" },
  { value: 2, label: "Lantai 2", desc: "Ruang Rapat 2 & Pod Daring" },
  { value: 3, label: "Lantai 3", desc: "Ruang Diskusi & Studio Lab" },
  { value: 4, label: "Lantai 4", desc: "Ruang Seminar Gaharu" },
];

export const BookingHeroSearch: React.FC<BookingHeroSearchProps> = ({
  filter,
  onFilterChange,
  onSearch,
  totalRoomsCount,
}) => {
  const [isFloorOpen, setIsFloorOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [isGuestsOpen, setIsGuestsOpen] = useState(false);

  const selectedDateObj = filter.selectedDate
    ? new Date(filter.selectedDate)
    : new Date();

  return (
    <section className="relative overflow-hidden pt-8 pb-12 sm:pt-12 sm:pb-16">
      {/* Chisfis Ambient Glow Background Elements */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 flex justify-center overflow-hidden">
        <span className="h-80 w-80 rounded-full bg-rose-500/10 mix-blend-multiply blur-3xl filter sm:h-[450px] sm:w-[450px] dark:bg-rose-500/5" />
        <span className="mt-20 -ml-24 h-80 w-80 rounded-full bg-amber-500/15 mix-blend-multiply blur-3xl filter sm:h-[450px] sm:w-[450px] dark:bg-amber-500/10" />
        <span className="mt-10 ml-32 h-80 w-80 rounded-full bg-teal-500/10 mix-blend-multiply blur-3xl filter sm:h-[450px] sm:w-[450px] dark:bg-teal-500/5" />
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Title & Stats */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50/80 px-3.5 py-1 text-xs font-semibold text-amber-800 backdrop-blur-sm dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            Sistem Reservasi Ruangan Modern PPKASN
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl dark:text-neutral-50">
            Eksplorasi Ruangan &amp; Fasilitas
          </h1>

          <p className="mt-4 text-base text-neutral-600 sm:text-lg dark:text-neutral-400">
            Temukan dan pesan ruang rapat eksekutif, auditorium serbaguna, atau
            studio rekaman multimedia dengan fasilitas terlengkap.
          </p>

          {/* Quick Meta Stats */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-neutral-500 dark:text-neutral-400 sm:text-sm">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              Gedung PPKASN, Jakarta
            </span>
            <span className="text-neutral-300 dark:text-neutral-700">•</span>
            <span className="inline-flex items-center gap-1.5">
              <Building className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              {totalRoomsCount} Ruangan Tersedia
            </span>
            <span className="text-neutral-300 dark:text-neutral-700">•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              ✓ Bebas Biaya Layanan Internal
            </span>
          </div>
        </div>

        {/* Chisfis Floating Pill Search Bar */}
        <div className="mx-auto mt-10 max-w-5xl">
          <div className="relative rounded-3xl md:rounded-full border border-neutral-300 bg-white p-2.5 shadow-none dark:border-neutral-800 dark:bg-neutral-900/90">
            <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-2">
              
              {/* Field 1: Lokasi & Lantai (4 cols) */}
              <div className="md:col-span-4">
                <Popover open={isFloorOpen} onOpenChange={setIsFloorOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="group flex w-full cursor-pointer items-center gap-3.5 rounded-2xl md:rounded-full px-5 py-3.5 text-left transition-colors hover:bg-neutral-100/80 focus:outline-none dark:hover:bg-neutral-800/80"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div className="grow overflow-hidden">
                        <span className="block text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                          Lokasi Gedung
                        </span>
                        <span className="block truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                          {filter.floor === "all"
                            ? "Semua Lantai (1-4)"
                            : `Lantai ${filter.floor}`}
                        </span>
                      </div>
                      <ChevronDown className="h-4 w-4 text-neutral-400 transition-transform group-hover:translate-y-0.5" />
                    </button>
                  </PopoverTrigger>

                  <PopoverContent
                    align="start"
                    className="w-80 rounded-3xl p-3 shadow-none border-neutral-200 dark:border-neutral-800 dark:bg-neutral-900"
                  >
                    <div className="mb-2 px-3 pt-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                        Pilih Tingkat Lantai
                      </p>
                    </div>
                    <div className="space-y-1">
                      {FLOOR_OPTIONS.map((opt) => {
                        const isSelected = filter.floor === opt.value;
                        return (
                          <button
                            key={String(opt.value)}
                            type="button"
                            onClick={() => {
                              onFilterChange({
                                floor: opt.value as number | "all",
                              });
                              setIsFloorOpen(false);
                            }}
                            className={cn(
                              "flex w-full cursor-pointer items-center justify-between rounded-2xl px-3 py-2.5 text-left text-sm transition-colors",
                              isSelected
                                ? "bg-amber-500/10 font-semibold text-amber-700 dark:bg-amber-400/15 dark:text-amber-300"
                                : "hover:bg-neutral-100 text-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                            )}
                          >
                            <div>
                              <p>{opt.label}</p>
                              <p className="text-xs font-normal text-neutral-400 dark:text-neutral-500">
                                {opt.desc}
                              </p>
                            </div>
                            {isSelected && <Check className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Separator for desktop */}
              <div className="hidden h-8 w-[1px] bg-neutral-200 md:block dark:bg-neutral-800" />

              {/* Field 2: Tanggal Reservasi (4 cols) */}
              <div className="md:col-span-4">
                <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="group flex w-full cursor-pointer items-center gap-3.5 rounded-2xl md:rounded-full px-5 py-3.5 text-left transition-colors hover:bg-neutral-100/80 focus:outline-none dark:hover:bg-neutral-800/80"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-500/10 text-rose-600 dark:bg-rose-400/10 dark:text-rose-400">
                        <CalendarIcon className="h-5 w-5" />
                      </div>
                      <div className="grow overflow-hidden">
                        <span className="block text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                          Tanggal Penggunaan
                        </span>
                        <span className="block truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                          {format(selectedDateObj, "EEE, dd MMM yyyy", {
                            locale: localeId,
                          })}
                        </span>
                      </div>
                      <ChevronDown className="h-4 w-4 text-neutral-400 transition-transform group-hover:translate-y-0.5" />
                    </button>
                  </PopoverTrigger>

                  <PopoverContent
                    align="center"
                    className="w-auto rounded-3xl p-4 shadow-none border-neutral-200 dark:border-neutral-800 dark:bg-neutral-900"
                  >
                    <Calendar
                      mode="single"
                      selected={selectedDateObj}
                      onSelect={(day) => {
                        if (day) {
                          onFilterChange({
                            selectedDate: format(day, "yyyy-MM-dd"),
                          });
                          setIsDateOpen(false);
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Separator for desktop */}
              <div className="hidden h-8 w-[1px] bg-neutral-200 md:block dark:bg-neutral-800" />

              {/* Field 3: Kapasitas Tamu (3 cols) */}
              <div className="md:col-span-3">
                <Popover open={isGuestsOpen} onOpenChange={setIsGuestsOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="group flex w-full cursor-pointer items-center gap-3.5 rounded-2xl md:rounded-full px-5 py-3.5 text-left transition-colors hover:bg-neutral-100/80 focus:outline-none dark:hover:bg-neutral-800/80"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-500/10 text-teal-600 dark:bg-teal-400/10 dark:text-teal-400">
                        <Users className="h-5 w-5" />
                      </div>
                      <div className="grow overflow-hidden">
                        <span className="block text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                          Kapasitas
                        </span>
                        <span className="block truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                          {filter.minCapacity > 0
                            ? `≥ ${filter.minCapacity} Peserta`
                            : "Semua Kapasitas"}
                        </span>
                      </div>
                      <ChevronDown className="h-4 w-4 text-neutral-400 transition-transform group-hover:translate-y-0.5" />
                    </button>
                  </PopoverTrigger>

                  <PopoverContent
                    align="end"
                    className="w-72 rounded-3xl p-4 shadow-none border-neutral-200 dark:border-neutral-800 dark:bg-neutral-900"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                            Jumlah Peserta
                          </p>
                          <p className="text-xs text-neutral-500">
                            Minimum kursi yang dibutuhkan
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              onFilterChange({
                                minCapacity: Math.max(0, filter.minCapacity - 5),
                              })
                            }
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-neutral-300 hover:border-neutral-400 dark:border-neutral-700 text-sm font-bold"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-sm font-bold text-neutral-900 dark:text-neutral-100">
                            {filter.minCapacity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              onFilterChange({
                                minCapacity: filter.minCapacity + 5,
                              })
                            }
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-neutral-300 hover:border-neutral-400 dark:border-neutral-700 text-sm font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Quick preset buttons */}
                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                        {[0, 10, 20, 50, 100].map((cap) => (
                          <button
                            key={cap}
                            type="button"
                            onClick={() => {
                              onFilterChange({ minCapacity: cap });
                              setIsGuestsOpen(false);
                            }}
                            className={cn(
                              "rounded-full px-2.5 py-1 text-xs font-medium cursor-pointer transition-colors",
                              filter.minCapacity === cap
                                ? "bg-amber-500 text-white font-semibold"
                                : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300"
                            )}
                          >
                            {cap === 0 ? "Bebas" : `${cap}+ pax`}
                          </button>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Action Button: Search (1 col or full button) */}
              <div className="md:col-span-1 flex justify-end p-1">
                <button
                  type="button"
                  onClick={onSearch}
                  aria-label="Cari Ruangan"
                  className="flex h-12 w-full md:w-12 cursor-pointer items-center justify-center rounded-2xl md:rounded-full bg-gradient-to-r from-amber-600 via-orange-500 to-rose-500 text-white shadow-none transition-all hover:scale-105 active:scale-95"
                >
                  <Search className="h-5 w-5" />
                  <span className="ml-2 font-semibold md:hidden">Cari Ruangan</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
