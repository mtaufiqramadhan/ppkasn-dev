import type { Metadata } from "next";
import { Suspense } from "react";
import { PublicShell } from "@/components/layout";
import { DormCalendar } from "@/features/dorm";

export const metadata: Metadata = {
  title: "Jadwal Wisma Asrama | SARPRAS PPKASN Kemensetneg",
  description:
    "Jadwal dan ketersediaan wisma asrama PPKASN Kemensetneg RI. Akses jadwal penggunaan kamar asrama secara real-time dan transparan.",
};

export default function DormPage() {
  return (
    <PublicShell>
      <Suspense fallback={<div className="p-8 text-center text-slate-400">Memuat jadwal...</div>}>
        <DormCalendar isAdmin={false} />
      </Suspense>
    </PublicShell>
  );
}
