"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Star,
  Users,
  Building,
  CheckCircle2,
  CalendarCheck,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type ChisfisRoom } from "../types";

export interface ChisfisRoomCardProps {
  room: ChisfisRoom;
  onBook: (room: ChisfisRoom) => void;
  onToggleFavorite?: (roomId: string) => void;
  isFavorite?: boolean;
  viewMode?: "grid" | "list";
}

export const ChisfisRoomCard: React.FC<ChisfisRoomCardProps> = ({
  room,
  onBook,
  onToggleFavorite,
  isFavorite = false,
  viewMode = "grid",
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = room.images && room.images.length > 0
    ? room.images
    : ["/empty-rooms.jpg"];

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(room.id);
    }
  };

  if (viewMode === "list") {
    return (
      <div
        onClick={() => onBook(room)}
        className="group cursor-pointer rounded-3xl border border-neutral-200/90 bg-white p-3.5 shadow-xs transition-all duration-300 hover:border-neutral-300 hover:shadow-xl dark:border-neutral-800 dark:bg-neutral-900/80 dark:hover:border-neutral-700"
      >
        <div className="flex flex-col sm:flex-row gap-5">
          {/* Image Container */}
          <div className="relative aspect-[16/10] w-full sm:w-72 shrink-0 overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-800">
            <Image
              src="/empty-rooms.jpg"
              alt={room.name}
              fill
              sizes="(max-width: 640px) 100vw, 300px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span className="absolute top-3 left-3 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[11px] font-bold tracking-wide text-white uppercase shadow-sm">
              Lantai {room.floor}
            </span>
            <button
              type="button"
              onClick={handleFavoriteClick}
              className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm text-neutral-700 shadow-sm transition-transform hover:scale-110 active:scale-90 dark:bg-black/60 dark:text-neutral-200"
            >
              <Heart
                className={cn(
                  "h-4 w-4 transition-colors",
                  isFavorite ? "fill-rose-500 text-rose-500" : ""
                )}
              />
            </button>
          </div>

          {/* Details Content */}
          <div className="flex flex-1 flex-col justify-between py-1">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                  {room.category} • Lantai {room.floor} • {room.location}
                </span>
                <div className="flex items-center gap-1 text-xs font-bold text-neutral-800 dark:text-neutral-200">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                  <span>{room.rating.toFixed(1)}</span>
                  <span className="text-neutral-400 font-normal">
                    ({room.reviewCount})
                  </span>
                </div>
              </div>

              <h3 className="mt-1.5 text-lg font-bold text-neutral-900 group-hover:text-amber-600 transition-colors dark:text-neutral-100 dark:group-hover:text-amber-400">
                {room.name}
              </h3>

              <p className="mt-1 line-clamp-2 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                {room.description}
              </p>

              {/* Facilities Chips */}
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                  <Users className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                  {room.capacity} Orang
                </span>
                {room.features.slice(0, 4).map((f) => (
                  <span
                    key={f}
                    className="inline-flex items-center rounded-md bg-neutral-50 border border-neutral-200/60 px-2 py-0.5 text-[11px] text-neutral-600 dark:bg-neutral-800/60 dark:border-neutral-700 dark:text-neutral-300"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Row */}
            <div className="mt-4 flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800">
              <div>
                <span className="text-xs font-medium text-neutral-400">Status Penggunaan</span>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  Tersedia untuk Reservasi
                </p>
              </div>

              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onBook(room);
                }}
                className="rounded-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold text-xs px-5 shadow-sm"
              >
                Pesan Ruangan
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid Mode (Chisfis Stay Card Standard)
  return (
    <div
      onClick={() => onBook(room)}
      className="group cursor-pointer rounded-[2rem] border border-neutral-200/80 bg-white p-3.5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-2xl dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
    >
      {/* Photo Carousel Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.6rem] bg-neutral-100 dark:bg-neutral-800">
        <Image
          src="/empty-rooms.jpg"
          alt={room.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Floating Tag/Badge (Top Left) */}
        <span className="absolute top-3 left-3 rounded-full bg-neutral-950/70 backdrop-blur-md px-3 py-1 text-[11px] font-bold tracking-wider text-white shadow-sm">
          Lantai {room.floor}
        </span>

        {/* Favorite Heart Button (Top Right) */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          aria-label="Simpan ke favorit"
          className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm text-neutral-800 shadow-md transition-all hover:scale-110 active:scale-95 dark:bg-neutral-900/80 dark:text-neutral-200"
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors",
              isFavorite ? "fill-rose-500 text-rose-500" : ""
            )}
          />
        </button>

        {/* Prev / Next Image Navigation (Visible on Hover) */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrevImage}
              aria-label="Foto sebelumnya"
              className="absolute left-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-800 shadow-md opacity-0 backdrop-blur-xs transition-all hover:scale-105 group-hover:opacity-100 active:scale-95 dark:bg-neutral-900/90 dark:text-neutral-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleNextImage}
              aria-label="Foto selanjutnya"
              className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-800 shadow-md opacity-0 backdrop-blur-xs transition-all hover:scale-105 group-hover:opacity-100 active:scale-95 dark:bg-neutral-900/90 dark:text-neutral-100"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* Pagination Dots */}
            <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    idx === currentImageIndex
                      ? "w-5 bg-white shadow-xs"
                      : "w-1.5 bg-white/60 hover:bg-white/90"
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Card Body */}
      <div className="px-1.5 pt-4 pb-1">
        {/* Meta & Rating Row */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-neutral-500 dark:text-neutral-400">
            {room.category} • Lantai {room.floor}
          </span>
          <div className="flex items-center gap-1 font-bold text-neutral-800 dark:text-neutral-200">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
            <span>{room.rating.toFixed(1)}</span>
            <span className="text-neutral-400 font-normal">
              ({room.reviewCount})
            </span>
          </div>
        </div>

        {/* Room Title */}
        <h2 className="mt-1.5 line-clamp-1 text-base font-bold tracking-tight text-neutral-900 group-hover:text-amber-600 transition-colors dark:text-neutral-50 dark:group-hover:text-amber-400">
          {room.name}
        </h2>

        {/* Capacity & Facilities Row */}
        <div className="mt-2.5 flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
          <div className="flex items-center gap-1 font-medium">
            <Users className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <span>Kapasitas {room.capacity} Pax</span>
          </div>
          <span>•</span>
          <div className="truncate font-light text-neutral-500">
            {room.features.slice(0, 2).join(", ")}
          </div>
        </div>

        {/* Divider & Action Row */}
        <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3 dark:border-neutral-800">
          <div>
            <span className="block text-[11px] font-medium text-neutral-400">
              Layanan Kedinasan
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              Tersedia Hari Ini
            </span>
          </div>

          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onBook(room);
            }}
            className="rounded-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold text-xs px-4 shadow-sm shadow-orange-500/20 transition-all hover:scale-105 active:scale-95"
          >
            Pesan Ruangan
          </Button>
        </div>
      </div>
    </div>
  );
};
