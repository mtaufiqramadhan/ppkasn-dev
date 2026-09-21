"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { AirbnbHeader } from "./airbnb-header";
import { AirbnbCategoryBar } from "./airbnb-category-bar";
import { AirbnbRoomCard } from "./airbnb-room-card";
import { AirbnbHeroSearch } from "./airbnb-hero-search";
import { chisfisRoomService } from "../services/chisfis-room-service";
import {
  type ChisfisRoom,
  type BookingFilterCriteria,
} from "../types";

export const AirbnbBookingView: React.FC = () => {
  const [allRooms, setAllRooms] = useState<ChisfisRoom[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

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
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      // Past 100px scroll threshold, transition search into navbar
      setIsScrolled(window.scrollY > 100);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let mounted = true;
    async function loadRooms() {
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

    loadRooms();

    try {
      const saved = localStorage.getItem("gaharu_room_favs");
      if (saved) {
        setFavorites(new Set(JSON.parse(saved)));
      }
    } catch { }

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
      } catch { }
      return next;
    });
  };

  const handleFilterChange = (next: Partial<BookingFilterCriteria>) => {
    setFilter((prev) => ({ ...prev, ...next }));
  };

  const handleResetFilter = () => {
    setFilter(initialFilter);
  };

  // Filtered rooms logic
  const filteredRooms = useMemo(() => {
    return allRooms.filter((room) => {
      // 1. Search term (Room name, facilities, category, or floor)
      if (filter.searchTerm.trim()) {
        const term = filter.searchTerm.toLowerCase();
        const matchName = room.name.toLowerCase().includes(term);
        const matchFeatures = room.features.some((f) => f.toLowerCase().includes(term));
        const matchCategory = (room.category || "").toLowerCase().includes(term);
        const matchFloor = `lantai ${room.floor}`.toLowerCase().includes(term) || `lt ${room.floor}`.toLowerCase().includes(term);
        if (!matchName && !matchFeatures && !matchCategory && !matchFloor) return false;
      }

      // 2. Floor filter
      if (filter.floor !== "all" && room.floor !== filter.floor) {
        return false;
      }

      // 3. Minimum Capacity
      if (filter.minCapacity > 0 && room.capacity < filter.minCapacity) {
        return false;
      }

      // 4. Category
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
        } else if (filter.category === "asrama") {
          const isMatch =
            room.assetType === "asrama" ||
            cat.includes("asrama") ||
            cat.includes("kamar") ||
            name.includes("kamar");
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

      // 5. Amenities / Features
      if (filter.selectedFeatures.length > 0) {
        const roomFeaturesText = room.features.join(" ").toLowerCase();
        const hasAll = filter.selectedFeatures.every((f) =>
          roomFeaturesText.includes(f.toLowerCase())
        );
        if (!hasAll) return false;
      }

      return true;
    });
  }, [allRooms, filter]);

  return (
    <div className="min-h-screen bg-white text-[#222222] selection:bg-[#FF385C] selection:text-white dark:bg-[#121212] dark:text-[#F7F7F7] flex flex-col font-sans">
      {/* 1. Authentic Airbnb Top Header (Search pill animates into view on scroll, scrolls to hero on click) */}
      <AirbnbHeader
        filter={filter}
        onFilterChange={handleFilterChange}
        onSearch={() => { }}
        totalMatched={filteredRooms.length}
        onReset={handleResetFilter}
        onScrollToHero={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        isScrolled={isScrolled}
      />

      {/* 2. Hero Search Section (Prominent search bar, transitions to navbar on scroll) */}
      <AirbnbHeroSearch
        filter={filter}
        onFilterChange={handleFilterChange}
        totalMatched={filteredRooms.length}
        onReset={handleResetFilter}
        onScrollToRooms={() => {
          const el = document.getElementById("explore-rooms-section");
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
          }
        }}
      />

      {/* 3. Iconic Airbnb Category Icons Bar */}
      <div id="explore-rooms-section">
        <AirbnbCategoryBar
          filter={filter}
          onFilterChange={handleFilterChange}
          totalMatched={filteredRooms.length}
          onResetFilter={handleResetFilter}
        />
      </div>

      {/* 3. Main Grid (Pure Airbnb Listing Grid directly below categories) */}
      <main className="flex-1 mx-auto w-full max-w-[2520px] px-4 sm:px-8 xl:px-12 py-8">
        {isLoading ? (
          /* Clean Skeleton Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-x-6 gap-y-10">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3 animate-pulse">
                <div className="aspect-[20/19] rounded-xl bg-neutral-200 dark:bg-neutral-800" />
                <div className="h-4 w-3/4 bg-neutral-200 rounded-md dark:bg-neutral-800" />
                <div className="h-3 w-1/2 bg-neutral-200 rounded-md dark:bg-neutral-800" />
                <div className="h-4 w-1/3 bg-neutral-200 rounded-md dark:bg-neutral-800" />
              </div>
            ))}
          </div>
        ) : filteredRooms.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-x-6 gap-y-10">
            {filteredRooms.map((room) => (
              <AirbnbRoomCard
                key={room.id}
                room={room}
                onToggleFavorite={handleToggleFavorite}
                isFavorite={favorites.has(room.id)}
              />
            ))}
          </div>
        ) : (
          /* Empty Search State */
          <div className="py-12 sm:py-16 text-center max-w-lg mx-auto flex flex-col items-center">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 mb-6 rounded-3xl overflow-hidden shadow-lg border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
              <Image
                src="/empty-rooms.jpg"
                alt="Tidak ada ruangan yang ditemukan"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 256px, 288px"
                priority
              />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2 tracking-tight">
              Tidak ada ruangan yang cocok
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto leading-relaxed mb-6">
              Kriteria pencarian atau filter yang Anda pilih saat ini tidak menemukan ruangan yang tersedia. Coba sesuaikan kata kunci atau atur ulang filter Anda.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleResetFilter}
                className="rounded-full bg-neutral-900 text-white px-7 py-3 text-sm font-semibold hover:bg-black transition-all active:scale-95 shadow-sm dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 cursor-pointer"
              >
                Hapus Semua Filter
              </button>
            </div>
          </div>
        )}
      </main>

      {/* 4. Airbnb Clean Sticky Footer */}
      <footer className="sticky bottom-0 z-20 border-t border-[#ebebeb] bg-white py-3.5 dark:border-neutral-800 dark:bg-[#121212]">
        <div className="mx-auto max-w-[2520px] px-4 sm:px-8 xl:px-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-600 dark:text-neutral-400">
            <div className="flex flex-wrap items-center gap-2">
              <span>© {new Date().getFullYear()} Badan Teknologi, Data, dan Informasi</span>
              <span>·</span>
              <span className="hover:underline cursor-pointer">Kemensetneg RI</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
