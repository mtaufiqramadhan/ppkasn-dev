import React from "react";
import { PROFILE_INFO } from "../data/profile-data";

export function ProfileHero() {
  return (
    <section className="relative pt-8 sm:pt-12 pb-8 sm:pb-12 border-b border-neutral-200/80 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title & Organization Info */}
        <div className="max-w-4xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-2">
            Profil Lembaga
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-neutral-950 dark:text-white tracking-tight leading-tight">
            Membangun Kapasitas Aparatur, Menopang Kepemimpinan Kenegaraan
          </h1>
          <p className="mt-4 sm:mt-5 text-sm sm:text-base md:text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed">
            {PROFILE_INFO.summary}
          </p>
        </div>
      </div>
    </section>
  );
}
