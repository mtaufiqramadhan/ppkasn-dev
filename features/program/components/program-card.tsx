"use client";

import React from "react";
import Link from "next/link";
import { ProgramItem } from "../types";
import { Button } from "@/components/ui/button";

export interface ProgramCardProps {
  program: ProgramItem;
  onRegister: (program: ProgramItem) => void;
}

export function ProgramCard({ program, onRegister }: ProgramCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#141414] p-5 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors">
      <div>
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
          className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4 line-clamp-2 font-normal"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {program.shortDescription}
        </p>

        {/* Informasi Ringkas: Jadwal Pelaksanaan, Batas Pendaftaran, Kuota */}
        <div className="space-y-1.5 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 text-xs text-neutral-600 dark:text-neutral-400 mb-4">
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
      </div>

      {/* Aksi: Tautan Detail & Tombol Daftar */}
      <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
        <Link
          href={`/program/${program.slug}`}
          className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-primary transition-colors py-1"
        >
          Lihat Detail →
        </Link>

        <Button
          type="button"
          size="sm"
          onClick={() => onRegister(program)}
          disabled={program.status === "penuh" || program.status === "selesai"}
          className={`rounded-lg text-xs font-medium h-8 px-3 shadow-none ${
            program.status === "penuh" || program.status === "selesai"
              ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed"
              : "bg-primary hover:bg-primary/90 text-white"
          }`}
        >
          Daftar
        </Button>
      </div>
    </div>
  );
}
