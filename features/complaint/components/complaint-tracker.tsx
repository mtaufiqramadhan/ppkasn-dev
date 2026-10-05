"use client";

import React, { useState } from "react";
import {
  Search,
  CheckCircle2,
  FileSearch,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SAMPLE_TICKETS } from "../data/mock-tickets";
import type { ComplaintTicket, ComplaintStatus } from "../types";

const STATUS_STEPS: { key: ComplaintStatus; label: string; desc: string }[] = [
  { key: "TERKIRIM", label: "Terkirim", desc: "Laporan diterima oleh sistem" },
  { key: "DIVERIFIKASI", label: "Diverifikasi", desc: "Penelaahan substansi & bukti awal" },
  { key: "SEDANG_DITINDAKLANJUTI", label: "Ditindaklanjuti", desc: "Koordinasi unit teknis & penanganan" },
  { key: "SELESAI", label: "Selesai", desc: "Hasil tindak lanjut disampaikan" },
];

function getStatusIndex(status: ComplaintStatus): number {
  switch (status) {
    case "TERKIRIM":
      return 0;
    case "DIVERIFIKASI":
      return 1;
    case "SEDANG_DITINDAKLANJUTI":
      return 2;
    case "SELESAI":
      return 3;
    default:
      return 0;
  }
}

export function ComplaintTracker() {
  const [ticketQuery, setTicketQuery] = useState("");
  const [searchedTicket, setSearchedTicket] = useState<ComplaintTicket | null>(SAMPLE_TICKETS[0]);
  const [hasSearched, setHasSearched] = useState(true);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = ticketQuery.trim().toUpperCase();
    if (!clean) return;

    const found = SAMPLE_TICKETS.find((t) => t.ticketNumber.toUpperCase() === clean);
    setSearchedTicket(found || null);
    setHasSearched(true);
  };

  const selectSample = (t: ComplaintTicket) => {
    setTicketQuery(t.ticketNumber);
    setSearchedTicket(t);
    setHasSearched(true);
  };

  const currentStep = searchedTicket ? getStatusIndex(searchedTicket.status) : 0;

  return (
    <div className="bg-white dark:bg-[#141414] rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-6 sm:p-8 shadow-none">
      <div className="mb-6 pb-6 border-b border-neutral-100 dark:border-neutral-800">
        <h2 className="text-xl sm:text-2xl font-bold text-neutral-950 dark:text-white">
          Lacak Status Penanganan Laporan
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Masukkan kode tiket laporan yang Anda terima saat mengirimkan pengaduan.
        </p>

        {/* Search input form */}
        <form onSubmit={handleSearch} className="flex gap-2.5 mt-5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
            <Input
              type="text"
              value={ticketQuery}
              onChange={(e) => setTicketQuery(e.target.value)}
              placeholder="Contoh: PPK-2026-0842"
              className="pl-10 h-11 rounded-xl text-xs sm:text-sm border-neutral-200 dark:border-neutral-800 font-mono uppercase"
            />
          </div>
          <Button
            type="submit"
            className="h-11 px-5 rounded-xl text-xs font-semibold bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200 shrink-0 cursor-pointer"
          >
            Lacak
          </Button>
        </form>

        {/* Quick sample chips */}
        <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-neutral-500">
          <span className="text-[11px] text-neutral-400">Contoh Tiket Demo:</span>
          {SAMPLE_TICKETS.map((sample) => (
            <button
              key={sample.ticketNumber}
              type="button"
              onClick={() => selectSample(sample)}
              className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer border border-neutral-200/60 dark:border-neutral-700/60"
            >
              {sample.ticketNumber}
            </button>
          ))}
        </div>
      </div>

      {/* Ticket Details Result */}
      {searchedTicket ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Ticket Header Banner */}
          <div className="p-5 sm:p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-mono font-bold text-neutral-500">
                  {searchedTicket.ticketNumber}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                  {searchedTicket.category}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-neutral-950 dark:text-white">
                {searchedTicket.title}
              </h3>
            </div>

            <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block sm:mb-1">
                Status Saat Ini
              </span>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  searchedTicket.status === "SELESAI"
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                    : searchedTicket.status === "SEDANG_DITINDAKLANJUTI"
                    ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20"
                    : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                }`}
              >
                {searchedTicket.status.replace(/_/g, " ")}
              </span>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="p-5 sm:p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200/80 dark:border-neutral-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-6">
              Progres Penanganan Aduan
            </span>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
              {STATUS_STEPS.map((step, idx) => {
                const isPassed = idx <= currentStep;
                const isCurrent = idx === currentStep;
                return (
                  <div key={step.key} className="flex flex-col items-start space-y-1.5">
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className={`size-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                          isCurrent
                            ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 ring-4 ring-neutral-200 dark:ring-neutral-800"
                            : isPassed
                            ? "bg-emerald-600 text-white dark:bg-emerald-500"
                            : "bg-neutral-200 dark:bg-neutral-800 text-neutral-400"
                        }`}
                      >
                        {isPassed && !isCurrent ? (
                          <CheckCircle2 className="size-4" />
                        ) : (
                          idx + 1
                        )}
                      </div>
                      <span
                        className={`text-xs font-bold ${
                          isPassed
                            ? "text-neutral-900 dark:text-white"
                            : "text-neutral-400"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-snug">
                      {step.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Response / Tindak Lanjut Card */}
          {searchedTicket.statusNotes && (
            <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/60">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 block">
                    Catatan Resmi Tindak Lanjut:
                  </span>
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    {searchedTicket.statusNotes}
                  </p>
                  {searchedTicket.updatedAt && (
                    <span className="text-[10px] text-neutral-400 block pt-1">
                      Pembaruan terakhir: {searchedTicket.updatedAt}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Summary Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800/60 space-y-1">
              <span className="text-neutral-400 block">Identitas Pelapor:</span>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                {searchedTicket.isAnonymous ? "Anonim (Dirahasiakan)" : searchedTicket.reporterName}
              </span>
              {searchedTicket.agency && (
                <span className="text-neutral-500 block">{searchedTicket.agency}</span>
              )}
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800/60 space-y-1">
              <span className="text-neutral-400 block">Waktu Pengiriman:</span>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                {searchedTicket.submittedAt}
              </span>
              <span className="text-neutral-500 block">PPKASN Kemensetneg</span>
            </div>
          </div>
        </div>
      ) : hasSearched ? (
        <div className="py-12 text-center rounded-2xl bg-neutral-50 dark:bg-neutral-900/40 border border-dashed border-neutral-200 dark:border-neutral-800">
          <FileSearch className="size-10 text-neutral-400 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
            Nomor Tiket Tidak Ditemukan
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto mt-1">
            Pastikan format nomor tiket sudah sesuai (contoh: <code className="font-mono font-bold">PPK-2026-0842</code>). Jika baru saja mengirimkan laporan, tunggu 1-2 menit hingga sistem memverifikasi data.
          </p>
        </div>
      ) : null}
    </div>
  );
}
