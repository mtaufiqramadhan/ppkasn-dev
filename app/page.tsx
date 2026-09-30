import type { Metadata } from "next";
import { LandingPageView } from "@/features/landing";

export const metadata: Metadata = {
  title: "PPKASN – Jl. Gaharu I No.1, RT.10/RW.11, Cipete Sel., Kec. Cilandak, DKI Jakarta 12430",
  description:
    "Pusat Pengembangan Kompetensi Aparatur Sipil Negara (PPKASN) Kementerian Sekretariat Negara RI. Jl. Gaharu I No.1, RT.10/RW.11, Cipete Sel., Kec. Cilandak, DKI Jakarta, Daerah Khusus Ibukota Jakarta 12430.",
  openGraph: {
    title: "PPKASN Kemensetneg RI",
    description:
      "Pusat Pengembangan Kompetensi Aparatur Sipil Negara Kementerian Sekretariat Negara RI.",
    type: "website",
  },
};

export default function HomePage() {
  return <LandingPageView />;
}
