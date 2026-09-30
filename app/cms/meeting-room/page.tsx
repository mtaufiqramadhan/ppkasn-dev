import type { Metadata } from "next";
import { Suspense } from "react";
import { MeetingRoomCalendar } from "@/features/meeting-room";

export const metadata: Metadata = {
  title: "Admin - Jadwal Ruang Rapat | SARPRAS PPKASN",
  description: "Kelola jadwal ruang rapat PPKASN Kemensetneg RI.",
};

export default function CmsMeetingRoomPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Memuat jadwal...</div>}>
      <MeetingRoomCalendar isAdmin={true} />
    </Suspense>
  );
}
