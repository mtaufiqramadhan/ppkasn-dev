import { Metadata } from "next";
import { CmsProgramView } from "@/features/program";

export const metadata: Metadata = {
  title: "Kelola Program & Pelatihan | CMS PPKASN",
  description: "Manajemen katalog program pelatihan kepemimpinan, teknis, dan luar negeri PPKASN.",
};

export default function CmsProgramPage() {
  return <CmsProgramView />;
}
