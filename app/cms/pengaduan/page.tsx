import { Metadata } from "next";
import { CmsComplaintView } from "@/features/complaint";

export const metadata: Metadata = {
  title: "Kelola Layanan Pengaduan | CMS PPKASN",
  description: "Manajemen tiket pengaduan publik, verifikasi, dan tindak lanjut aduan sarpras & diklat PPKASN.",
};

export default function CmsPengaduanPage() {
  return <CmsComplaintView />;
}
