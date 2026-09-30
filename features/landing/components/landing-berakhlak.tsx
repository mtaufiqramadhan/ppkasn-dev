"use client";

import React from "react";

export function LandingBerakhlak() {
  return (
    <section className="py-12 sm:py-14 md:py-16 bg-white dark:bg-[#0d0d0d]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 sm:space-y-5">
        <div className="flex justify-center">
          <img
            src="/images/logo-berakhlak.webp"
            alt="Logo BerAKHLAK"
            className="h-14 sm:h-20 w-auto object-contain"
          />
        </div>
        <div className="flex justify-center">
          <img
            src="/images/berakhlak-caption.webp"
            alt="Berorientasi Pelayanan, Akuntabel, Kompeten, Harmonis, Loyal, Adaptif, Kolaboratif"
            className="h-5 sm:h-7 w-auto object-contain opacity-85 dark:opacity-95 dark:brightness-0 dark:invert"
          />
        </div>
      </div>
    </section>
  );
}
