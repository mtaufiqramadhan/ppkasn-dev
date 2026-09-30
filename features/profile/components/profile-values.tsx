import React from "react";
import { Sparkles, Check } from "lucide-react";
import { CORE_VALUES } from "../data/profile-data";

export function ProfileValues() {
  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 mb-3">
              <Sparkles className="size-3.5" />
              <span>Core Values ASN</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
              Budaya Kerja BerAKHLAK
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-md leading-relaxed">
            Fondasi moral dan etika profesi yang menjadi kompas dalam setiap penyelenggaraan pelatihan serta pelayanan di PPKASN Kemensetneg.
          </p>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {CORE_VALUES.map((val) => (
            <div
              key={val.keyword}
              className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#141414] border border-neutral-200/80 dark:border-neutral-800/80 flex flex-col justify-between hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors shadow-none"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="size-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-extrabold text-sm flex items-center justify-center border border-neutral-200/60 dark:border-neutral-700/60">
                    {val.acronym}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    Nilai Dasar
                  </span>
                </div>

                <h3 className="text-base font-bold text-neutral-950 dark:text-white mb-1.5">
                  {val.keyword}
                </h3>
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-3 line-clamp-1">
                  {val.tagline}
                </p>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                  {val.description}
                </p>
              </div>

              {/* Behavior Checklist */}
              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/70 space-y-1.5">
                {val.behaviors.map((b, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
                    <Check className="size-3 text-emerald-500 shrink-0" />
                    <span className="truncate">{b}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
