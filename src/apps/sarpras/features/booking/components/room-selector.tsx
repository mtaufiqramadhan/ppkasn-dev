"use client";

import React, { useMemo } from "react";
import { CalendarClock, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { type Room } from "../types";
import { RoomCard } from "./room-card";

export interface RoomSelectorProps {
  rooms: Room[];
  selectedRooms: string[];
  onToggle: (id: string) => void;
  loading: boolean;
  hasDate: boolean;
}

export const RoomSelector: React.FC<RoomSelectorProps> = React.memo(
  ({ rooms, selectedRooms, onToggle, loading, hasDate }) => {
    const floors = useMemo(
      () => Array.from(new Set(rooms.map((r) => r.floor))).sort((a, b) => a - b),
      [rooms]
    );

    const floorsWithRooms = useMemo(
      () =>
        floors.map((floor) => ({
          floor,
          rooms: rooms
            .filter((r) => r.floor === floor)
            .sort((a, b) => a.name.localeCompare(b.name)),
        })),
      [floors, rooms]
    );

    if (!hasDate) {
      return (
        <div className="flex flex-col items-center justify-center py-12 border border-dashed border-slate-300 rounded-xl bg-slate-50 text-slate-500">
          <CalendarClock
            className="h-10 w-10 mb-3 text-slate-300"
            strokeWidth={1.5}
          />
          <p className="font-medium">
            Silahkan pilih tanggal dan waktu terlebih dahulu
          </p>
          <p className="text-sm text-slate-400">
            Daftar ruangan akan muncul setelah Anda menentukan waktu.
          </p>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="space-y-6">
          {[2, 3, 4].map((floor) => (
            <div key={floor} className="space-y-3">
              <Skeleton className="h-9 w-24 rounded-full" />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-32 rounded-xl" />
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    const availableFloors = floors.length > 0 ? floors : [1];

    return (
      <Tabs defaultValue={availableFloors[0]?.toString()} className="w-full">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
          <TabsList className="bg-transparent h-auto p-0 flex flex-wrap gap-2 justify-start w-full sm:w-auto px-4 py-4">
            {availableFloors.map((floor) => (
              <TabsTrigger
                key={floor}
                value={String(floor)}
                className="rounded-xl border border-dashed border-slate-300 data-[state=active]:border-black data-[state=active]:bg-black data-[state=active]:text-white data-[state=inactive]:text-slate-500 hover:text-slate-900 hover:border-slate-400 px-4 py-2.5 font-bold text-sm transition-all bg-white"
              >
                Lantai {floor}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        {floorsWithRooms.map(({ floor, rooms: floorRooms }) => (
          <TabsContent key={floor} value={String(floor)} className="mt-0">
            <div className="space-y-4">
              <div className="flex justify-end items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                    <div className="w-2 h-2 rounded-full border border-slate-300 bg-white" />
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-900">
                    <div className="w-2 h-2 rounded-full bg-black border border-black" />
                    <span>Selected</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                    <div className="w-2 h-2 rounded-full bg-slate-100 border border-dashed border-slate-300" />
                    <span>Booked</span>
                  </div>
                </div>
              </div>
              {floorRooms.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {floorRooms.map((room) => (
                    <RoomCard
                      key={room.id}
                      room={room}
                      isSelected={selectedRooms.includes(room.id)}
                      onSelect={onToggle}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                  <Info className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>Tidak ada ruangan tersedia di lantai ini</p>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    );
  }
);

RoomSelector.displayName = "RoomSelector";
