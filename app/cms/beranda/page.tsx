import { Metadata } from "next";
import { CmsLandingView } from "@/features/landing";

export const metadata: Metadata = {
  title: "Kelola Beranda | CMS Sarpras PPKASN",
  description: "Manajemen banner slider, informasi layanan publik, dan konten beranda PPKASN.",
};

export default function CmsBerandaPage() {
  return <CmsLandingView />;
}
