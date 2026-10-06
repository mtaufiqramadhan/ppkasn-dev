"use client";

import React, { useState, useEffect } from "react";
import { VISION_MISSION } from "../data/profile-data";
import { ProfileService } from "../services/profile-service";
import type { ProfileVisionMission as VMType } from "../types";

export function ProfileVisionMission() {
  const [data, setData] = useState<VMType>(VISION_MISSION);

  useEffect(() => {
    // Uses static data
  }, []);

  return (
    <section className="py-12 sm:py-16 border-b border-neutral-200/80 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 sm:mb-10">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
            Arah &amp; Komitmen Kelembagaan
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight leading-tight">
            Visi dan Misi PPKASN
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-7 items-stretch">
          {/* Visi Card */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-[#141414] p-6 sm:p-8 shadow-none">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-3">
                Visi Kelembagaan
              </span>
              <blockquote className="text-lg sm:text-xl font-bold text-neutral-950 dark:text-white leading-relaxed">
                &ldquo;{data.vision}&rdquo;
              </blockquote>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-4 leading-relaxed">
                Menjadi pilar strategis dalam mewujudkan birokrasi berdaya saing global dan berintegritas tinggi.
              </p>
            </div>

            <div className="pt-4 mt-6 border-t border-neutral-100 dark:border-neutral-800/80 text-xs text-neutral-400">
              Kementerian Sekretariat Negara RI
            </div>
          </div>

          {/* Misi Card */}
          <div className="lg:col-span-7 flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-[#141414] p-6 sm:p-8 shadow-none">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-3">
                Misi Strategis
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-neutral-950 dark:text-white mb-5 leading-tight">
                Empat Pilar Aksi Kediklatan
              </h3>

              <div className="space-y-3.5">
                {data.missions.map((mission, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <span className="font-mono text-xs font-bold text-neutral-400 dark:text-neutral-500 pt-0.5 w-5 shrink-0">
                      0{index + 1}.
                    </span>
                    <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                      {mission}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 mt-6 border-t border-neutral-100 dark:border-neutral-800/80 text-xs text-neutral-400">
              Pusat Pengembangan Kompetensi Aparatur Sipil Negara
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
