import type { Metadata } from "next";
import { Suspense } from "react";
import { PublicShell } from "@/components/layout";
import { getPublicNews } from "@/features/news/server";
import { NewsListView } from "@/features/news";

export const metadata: Metadata = {
  title: "Berita Terkini | PPKASN Kemensetneg RI",
  description:
    "Portal berita resmi Pusat Pengembangan Kompetensi ASN (PPKASN) Kementerian Sekretariat Negara RI. Liputan kebijakan, kepemimpinan aparatur, transformasi digital, dan kediklatan.",
  openGraph: {
    title: "Berita Terkini | PPKASN Kemensetneg RI",
    description:
      "Informasi terbaru seputar kegiatan kediklatan, kepemimpinan ASN, dan fasilitas penunjang di PPKASN Kemensetneg RI.",
    type: "website",
  },
};

export const dynamic="force-dynamic";

export default function BeritaPage() {
  return (
    <PublicShell>
      <div className="leading-loose">
        <Suspense
          fallback={
            <div className="py-24 text-center text-sm text-neutral-400 leading-loose">
              Memuat berita...
            </div>
          }
        >
          <NewsListView articles={getPublicNews()} />
        </Suspense>
      </div>
    </PublicShell>
  );
}
