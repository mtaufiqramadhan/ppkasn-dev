"use client";

import React from "react";
import { ComplaintHero } from "./complaint-hero";
import { ComplaintChannels } from "./complaint-channels";

export function ComplaintView() {
  return (
    <div className="w-full leading-loose">
      <ComplaintHero />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Official Banner Image */}
        <div className="rounded-2xl sm:rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-[#141414] overflow-hidden shadow-none mb-8 sm:mb-12">
          <img
            src="/images/pengaduan-banner.webp"
            alt="Banner Layanan Pengaduan PPKASN Kemensetneg"
            className="w-full h-auto block"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/images/pengaduan-banner.jpeg";
            }}
          />
        </div>

        {/* Official Channels & Infographic */}
        <ComplaintChannels />
      </div>
    </div>
  );
}
