"use client";

import React, { useRef } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import {
  CheckCircle2,
  Printer,
  FileCheck2,
  ShieldCheck,
} from "lucide-react";
import { RegistrationSubmission } from "../types";

export interface ProgramSuccessTicketProps {
  submission: RegistrationSubmission | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProgramSuccessTicket({
  submission,
  isOpen,
  onClose,
}: ProgramSuccessTicketProps) {
  const ticketRef = useRef<HTMLDivElement>(null);

  if (!submission) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[95vh] p-0 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141517] overflow-hidden flex flex-col shadow-xl">
        {/* Modal Top Notification Bar */}
        <div className="p-5 sm:p-6 bg-emerald-500 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="size-6 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold leading-tight">
                Pendaftaran Berhasil Dikirim!
              </h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                Nomor registrasi resmi Anda telah diterbitkan oleh sistem PPKASN.
              </p>
            </div>
          </div>
        </div>

        {/* Printable Ticket Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          <div
            ref={ticketRef}
            id="printable-ticket"
            className="rounded-2xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50/70 dark:bg-neutral-900/50 p-6 sm:p-8 relative overflow-hidden"
          >
            {/* Header Instansi */}
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-5 mb-6">
              <div className="flex items-center gap-3.5">
                <img
                  src="/setneg-emblem.webp"
                  alt="Logo Kemensetneg"
                  className="h-12 w-auto object-contain"
                />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
                    Kementerian Sekretariat Negara RI
                  </h4>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    Pusat Pengembangan Kompetensi Aparatur Sipil Negara (PPKASN)
                  </p>
                  <p className="text-[10px] text-primary font-mono font-semibold">
                    BUKTI TANDA TERIMA PENDAFTARAN RESMI
                  </p>
                </div>
              </div>

              {/* QR Code Verification */}
              <div className="hidden sm:flex flex-col items-center bg-white p-2 rounded-xl border border-neutral-200 shadow-sm shrink-0">
                <QRCodeSVG
                  value={`https://ppkasn.setneg.go.id/verify/${submission.registrationCode}`}
                  size={68}
                  level="M"
                />
                <span className="text-[9px] font-mono text-neutral-500 mt-1">VERIFIKASI</span>
              </div>
            </div>

            {/* Registration Code Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200/80 dark:border-neutral-800 mb-6">
              <div>
                <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 block mb-0.5">
                  Nomor Registrasi Pendaftaran
                </span>
                <span className="text-xl sm:text-2xl font-black font-mono text-primary tracking-wide">
                  {submission.registrationCode}
                </span>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 block mb-0.5">
                  Waktu Pengajuan Berkas
                </span>
                <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                  {submission.submittedAt}
                </span>
              </div>
            </div>

            {/* Data Detail Pendaftar */}
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/15">
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary block mb-1">
                  Program Pelatihan Yang Dipilih
                </span>
                <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  {submission.programTitle}
                </p>
                <span className="inline-block mt-1 text-[11px] font-medium text-neutral-600 dark:text-neutral-400">
                  Jalur: {submission.programType === "luar-negeri" ? "Pelatihan Luar Negeri & Kerja Sama" : "Pelatihan Kediklatan ASN"}
                </span>
                {submission.subPelatihan && (
                  <div className="mt-2.5 p-2 rounded-lg bg-primary/10 border border-primary/20 text-xs">
                    <span className="text-primary font-semibold block text-[10px] uppercase tracking-wider">
                      Sub Pelatihan / Modul Pilihan:
                    </span>
                    <span className="font-semibold text-foreground">
                      {submission.subPelatihan}
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                <div>
                  <span className="text-neutral-500 dark:text-neutral-400 block text-[11px]">Nama Lengkap</span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
                    {submission.fullName}
                  </span>
                </div>

                <div>
                  <span className="text-neutral-500 dark:text-neutral-400 block text-[11px]">Nomor Induk Pegawai (NIP)</span>
                  <span className="font-mono font-semibold text-neutral-900 dark:text-neutral-100">
                    {submission.nip}
                  </span>
                </div>

                <div>
                  <span className="text-neutral-500 dark:text-neutral-400 block text-[11px]">Nomor WhatsApp</span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {submission.whatsapp || submission.phone}
                  </span>
                </div>

                <div>
                  <span className="text-neutral-500 dark:text-neutral-400 block text-[11px]">Memo Surat Usulan Resmi</span>
                  <span className="font-semibold text-primary inline-flex items-center gap-1.5">
                    <FileCheck2 className="size-3.5 shrink-0" />
                    <span className="truncate max-w-[200px]">{submission.memoFileName || "Surat_Usulan_Resmi.pdf"}</span>
                  </span>
                  {submission.memoNumber && (
                    <span className="text-[10px] text-neutral-500 block font-mono">
                      No: {submission.memoNumber}
                    </span>
                  )}
                </div>
              </div>

              {/* Dokumen Pendukung List */}
              {submission.supportingDocuments && submission.supportingDocuments.length > 0 && (
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-neutral-500 dark:text-neutral-400 block text-[11px] font-medium">
                      Dokumen Pendukung ({submission.supportingDocuments.length} berkas):
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {submission.supportingDocuments.map((doc, idx) => (
                      <span
                        key={doc.id || idx}
                        className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700"
                      >
                        <FileCheck2 className="size-3 text-neutral-500 shrink-0" />
                        <span className="max-w-[200px] truncate">{doc.name}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Seleksi */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 mt-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="text-amber-900 dark:text-amber-200 font-bold">
                    Status Administrasi:
                  </span>
                </div>
                <span className="font-bold text-amber-700 dark:text-amber-300">
                  {submission.status}
                </span>
              </div>
            </div>

            {/* Note & Next Steps */}
            <div className="mt-5 pt-4 border-t border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
              <p>
                <strong>Catatan Penting:</strong> Bukti tanda terima pendaftaran ini diterbitkan secara elektronik dan sah tanpa tanda tangan basah. Mohon simpan bukti ini atau unduh dalam format PDF. Hasil seleksi administrasi dan pemanggilan peserta akan disampaikan melalui email dinas terdaftar.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="p-4 sm:p-6 bg-neutral-50 dark:bg-neutral-900/80 border-t border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between gap-3 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-xl h-11 text-xs sm:text-sm font-semibold border-neutral-200 dark:border-neutral-700"
          >
            Selesai &amp; Tutup
          </Button>

          <Button
            type="button"
            onClick={handlePrint}
            className="rounded-xl h-11 px-5 text-xs sm:text-sm font-semibold bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-100 shadow-none flex items-center gap-2"
          >
            <Printer className="size-4" />
            <span>Cetak / Simpan Bukti (PDF)</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
