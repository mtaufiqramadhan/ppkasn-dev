import type { Metadata } from "next";
import { Suspense } from "react";
import { RoomCalendar } from "@/features/room";

export const metadata: Metadata = {
  title: "Admin - Jadwal Ruangan & Aula | SARPRAS PPKASN",
  description: "Kelola jadwal ruangan dan aula PPKASN Kemensetneg RI.",
};

export default function CmsRoomPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Memuat jadwal...</div>}>
      <RoomCalendar isAdmin={true} />
    </Suspense>
  );
}
