import type { Metadata } from "next";
import { Suspense } from "react";
import { PublicShell } from "@/components/layout";
import { MeetingRoomCalendar } from "@/features/meeting-room";

export const metadata: Metadata = {
  title: "Jadwal Ruang Rapat | SARPRAS PPKASN Kemensetneg",
  description:
    "Jadwal dan kalender ketersediaan ruang rapat PPKASN Kemensetneg RI. Akses jadwal penggunaan ruang rapat secara real-time dan transparan.",
};

export default function MeetingRoomPage() {
  return (
    <PublicShell>
      <Suspense fallback={<div className="p-8 text-center text-slate-400">Memuat jadwal...</div>}>
        <MeetingRoomCalendar isAdmin={false} />
      </Suspense>
    </PublicShell>
  );
}
