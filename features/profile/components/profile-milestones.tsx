import React from "react";
import { History, Milestone as MilestoneIcon } from "lucide-react";
import { MILESTONES } from "../data/profile-data";

export function ProfileMilestones() {
  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200/80 dark:border-neutral-700 mb-3">
            <History className="size-3.5" />
            <span>Kilas Transformasi</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
            Perjalanan dan Tonggak Sejarah
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-2xl leading-relaxed">
            Perjalanan panjang PPKASN dari unit pelatihan konvensional menjadi pusat keunggulan pengembangan kompetensi aparatur terdepan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {MILESTONES.map((item, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800/80 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase">
                    {item.year}
                  </span>
                  <MilestoneIcon className="size-4 text-neutral-400" />
                </div>
                <h3 className="text-base font-bold text-neutral-950 dark:text-white mb-2 leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
