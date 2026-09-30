import type { Metadata } from "next";
import { Suspense } from "react";
import { DormCalendar } from "@/features/dorm";

export const metadata: Metadata = {
  title: "Admin - Jadwal Asrama | SARPRAS PPKASN",
  description: "Kelola jadwal dan ketersediaan wisma asrama PPKASN Kemensetneg RI.",
};

export default function CmsDormPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Memuat jadwal...</div>}>
      <DormCalendar isAdmin={true} />
    </Suspense>
  );
}
