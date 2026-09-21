"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Users, Sparkles, ArrowRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { type ChisfisRoom } from "../types";

interface BookingFloorMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  rooms: ChisfisRoom[];
  onSelectRoom: (room: ChisfisRoom) => void;
}

const FLOOR_LAYOUTS = [
  {
    floor: 1,
    title: "Lantai 1 - Gedung Utama & Sayap Pertemuan",
    desc: "Akses gerbang utama, lobby penyambutan, Auditorium Utama, dan Ruang Rapat Eksekutif.",
    roomsPreview: [
      { name: "Ruang Auditorium Utama", capacity: 100, type: "auditorium", code: "L1-AUD" },
      { name: "Ruang Rapat 1 (Executive)", capacity: 20, type: "meeting", code: "L1-RR1" },
      { name: "Lobby & Resepsionis PPKASN", capacity: 50, type: "public", code: "L1-LBY" },
    ],
  },
  {
    floor: 2,
    title: "Lantai 2 - Sayap Rapat & Komunikasi Daring",
    desc: "Area formal konferensi kedinasan dan bilik daring berperedam suara.",
    roomsPreview: [
      { name: "Ruang Rapat 2 (Boardroom)", capacity: 20, type: "meeting", code: "L2-RR2" },
      { name: "Ruang Daring 1 & 2 (Pod Zoom)", capacity: 4, type: "online", code: "L2-POD" },
      { name: "Ruang Diskusi B & C", capacity: 6, type: "collab", code: "L2-DSK" },
    ],
  },
  {
    floor: 3,
    title: "Lantai 3 - Pusat Produksi Konten & Ruang Kolaborasi",
    desc: "Studio multimedia siaran, Lab komputer 45 workstation, dan 6 unit bilik diskusi.",
    roomsPreview: [
      { name: "Ruang Studio Multimedia", capacity: 10, type: "studio", code: "L3-STU" },
      { name: "Laboratorium Multimedia PC", capacity: 45, type: "lab", code: "L3-LAB" },
      { name: "Ruang Diskusi 1 s/d 6", capacity: 10, type: "collab", code: "L3-DKS" },
    ],
  },
  {
    floor: 4,
    title: "Lantai 4 - Balai Pelatihan & Seminar Gaharu",
    desc: "Ruang pelatihan berkapasitas besar dengan pencahayaan alami dan panorama kota.",
    roomsPreview: [
      { name: "Ruang Seminar Gaharu", capacity: 50, type: "seminar", code: "L4-SMN" },
      { name: "Lounge VIP & Istirahat Pemateri", capacity: 12, type: "vip", code: "L4-VIP" },
    ],
  },
];

export const BookingFloorMapModal: React.FC<BookingFloorMapModalProps> = ({
  isOpen,
  onClose,
  rooms,
  onSelectRoom,
}) => {
  const [activeFloor, setActiveFloor] = useState<number>(1);

  const currentLayout =
    FLOOR_LAYOUTS.find((f) => f.floor === activeFloor) || FLOOR_LAYOUTS[0];

  const matchedRooms = rooms.filter((r) => r.floor === activeFloor);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl overflow-hidden rounded-[2.5rem] p-6 border-neutral-200 dark:border-neutral-800 dark:bg-neutral-900">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400">
                <Building2 className="h-5 w-5" />
              </span>
              <div>
                <DialogTitle className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                  Denah Gedung PPKASN
                </DialogTitle>
                <DialogDescription className="text-xs text-neutral-500">
                  Skema lokasi dan pembagian lantai ruangan pertemuan
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Floor Selection Tabs */}
        <div className="flex items-center gap-2 mt-4 border-b border-neutral-200/80 pb-3 dark:border-neutral-800 overflow-x-auto scrollbar-none">
          {[1, 2, 3, 4].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setActiveFloor(f)}
              className={cn(
                "flex shrink-0 cursor-pointer items-center gap-2 rounded-full px-5 py-2 text-xs font-bold transition-all",
                activeFloor === f
                  ? "bg-neutral-900 text-white shadow-md dark:bg-neutral-100 dark:text-neutral-950"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              )}
            >
              <span>Lantai {f}</span>
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-black/20 text-[10px] dark:bg-white/20">
                {rooms.filter((r) => r.floor === f).length}
              </span>
            </button>
          ))}
        </div>

        {/* Floor Schematic Description */}
        <div className="mt-4 rounded-2xl border border-amber-200/60 bg-amber-50/50 p-3.5 dark:border-amber-900/40 dark:bg-amber-950/20">
          <p className="text-xs font-bold text-amber-900 dark:text-amber-300">
            {currentLayout.title}
          </p>
          <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 mt-0.5">
            {currentLayout.desc}
          </p>
        </div>

        {/* Interactive Schematic Grid of Rooms on this Floor */}
        <div className="mt-4 space-y-2.5">
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Ruangan yang Dapat Dipesan pada Lantai Ini:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[40vh] overflow-y-auto pr-1">
            {matchedRooms.length > 0 ? (
              matchedRooms.map((r) => (
                <div
                  key={r.id}
                  onClick={() => {
                    onSelectRoom(r);
                    onClose();
                  }}
                  className="group flex cursor-pointer items-center justify-between rounded-2xl border border-neutral-200 bg-white p-3.5 shadow-2xs transition-all hover:border-amber-500 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900/90 dark:hover:border-amber-500"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700 font-mono text-xs font-bold group-hover:bg-amber-500 group-hover:text-white transition-colors dark:bg-neutral-800 dark:text-neutral-200">
                      L{r.floor}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900 group-hover:text-amber-600 transition-colors dark:text-neutral-100 dark:group-hover:text-amber-400">
                        {r.name}
                      </h4>
                      <p className="text-[11px] text-neutral-500">
                        Kapasitas {r.capacity} Pax • {r.category}
                      </p>
                    </div>
                  </div>

                  <ArrowRight className="h-4 w-4 text-neutral-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
                </div>
              ))
            ) : (
              <div className="col-span-2 py-8 text-center text-xs text-neutral-500">
                Tidak ada data ruangan khusus di lantai ini.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end pt-3 border-t border-neutral-100 dark:border-neutral-800">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-full text-xs font-semibold px-6"
          >
            Tutup Denah
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
