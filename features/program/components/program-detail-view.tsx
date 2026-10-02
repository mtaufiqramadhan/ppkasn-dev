"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProgramItem } from "../types";
import { ProgramRegistrationForm } from "./program-registration-form";

export interface ProgramDetailViewProps {
  program: ProgramItem;
  allPrograms: ProgramItem[];
}

export function ProgramDetailView({ program }: ProgramDetailViewProps) {
  const isLuarNegeri = program.type === "luar-negeri";

  const handleScrollToForm = () => {
    const el = document.getElementById("form-pendaftaran");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      const firstInput = el.querySelector("input") as HTMLInputElement | null;
      firstInput?.focus();
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash === "#form-pendaftaran" || hash === "#pendaftaran" || hash === "#daftar") {
        setTimeout(() => {
          handleScrollToForm();
        }, 150);
      }
    }
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-16">
      {/* Navigasi Kembali */}
      <div className="mb-6">
        <Link
          href="/program"
          className="inline-flex items-center gap-2 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>Kembali ke Program Pelatihan</span>
        </Link>
      </div>

      {/* Header Halaman: Cukup Judul Saja */}
      <div className="mb-8 pb-6 border-b border-neutral-200/80 dark:border-neutral-800">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight leading-tight">
          {program.title}
        </h1>
      </div>

      {/* 1. Card Informasi Pelaksanaan (Posisi & Konten Tetap) */}
      <div className="rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-[#141414] p-6 sm:p-8 mb-8 shadow-none">
        <div className="pb-5 mb-5 border-b border-neutral-100 dark:border-neutral-800/80">
          <h2 className="text-base sm:text-lg font-bold text-neutral-950 dark:text-white leading-snug">
            Informasi Pelaksanaan
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Jadwal, batas pendaftaran, dan ketentuan kepesertaan
          </p>
        </div>

        {/* Rincian Parameter Pelatihan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-xs sm:text-sm">
          <div>
            <span className="text-neutral-500 dark:text-neutral-400 block text-xs mb-1">Penyelenggara</span>
            <p className="font-semibold text-neutral-900 dark:text-white">
              {program.organizer}
            </p>
          </div>

          <div>
            <span className="text-neutral-500 dark:text-neutral-400 block text-xs mb-1">Kategori / Jenis</span>
            <p className="font-semibold text-neutral-900 dark:text-white">
              {isLuarNegeri ? `Pelatihan Luar Negeri (${program.country ?? "Internasional"})` : "Pelatihan Diklat ASN"}
              {" • "}
              {program.category}
            </p>
          </div>

          <div>
            <span className="text-neutral-500 dark:text-neutral-400 block text-xs mb-1">Angkatan / Batch</span>
            <p className="font-semibold text-neutral-900 dark:text-white font-mono">
              {program.batch}
            </p>
          </div>

          <div>
            <span className="text-neutral-500 dark:text-neutral-400 block text-xs mb-1">Jadwal Pelaksanaan</span>
            <p className="font-semibold text-neutral-900 dark:text-white">
              {program.startDate} – {program.endDate}
            </p>
          </div>

          <div>
            <span className="text-neutral-500 dark:text-neutral-400 block text-xs mb-1">Batas Pendaftaran</span>
            <p className="font-semibold text-neutral-900 dark:text-white">
              {program.registrationDeadline}
            </p>
          </div>

          {program.quota > 0 && (
            <div>
              <span className="text-neutral-500 dark:text-neutral-400 block text-xs mb-1">Kuota Peserta</span>
              <p className="font-semibold text-neutral-900 dark:text-white">
                {program.quota} Peserta
              </p>
            </div>
          )}
        </div>

        {/* Narahubung */}
        <div className="pt-5 mt-5 border-t border-neutral-100 dark:border-neutral-800/80 text-xs sm:text-sm">
          <span className="text-neutral-500 dark:text-neutral-400 block text-xs mb-1">Narahubung</span>
          <p className="text-neutral-700 dark:text-neutral-300 leading-loose">
            <strong className="font-semibold text-neutral-900 dark:text-white">{program.contactPerson.name}</strong> ({program.contactPerson.role})
          </p>
          <p className="text-neutral-500 text-xs mt-1 leading-loose">
            Email: <a href={`mailto:${program.contactPerson.email}`} className="text-neutral-700 dark:text-neutral-300 hover:text-primary underline">{program.contactPerson.email}</a> • Telepon: <a href={`https://wa.me/${program.contactPerson.phone.replace(/[^0-9]/g, "")}`} className="text-neutral-700 dark:text-neutral-300 hover:text-primary">{program.contactPerson.phone}</a>
          </p>
        </div>
      </div>

      {/* Grid 2 Kolom: Kiri Detail Informasi Pelatihan, Kanan Formulir Pendaftaran */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* KOLOM KIRI: DETAIL INFORMASI PELATIHAN */}
        <div className="lg:col-span-7 space-y-8">
          {/* 2. Card Deskripsi & Tujuan Pembelajaran */}
          <div className="rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-[#141414] p-6 sm:p-8 shadow-none space-y-6">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-neutral-950 dark:text-white leading-snug mb-3">
                Tentang Program Pelatihan
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-loose font-normal">
                {program.fullDescription}
              </p>
            </div>

            {program.objectives && program.objectives.length > 0 && (
              <div className="pt-5 border-t border-neutral-100 dark:border-neutral-800/80">
                <h3 className="text-sm font-bold text-neutral-950 dark:text-white leading-snug mb-3">
                  Tujuan &amp; Manfaat Pembelajaran
                </h3>
                <ul className="space-y-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 list-disc list-outside pl-4 leading-loose">
                  {program.objectives.map((obj, i) => (
                    <li key={i}>{obj}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* 3. Card Kurikulum & Silabus Modul */}
          {program.curriculum && program.curriculum.length > 0 && (
            <div className="rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-[#141414] p-6 sm:p-8 shadow-none">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-100 dark:border-neutral-800/80">
                <h2 className="text-base sm:text-lg font-bold text-neutral-950 dark:text-white leading-snug">
                  Kurikulum &amp; Silabus
                </h2>
                <span className="text-xs font-mono text-neutral-500">
                  Total {program.hours} JP
                </span>
              </div>

              <div className="space-y-4">
                {program.curriculum.map((mod, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/30"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1">
                      <h3 className="text-xs sm:text-sm font-bold text-neutral-950 dark:text-white">
                        {mod.title}
                      </h3>
                      {mod.duration && (
                        <span className="text-xs font-mono text-neutral-500 shrink-0">
                          {mod.duration}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-loose">
                      {mod.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Card Persyaratan Berkas Pendaftaran */}
          {program.requirements && program.requirements.length > 0 && (
            <div className="rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-[#141414] p-6 sm:p-8 shadow-none">
              <h2 className="text-base sm:text-lg font-bold text-neutral-950 dark:text-white leading-snug pb-4 mb-4 border-b border-neutral-100 dark:border-neutral-800/80">
                Persyaratan Berkas Pendaftaran
              </h2>

              <ol className="space-y-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 list-decimal list-outside pl-4 leading-loose">
                {program.requirements.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ol>

              {isLuarNegeri && (
                <div className="mt-5 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/50 text-xs text-neutral-600 dark:text-neutral-400 leading-loose">
                  <strong className="text-neutral-900 dark:text-neutral-200">Catatan Pelatihan Luar Negeri:</strong> Pengurusan paspor dinas biru, Exit Permit Kemensetneg, dan visa difasilitasi oleh Biro Kerja Sama Luar Negeri (KSLN) Kemensetneg bagi calon peserta yang lolos seleksi.
                </div>
              )}
            </div>
          )}
        </div>

        {/* KOLOM KANAN: FORMULIR PENDAFTARAN */}
        <div className="lg:col-span-5" id="form-pendaftaran">
          <ProgramRegistrationForm program={program} />
        </div>
      </div>
    </div>
  );
}
