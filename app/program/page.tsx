import type { Metadata } from "next";
import { Suspense } from "react";
import { PublicShell } from "@/components/layout";
import { getStoredPrograms } from "@/features/program/server";
import { ProgramView } from "@/features/program";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Program Pelatihan & Kediklatan ASN | PPKASN Kemensetneg RI",
  description:
    "Portal resmi program pelatihan kediklatan aparatur dan beasiswa pelatihan luar negeri Pusat Pengembangan Kompetensi ASN (PPKASN) Kementerian Sekretariat Negara RI.",
  openGraph: {
    title: "Program Pelatihan & Kediklatan ASN | PPKASN Kemensetneg RI",
    description:
      "Akselerasi kompetensi ASN melalui Pelatihan Kepemimpinan, Teknis Kepresidenan, Transformasi Digital AI, serta Pelatihan Luar Negeri KOICA, JICA, SCP, dan Australia Awards.",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

export default function ProgramPage() {
  const programs = getStoredPrograms();
  return (
    <PublicShell>
      <div className="leading-loose">
        <Suspense
          fallback={
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
              <Skeleton className="h-40 w-full rounded-2xl sm:rounded-3xl" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <Skeleton className="h-64 rounded-2xl sm:rounded-3xl" />
                <Skeleton className="h-64 rounded-2xl sm:rounded-3xl" />
                <Skeleton className="h-64 rounded-2xl sm:rounded-3xl" />
              </div>
            </div>
          }
        >
          <ProgramView programs={programs} />
        </Suspense>
      </div>
    </PublicShell>
  );
}
