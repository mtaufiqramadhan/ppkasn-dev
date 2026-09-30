"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";

interface SpbeApp {
  name: string;
  fullName: string;
  description: string;
  image?: string;
  isBookingLogo?: boolean;
  link: string;
  isExternal: boolean;
  tag: string;
  status: string;
}

const APPS: SpbeApp[] = [
  {
    name: "PIONIR",
    fullName: "PIONIR Kemensetneg",
    description: "Portal digital integrasi administrasi dan layanan kediklatan ASN Kemensetneg RI.",
    image:
      "https://ppkasn.setneg.go.id/wp-content/uploads/elementor/thumbs/2-ri92ef2oxyv1ujx7r6pq7jtlf78166kwmqhi9g53z0.png",
    link: "https://pionir.setneg.go.id/",
    isExternal: true,
    tag: "E-Office & Layanan",
    status: "Aktif",
  },
  {
    name: "POSTER",
    fullName: "POSTER PPKASN",
    description: "Portal asesmen kompetensi dan pemetaan potensi aparatur sipil negara terpadu.",
    image: "https://ppkasn.setneg.go.id/wp-content/uploads/2026/01/1.png",
    link: "https://poster.setneg.go.id/",
    isExternal: true,
    tag: "Assessment Center",
    status: "Aktif",
  },
  {
    name: "PINTAR",
    fullName: "PINTAR Kemensetneg",
    description: "Learning Management System (LMS) kediklatan dan pengembangan kapasitas aparatur.",
    image:
      "https://ppkasn.setneg.go.id/wp-content/uploads/elementor/thumbs/3-ri92ebbc6mpwk42od537xkrr1nqkbe5za7vkccaonw.png",
    link: "https://pintar.setneg.go.id/",
    isExternal: true,
    tag: "LMS Kediklatan",
    status: "Aktif",
  },
  {
    name: "SARPRAS",
    fullName: "SARPRAS PPKASN",
    description: "Sistem reservasi ruang rapat, aula, kelas diklat, dan wisma asrama secara real-time.",
    isBookingLogo: true,
    link: "/meeting-room",
    isExternal: false,
    tag: "Reservasi Fasilitas",
    status: "Portal Ini",
  },
];

export function LandingSpbe() {
  return (
    <section className="py-12 sm:py-14 md:py-16 bg-white dark:bg-[#0d0d0d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 sm:mb-10">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
              Ekosistem Digital
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight leading-loose">
              Aplikasi SPBE
            </h2>
          </div>
        </div>

        {/* Mobbin App Directory Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
          {APPS.map((app) => {
            const cardClasses =
              "group flex flex-col justify-between rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-[#141414] p-6 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-300 shadow-none";

            const cardContent = (
              <>
                <div>
                  {/* App Icon Mockup */}
                  <div className="size-14 rounded-2xl bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200/60 dark:border-neutral-700/60 p-2 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300">
                    {app.isBookingLogo ? (
                      <div className="size-full rounded-xl bg-gradient-to-tr from-[#FF385C] to-rose-500 flex items-center justify-center text-white shadow-none">
                        <Building2 className="size-5.5 stroke-[2.3]" />
                      </div>
                    ) : (
                      <img
                        src={app.image}
                        alt={app.name}
                        className="max-h-full max-w-full object-contain p-0.5"
                      />
                    )}
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-bold text-base text-neutral-950 dark:text-white group-hover:opacity-80 transition-opacity leading-loose">
                    {app.fullName}
                  </h3>
                  <p className="text-xs sm:text-[13px] text-neutral-500 dark:text-neutral-400 mt-2.5 leading-loose">
                    {app.description}
                  </p>
                </div>

                {/* Bottom Action */}
                <div className="pt-4 mt-6 border-t border-neutral-100 dark:border-neutral-800/60 flex items-center justify-between text-xs font-semibold text-neutral-950 dark:text-white">
                  <span>Buka Portal</span>
                  <ArrowRight className="size-3.5 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </>
            );

            return app.isExternal ? (
              <a
                key={app.name}
                href={app.link}
                target="_blank"
                rel="noopener noreferrer"
                className={cardClasses}
              >
                {cardContent}
              </a>
            ) : (
              <Link key={app.name} href={app.link} className={cardClasses}>
                {cardContent}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
