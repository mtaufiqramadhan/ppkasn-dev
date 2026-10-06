import { Metadata } from "next";
import { CmsProfileView } from "@/features/profile";

export const metadata: Metadata = {
  title: "Kelola Profil PPKASN | CMS PPKASN",
  description: "Manajemen Visi & Misi, Nilai BerAKHLAK, Fasilitas Sarana, dan Kontak PPKASN Kemensetneg.",
};

export default function CmsProfilPage() {
  return <CmsProfileView />;
}
