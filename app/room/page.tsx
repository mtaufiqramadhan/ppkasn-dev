import type { Metadata } from "next";
import { Suspense } from "react";
import { PublicShell } from "@/components/layout";
import { RoomCalendar } from "@/features/room";

export const metadata: Metadata = {
  title: "Jadwal Ruangan & Aula | SARPRAS PPKASN Kemensetneg",
  description:
    "Jadwal dan ketersediaan ruangan & aula PPKASN Kemensetneg RI. Akses jadwal penggunaan ruangan secara real-time dan transparan.",
};

export default function RoomPage() {
  return (
    <PublicShell>
      <Suspense fallback={<div className="p-8 text-center text-slate-400">Memuat jadwal...</div>}>
        <RoomCalendar isAdmin={false} />
      </Suspense>
    </PublicShell>
  );
}
