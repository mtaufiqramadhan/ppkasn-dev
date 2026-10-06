"use client";

import React from "react";
import { Download, ArrowRight, FileText, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GeneralInfoItem {
  title: string;
  desc: string;
  actionType: "download" | "detail";
  link: string;
  type: "dokumen" | "link";
}

const GENERAL_INFO: GeneralInfoItem[] = [
  {
    title: "Jadwal PPKASN",
    desc: "Jadwal PPKASN Kemensetneg Tahun 2026",
    actionType: "download",
    link: "https://scloud.setneg.go.id/s/gFSjTsZdtYWzb6r",
    type: "dokumen",
  },
  {
    title: "Standar Pelayanan",
    desc: "Dokumen Standar Pelayanan PPKASN Kemensetneg",
    actionType: "download",
    link: "https://scloud.setneg.go.id/s/wwCbFmwaHNPQgCQ",
    type: "dokumen",
  },
  {
    title: "Maklumat Pelayanan",
    desc: "Maklumat Pelayanan PPKASN Kemensetneg",
    actionType: "detail",
    link: "https://lh3.googleusercontent.com/u/0/d/1nQSsCVudLbhayns9kLeu4Sa2fjnYCbMC",
    type: "dokumen",
  },
  {
    title: "Hasil Survei",
    desc: "Informasi Hasil Survei Kepuasan PPKASN",
    actionType: "detail",
    link: "https://ppkasn.setneg.go.id/hasil-survei-ppkasn/",
    type: "link",
  },
  {
    title: "Pemenuhan PKASN",
    desc: "Informasi Pemenuhan Kewajiban PKASN Tahun 2026",
    actionType: "detail",
    link: "https://ppkasn.setneg.go.id/pemenuhan-hak-pkasn/",
    type: "link",
  },
  {
    title: "IKM",
    desc: "Indeks Kepuasan Masyarakat terhadap Layanan PPKASN",
    actionType: "detail",
    link: "https://ppkasn.setneg.go.id/penyampaian-hasil-survei-ppkasn/",
    type: "link",
  },
  {
    title: "Daftar Tarif Pelatihan",
    desc: "Informasi Tarif Pelatihan PPKASN Tahun 2026",
    actionType: "detail",
    link: "https://ppkasn.setneg.go.id/daftar-tarif-pelatihan/",
    type: "link",
  },
  {
    title: "Daftar Tarif Ruangan",
    desc: "Informasi Tarif Peminjaman Ruangan PPKASN Tahun 2026",
    actionType: "detail",
    link: "https://ppkasn.setneg.go.id/daftar-tarif-ruangan/",
    type: "link",
  },
  {
    title: "Kompensasi Pelayanan",
    desc: "Kompensasi apabila terjadi ketidaksesuaian layanan",
    actionType: "detail",
    link: "https://ppkasn.setneg.go.id/kompensasi/",
    type: "link",
  },
];

export function LandingGeneralInfo() {
  const [items, setItems] = React.useState<GeneralInfoItem[]>(GENERAL_INFO);

  React.useEffect(() => {
    fetch("/api/cms/landing")
      .then((res) => res.json())
      .then((json) => {
        if (json?.data?.generalInfo && Array.isArray(json.data.generalInfo) && json.data.generalInfo.length > 0) {
          setItems(json.data.generalInfo);
        }
      })
      .catch((err) => console.warn("Using default general info:", err));
  }, []);

  return (
    <section className="pt-12 sm:pt-14 md:pt-16 pb-16 sm:pb-20 md:pb-24 bg-white dark:bg-[#0d0d0d] rounded-b-[2.5rem] sm:rounded-b-[3.5rem] md:rounded-b-[4.5rem] relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobbin Header */}
        <div className="flex items-center justify-between mb-8 sm:mb-10">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
              Transparansi &amp; Dokumen Publik
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight leading-loose">
              Informasi Umum &amp; Pelayanan
            </h2>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
            {items.length} Dokumen &amp; Link
          </span>
        </div>

        {/* Mobbin Resource Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="group flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-[#141414] p-6 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-300 shadow-none"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3.5">
                  <div className="size-8 rounded-2xl sm:rounded-3xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700/60 flex items-center justify-center text-neutral-700 dark:text-neutral-300 group-hover:bg-neutral-950 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-neutral-950 transition-colors">
                    {item.type === "dokumen" ? (
                      <FileText className="size-4" />
                    ) : (
                      <Globe className="size-4" />
                    )}
                  </div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200/50 dark:border-neutral-700/50">
                    {item.type === "dokumen" ? "Dokumen" : "Link"}
                  </span>
                </div>

                <h3 className="font-bold text-sm sm:text-base text-neutral-950 dark:text-white group-hover:opacity-80 transition-opacity leading-loose">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-[13px] text-neutral-500 dark:text-neutral-400 mt-2.5 leading-loose">
                  {item.desc}
                </p>
              </div>

              <div className="pt-4 mt-5 border-t border-neutral-100 dark:border-neutral-800/60">
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="w-full rounded-2xl sm:rounded-3xl border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 h-8.5 justify-between"
                >
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>
                      {item.actionType === "download"
                        ? "Unduh Dokumen"
                        : item.type === "dokumen"
                        ? "Buka Dokumen"
                        : "Kunjungi Link"}
                    </span>
                    {item.actionType === "download" ? (
                      <Download className="size-3.5 text-neutral-400" />
                    ) : (
                      <ArrowRight className="size-3.5 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                    )}
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
