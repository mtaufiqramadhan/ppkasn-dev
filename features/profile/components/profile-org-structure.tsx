import React from "react";

export function ProfileOrgStructure() {
  return (
    <section className="pt-8 sm:pt-12 pb-12 sm:pb-16 border-b border-neutral-200/80 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight leading-tight">
            Struktur Organisasi
          </h2>
          <p className="mt-4 text-sm sm:text-base text-neutral-600 dark:text-neutral-300 w-full leading-loose">
            Pusat Pengembangan Kompetensi Aparatur Sipil Negara Kementerian Sekretariat Negara.
          </p>
        </div>

        {/* Image Card - Fit Edge-to-Edge to Border */}
        <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-[#141414] overflow-hidden shadow-none">
          <img
            src="/images/struktur-organisasi.webp"
            alt="Bagan Struktur Organisasi PPKASN Kemensetneg"
            loading="lazy"
            className="w-full h-auto block"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/images/struktur-organisasi.jpeg";
            }}
          />
        </div>
      </div>
    </section>
  );
}
