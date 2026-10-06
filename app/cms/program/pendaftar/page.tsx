import { Metadata } from "next";
import { CmsRegistrationsView } from "@/features/program";

export const metadata: Metadata = {
  title: "Data Pendaftar Program | CMS PPKASN",
  description: "Daftar peserta dan berkas pendaftaran usulan pelatihan PPKASN.",
};

export default function CmsRegistrationsPage() {
  return <CmsRegistrationsView />;
}
