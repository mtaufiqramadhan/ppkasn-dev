"use client";

import React, { useState, useEffect } from "react";
import { ProfileService } from "../services/profile-service";

export function ProfileOrgStructure() {
  const [data, setData] = useState({
    title: "Struktur Organisasi",
    subtitle: "Pusat Pengembangan Kompetensi Aparatur Sipil Negara Kementerian Sekretariat Negara",
    imageUrl: "/images/struktur-organisasi.webp",
  });

  useEffect(() => {
    ProfileService.getProfileData().then((res) => {
      if (res?.orgStructure) {
        setData(res.orgStructure);
      }
    });
  }, []);

  return (
    <section className="pt-8 sm:pt-12 pb-12 sm:pb-16 border-b border-neutral-200/80 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 sm:mb-12 pb-6 border-b border-neutral-200/80 dark:border-neutral-800">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight leading-tight">
            {data.title}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-loose">
            {data.subtitle}
          </p>
        </div>

        {/* Image Card - Fit Edge-to-Edge to Border */}
        <div className="rounded-2xl sm:rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-[#141414] overflow-hidden shadow-none">
          <img
            src={data.imageUrl}
            alt={data.title}
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
