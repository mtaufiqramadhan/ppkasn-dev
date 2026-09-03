"use client";

import React from "react";
import { XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { type Room } from "../types";

export interface RoomCardProps {
  room: Room;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export const RoomCard: React.FC<RoomCardProps> = React.memo(
  ({ room, isSelected, onSelect }) => {
    const isBooked = room.status === "booked";

    const baseClasses =
      "p-6 rounded-xl border transition-all duration-200 select-none relative group overflow-hidden flex items-center justify-between";
    const statusClasses = {
      available:
        "bg-white border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50 cursor-pointer",
      booked:
        "bg-slate-50 border-dashed border-slate-200 opacity-50 cursor-not-allowed",
      selected:
        "bg-slate-50 border-2 border-black border-dashed ring-0 cursor-pointer",
    };

    const containerClass = cn(
      baseClasses,
      isBooked
        ? statusClasses.booked
        : isSelected
        ? statusClasses.selected
        : statusClasses.available
    );

    return (
      <div
        role="button"
        aria-disabled={isBooked}
        data-room-id={room.id}
        onClick={() => !isBooked && onSelect(room.id)}
        className={containerClass}
      >
        <div className="flex flex-col gap-1 relative z-10">
          <h3
            className={cn(
              "font-bold text-lg tracking-tight",
              isSelected ? "text-black" : "text-slate-900"
            )}
          >
            {room.name}
          </h3>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          <Badge
            variant="secondary"
            className={cn(
              "font-medium text-xs border border-dashed rounded-lg shadow-none px-3 py-1.5 shrink-0",
              isSelected
                ? "bg-black text-white border-transparent"
                : "bg-slate-100 text-slate-600 border-slate-300"
            )}
          >
            {room.capacity} pax
            {isBooked && (
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="flex items-center text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-dashed border-slate-300">
                  <XCircle className="h-3.5 w-3.5 mr-1.5" />
                  Booked
                </div>
              </div>
            )}
          </Badge>
        </div>
      </div>
    );
  }
);

RoomCard.displayName = "RoomCard";
