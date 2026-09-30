import React from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PROFILE_FACILITIES } from "../data/profile-data";

export function ProfileFacilities() {
  return (
    <section className="py-12 sm:py-16 border-b border-neutral-200/80 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
              Kampus Gaharu Cilandak
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
              Fasilitas Pembelajaran &amp; Sarana Kediklatan
            </h2>
          </div>
          <Button
            asChild
            variant="outline"
            className="rounded-full text-xs font-semibold gap-1.5 self-start sm:self-auto border-neutral-200 dark:border-neutral-800"
          >
            <Link href="/booking">
              <span>Reservasi Sarana</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>

        {/* Facilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROFILE_FACILITIES.map((facility) => (
            <div
              key={facility.id}
              className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-[#141414] overflow-hidden flex flex-col justify-between hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors shadow-none"
            >
              <div>
                <div className="relative aspect-[16/10] bg-neutral-100 dark:bg-neutral-900 overflow-hidden">
                  <img
                    src={facility.image}
                    alt={facility.name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.includes("empty-rooms.webp")) {
                        target.src = "/empty-rooms.webp";
                      }
                    }}
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-neutral-900 text-white">
                    {facility.category}
                  </div>
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border border-neutral-200/80 dark:border-neutral-700 shadow-none">
                    {facility.capacity}
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-base font-bold text-neutral-950 dark:text-white mb-2">
                    {facility.name}
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                    {facility.description}
                  </p>

                  <div className="space-y-1.5 pt-3 border-t border-neutral-100 dark:border-neutral-800/70">
                    {facility.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
                        <Check className="size-3 text-emerald-500 shrink-0" />
                        <span className="truncate">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="w-full justify-between rounded-xl text-xs font-semibold text-primary hover:text-primary/80 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 p-2.5 h-auto"
                >
                  <Link href="/booking">
                    <span>Lihat Jadwal &amp; Peminjaman</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
