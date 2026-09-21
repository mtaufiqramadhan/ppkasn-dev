"use client";

import React, { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import {
  Sparkles,
  Building2,
  Calendar,
  Layers,
  Inbox,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookingHeader } from "./booking-header";
import { BookingHeroSearch } from "./booking-hero-search";
import { BookingFilterToolbar } from "./booking-filter-toolbar";
import { ChisfisRoomCard } from "./chisfis-room-card";
import { RoomBookingDialog } from "./room-booking-dialog";
import { BookingFloorMapModal } from "./booking-floor-map-modal";
import { chisfisRoomService } from "../services/chisfis-room-service";
import {
  type ChisfisRoom,
  type BookingFilterCriteria,
} from "../types";

export const ChisfisBookingView: React.FC = () => {
  const [allRooms, setAllRooms] = useState<ChisfisRoom[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<ChisfisRoom | null>(null);
  const [isFloorMapOpen, setIsFloorMapOpen] = useState<boolean>(false);
  const [visibleCount, setVisibleCount] = useState<number>(8);

  const initialFilter: BookingFilterCriteria = {
    searchTerm: "",
    category: "all",
    floor: "all",
    minCapacity: 0,
    selectedFeatures: [],
    selectedDate: format(new Date(), "yyyy-MM-dd"),
    timeSlot: "all",
  };

  const [filter, setFilter] = useState<BookingFilterCriteria>(initialFilter);

  // Load rooms and saved favorites on mount
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const rooms = await chisfisRoomService.getChisfisRooms();
        if (mounted) {
          setAllRooms(rooms);
        }
      } catch {
        if (mounted) {
          setAllRooms(chisfisRoomService.getFallbackRooms());
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    // Load favorites from local storage
    try {
      const savedFavs = localStorage.getItem("gaharu_room_favs");
      if (savedFavs) {
        setFavorites(new Set(JSON.parse(savedFavs)));
      }
    } catch {}

    return () => {
      mounted = false;
    };
  }, []);

  const handleToggleFavorite = (roomId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(roomId)) {
        next.delete(roomId);
      } else {
        next.add(roomId);
      }
      try {
        localStorage.setItem("gaharu_room_favs", JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  };

  const handleFilterChange = (next: Partial<BookingFilterCriteria>) => {
    setFilter((prev) => ({ ...prev, ...next }));
    setVisibleCount(8); // Reset pagination on filter change
  };

  const handleResetFilter = () => {
    setFilter(initialFilter);
    setVisibleCount(8);
  };

  // Filtered rooms logic
  const filteredRooms = useMemo(() => {
    return allRooms.filter((room) => {
      // 1. Search term match
      if (filter.searchTerm.trim()) {
        const term = filter.searchTerm.toLowerCase();
        const matchName = room.name.toLowerCase().includes(term);
        const matchFeatures = room.features.some((f) => f.toLowerCase().includes(term));
        if (!matchName && !matchFeatures) return false;
      }

      // 2. Floor filter
      if (filter.floor !== "all" && room.floor !== filter.floor) {
        return false;
      }

      // 3. Minimum Capacity
      if (filter.minCapacity > 0 && room.capacity < filter.minCapacity) {
        return false;
      }

      // 4. Category Tabs
      if (filter.category !== "all") {
        const cat = (room.category || "").toLowerCase();
        const name = room.name.toLowerCase();

        if (filter.category === "ruang_rapat") {
          const isMatch =
            (cat.includes("rapat") || name.includes("rapat")) &&
            !cat.includes("daring") &&
            !name.includes("daring") &&
            !cat.includes("diskusi") &&
            !name.includes("diskusi");
          if (!isMatch) return false;
        } else if (filter.category === "ruang_daring") {
          const isMatch = cat.includes("daring") || name.includes("daring");
          if (!isMatch) return false;
        } else if (filter.category === "ruang_diskusi" || filter.category === "diskusi") {
          const isMatch =
            (cat.includes("diskusi") || name.includes("diskusi")) &&
            !cat.includes("daring") &&
            !name.includes("daring");
          if (!isMatch) return false;
        } else if (filter.category === "auditorium") {
          const isMatch =
            cat.includes("auditorium") ||
            cat.includes("seminar") ||
            cat.includes("kelas") ||
            name.includes("auditorium") ||
            name.includes("seminar") ||
            name.includes("kelas");
          if (!isMatch) return false;
        } else if (filter.category === "studio_lab") {
          const isMatch =
            cat.includes("studio") ||
            cat.includes("lab") ||
            name.includes("studio") ||
            name.includes("laboratorium") ||
            name.includes("multimedia");
          if (!isMatch) return false;
        }
      }

      // 5. Selected Facilities Check
      if (filter.selectedFeatures.length > 0) {
        const roomFeaturesText = room.features.join(" ").toLowerCase();
        const hasAllFeatures = filter.selectedFeatures.every((f) =>
          roomFeaturesText.includes(f.toLowerCase())
        );
        if (!hasAllFeatures) return false;
      }

      return true;
    });
  }, [allRooms, filter]);

  const displayedRooms = filteredRooms.slice(0, visibleCount);

  return (
    <div className="min-h-screen bg-white text-neutral-900 selection:bg-amber-500 selection:text-white dark:bg-neutral-950 dark:text-neutral-50 flex flex-col">
      {/* Top Bar Navigation */}
      <BookingHeader />

      {/* Main Content */}
      <main className="flex-1">
        {/* Chisfis Hero Section with Floating Search */}
        <BookingHeroSearch
          filter={filter}
          onFilterChange={handleFilterChange}
          onSearch={() => {
            // Smooth scroll to the results section
            const el = document.getElementById("room-listings-section");
            el?.scrollIntoView({ behavior: "smooth" });
          }}
          totalRoomsCount={allRooms.length}
        />

        {/* Room Listings Section */}
        <section
          id="room-listings-section"
          className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20 pt-4"
        >
          {/* Category Tabs & Filter Toolbar */}
          <BookingFilterToolbar
            filter={filter}
            onFilterChange={handleFilterChange}
            onResetFilter={handleResetFilter}
            filteredCount={filteredRooms.length}
            totalCount={allRooms.length}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onOpenFloorMap={() => setIsFloorMapOpen(true)}
          />

          {/* Rooms Grid / List / Skeleton */}
          {isLoading ? (
            /* Loading Skeleton Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-[2rem] border border-neutral-200 bg-neutral-100/60 p-3.5 dark:border-neutral-800 dark:bg-neutral-900/60"
                >
                  <div className="aspect-[4/3] rounded-[1.6rem] bg-neutral-200 dark:bg-neutral-800" />
                  <div className="mt-4 h-4 w-1/2 rounded-md bg-neutral-200 dark:bg-neutral-800" />
                  <div className="mt-2 h-5 w-3/4 rounded-md bg-neutral-200 dark:bg-neutral-800" />
                  <div className="mt-4 h-8 w-full rounded-full bg-neutral-200 dark:bg-neutral-800" />
                </div>
              ))}
            </div>
          ) : displayedRooms.length > 0 ? (
            <>
              {/* Room Cards Grid */}
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2"
                    : "space-y-4 pt-2"
                }
              >
                {displayedRooms.map((room) => (
                  <ChisfisRoomCard
                    key={room.id}
                    room={room}
                    onBook={(r) => setSelectedRoomForBooking(r)}
                    onToggleFavorite={handleToggleFavorite}
                    isFavorite={favorites.has(room.id)}
                    viewMode={viewMode}
                  />
                ))}
              </div>

              {/* Load More Button if remaining */}
              {visibleCount < filteredRooms.length && (
                <div className="mt-14 flex justify-center">
                  <Button
                    size="lg"
                    onClick={() => setVisibleCount((prev) => prev + 8)}
                    className="cursor-pointer rounded-full border border-neutral-300 bg-white px-8 py-6 text-sm font-bold text-neutral-800 shadow-md hover:bg-neutral-50 transition-all hover:scale-105 active:scale-95 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
                  >
                    Tampilkan Lebih Banyak ({filteredRooms.length - visibleCount} tersisa)
                  </Button>
                </div>
              )}
            </>
          ) : (
            /* Empty State */
            <div className="mt-12 rounded-[2.5rem] border border-dashed border-neutral-300 py-16 text-center dark:border-neutral-800">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 dark:bg-neutral-900">
                <Inbox className="h-8 w-8" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-neutral-900 dark:text-neutral-100">
                Tidak Ada Ruangan yang Sesuai
              </h3>
              <p className="mx-auto mt-1 max-w-sm text-xs text-neutral-500">
                Coba sesuaikan kata kunci pencarian, ubah tingkat lantai, atau reset filter fasilitas.
              </p>
              <div className="mt-6">
                <Button
                  onClick={handleResetFilter}
                  variant="outline"
                  className="rounded-full text-xs font-semibold px-5"
                >
                  Reset Semua Filter
                </Button>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Modern Footer */}
      <footer className="border-t border-neutral-200/80 bg-neutral-50 py-12 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-600 text-white font-bold">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Ruangan Gaharu PPKASN
                </p>
                <p className="text-xs text-neutral-500">
                  Pusat Pengembangan Kompetensi Aparatur Sipil Negara • Kemensetneg RI
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs text-neutral-500">
              <span>Jl. Gaharu No. 1, Jakarta</span>
              <span>•</span>
              <span>Layanan Reservasi Resmi</span>
              <span>•</span>
              <span>© {new Date().getFullYear()} Badan Teknologi, Data, dan Informasi</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Interactive Booking Dialog */}
      <RoomBookingDialog
        room={selectedRoomForBooking}
        isOpen={Boolean(selectedRoomForBooking)}
        onClose={() => setSelectedRoomForBooking(null)}
        defaultDate={filter.selectedDate}
        onBookingSuccess={() => {
          // Re-fetch or refresh rooms if needed
        }}
      />

      {/* Interactive Floor Map Schematic Modal */}
      <BookingFloorMapModal
        isOpen={isFloorMapOpen}
        onClose={() => setIsFloorMapOpen(false)}
        rooms={allRooms}
        onSelectRoom={(r) => setSelectedRoomForBooking(r)}
      />
    </div>
  );
};
