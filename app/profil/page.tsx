import type { Metadata } from "next";
import { PublicShell } from "@/components/layout";
import { ProfileView } from "@/features/profile";

export const metadata: Metadata = {
  title: "Profil Lembaga | PPKASN Kemensetneg RI",
  description:
    "Profil Pusat Pengembangan Kompetensi Aparatur Sipil Negara (PPKASN) Kementerian Sekretariat Negara RI. Struktur organisasi, kebijakan, dan program strategis pengembangan kompetensi aparatur.",
  openGraph: {
    title: "Profil Lembaga | PPKASN Kemensetneg RI",
    description:
      "Mengenal lebih dekat struktur organisasi, kebijakan, dan program strategis PPKASN Kemensetneg RI.",
    type: "website",
  },
};

export default function ProfilPage() {
  return (
    <PublicShell>
      <ProfileView />
    </PublicShell>
  );
}
