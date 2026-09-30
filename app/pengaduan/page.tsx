import type { Metadata } from "next";
import { PublicShell } from "@/components/layout";
import { ComplaintView } from "@/features/complaint";

export const metadata: Metadata = {
  title: "Layanan Pengaduan | PPKASN Kemensetneg RI",
  description:
    "Kanal resmi penyampaian pengaduan dan pelaporan kendala layanan kediklatan serta sarana prasarana PPKASN Kementerian Sekretariat Negara RI.",
  openGraph: {
    title: "Layanan Pengaduan | PPKASN Kemensetneg RI",
    description:
      "Kirim pengaduan, kritik, dan saran perbaikan layanan secara transparan dan aman. Kerahasiaan pelapor terjamin 100%.",
    type: "website",
  },
};

export default function PengaduanPage() {
  return (
    <PublicShell>
      <ComplaintView />
    </PublicShell>
  );
}
