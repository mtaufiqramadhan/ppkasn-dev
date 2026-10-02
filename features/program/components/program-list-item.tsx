"use client";

import React from "react";
import Link from "next/link";
import { ProgramItem } from "../types";
import { Button } from "@/components/ui/button";

export interface ProgramListItemProps {
  program: ProgramItem;
  onRegister?: (program: ProgramItem) => void;
}

export function ProgramListItem({
  program,
}: ProgramListItemProps) {
  return (
    <div className="p-5 sm:p-6 hover:bg-neutral-50/70 dark:hover:bg-neutral-900/40 transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
        {/* Kolom Kiri: Judul & Deskripsi */}
        <div className="flex-1 min-w-0 pr-0 lg:pr-6">
          {/* Judul Pelatihan (Maksimal 2 baris, elipsize) */}
          <h3
            className="text-base sm:text-lg font-bold text-neutral-950 dark:text-white leading-snug mb-2 line-clamp-2"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            <Link
              href={`/program/${program.slug}`}
              title={program.title}
              className="hover:text-primary transition-colors"
            >
              {program.title}
            </Link>
          </h3>

          {/* Deskripsi (Maksimal 2 baris, elipsize) */}
          <p
            className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-normal line-clamp-2"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {program.shortDescription}
          </p>
        </div>

        {/* Kolom Kanan: Jadwal Pelaksanaan, Batas Pendaftaran, Kuota & Aksi */}
        <div className="flex flex-col sm:flex-row sm:items-center lg:items-end justify-between lg:justify-end gap-4 sm:gap-6 pt-3 lg:pt-0 border-t lg:border-t-0 border-neutral-100 dark:border-neutral-800/80 shrink-0">
          <div className="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-400 sm:text-right">
            <div>
              <span className="text-neutral-400">Jadwal Pelaksanaan: </span>
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                {program.startDate} – {program.endDate}
              </span>
            </div>

            <div>
              <span className="text-neutral-400">Batas Pendaftaran: </span>
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                {program.registrationDeadline}
              </span>
            </div>

            {program.quota > 0 && (
              <div>
                <span className="text-neutral-400">Kuota: </span>
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  {program.quota} Peserta
                </span>
              </div>
            )}
          </div>

          {/* Tombol Aksi */}
          <div className="flex items-center gap-2 pt-1 sm:pt-0">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-8.5 px-3 text-xs font-medium border-neutral-300 dark:border-neutral-700"
            >
              <Link href={`/program/${program.slug}`}>Lihat Detail</Link>
            </Button>

            {program.status === "buka" ? (
              <Button
                asChild
                size="sm"
                className="h-8.5 px-3.5 text-xs font-medium shadow-none bg-primary hover:bg-primary/90 text-white"
              >
                <Link href={`/program/${program.slug}#form-pendaftaran`}>Daftar</Link>
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                disabled
                className="h-8.5 px-3.5 text-xs font-medium shadow-none bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed"
              >
                Daftar
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
