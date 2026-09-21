"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { type ChisfisRoom } from "../types";

export interface AirbnbRoomCardProps {
  room: ChisfisRoom;
  onBook?: (room: ChisfisRoom) => void;
  onToggleFavorite?: (roomId: string) => void;
  isFavorite?: boolean;
}

export const AirbnbRoomCard: React.FC<AirbnbRoomCardProps> = ({
  room,
  onBook,
}) => {
  return (
    <Link
      href={`/booking/${room.id}`}
      onClick={() => {
        if (onBook) onBook(room);
      }}
      className="group flex flex-col cursor-pointer select-none no-underline"
    >
      {/* 1. Photo Container (Direct Empty View Illustration, Exact Airbnb 20:19 Aspect Ratio) */}
      <div className="relative aspect-[20/19] w-full overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
        <Image
          src="/empty-rooms.jpg"
          alt={room.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-102"
        />

        {/* Capacity Badge (Top Left) */}
        <div className="absolute top-3 left-3">
          <span className="rounded-full bg-white/95 backdrop-blur-xs px-3 py-1 text-[11px] font-bold text-neutral-900 shadow-sm tracking-tight dark:bg-neutral-900/90 dark:text-neutral-100">
            {room.capacity} {room.assetType === "asrama" ? "Bed" : "Orang"}
          </span>
        </div>
      </div>

      {/* 2. Airbnb Content Typography */}
      <div className="mt-3 flex flex-col gap-0.5">
        {/* Row 1: Title */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[15px] font-semibold text-neutral-900 leading-snug line-clamp-1 dark:text-neutral-100">
            {room.name}
          </h3>
        </div>

        {/* Row 2: Location / Floor */}
        <p className="text-sm text-neutral-500 leading-tight dark:text-neutral-400">
          Gedung PPKASN, Lantai {room.floor}
        </p>
      </div>
    </Link>
  );
};
