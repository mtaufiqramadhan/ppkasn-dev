import React from "react";

export interface ComplaintHeroProps {
  title?: string;
  description?: string;
}

export function ComplaintHero({
  title = "Layanan Pengaduan",
  description = "Selamat datang di laman Pengaduan Kami. Kami berkomitmen untuk memberikan pelayanan terbaik bagi masyarakat. Oleh karena itu, kami menyediakan beberapa saluran pengaduan untuk memudahkan Anda menyampaikan saran, keluhan, atau melaporkan permasalahan yang Anda temui. Layanan ini terbuka untuk umum dan kami menjamin kerahasiaan identitas pelapor.",
}: ComplaintHeroProps) {
  return (
    <div className="mb-8 sm:mb-12 pb-6 border-b border-neutral-200/80 dark:border-neutral-800">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight leading-tight">
        {title}
      </h1>
      <p className="mt-2 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-loose">
        {description}
      </p>
    </div>
  );
}
