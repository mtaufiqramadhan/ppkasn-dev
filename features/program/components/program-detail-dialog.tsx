"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  FileCheck,
  Award,
  Mail,
  Phone,
  User,
  ArrowRight,
} from "lucide-react";
import { ProgramItem } from "../types";

export interface ProgramDetailDialogProps {
  program: ProgramItem | null;
  isOpen: boolean;
  onClose: () => void;
  onRegister: (program: ProgramItem) => void;
}

export function ProgramDetailDialog({
  program,
  isOpen,
  onClose,
  onRegister,
}: ProgramDetailDialogProps) {
  const [activeTab, setActiveTab] = useState<string>("overview");

  if (!program) return null;

  const isLuarNegeri = program.type === "luar-negeri";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141517] overflow-hidden shadow-xl">
        {/* Modal Header */}
        <div className="p-6 bg-neutral-50 dark:bg-neutral-900/60 border-b border-neutral-200/80 dark:border-neutral-800 shrink-0">
          <div className="flex items-center justify-between gap-2 mb-2 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-primary">
                {isLuarNegeri ? "Pelatihan Luar Negeri" : "Pelatihan Diklat ASN"}
              </span>
              <span className="text-neutral-400">•</span>
              <span className="text-neutral-600 dark:text-neutral-400">
                {isLuarNegeri ? `${program.countryFlag ?? ""} ${program.country ?? ""}` : program.category}
              </span>
            </div>

            <div>
              {program.status === "buka" && (
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  Pendaftaran Buka
                </span>
              )}
              {program.status === "segera" && (
                <span className="font-medium text-amber-600 dark:text-amber-400">
                  Segera Dibuka
                </span>
              )}
              {program.status === "penuh" && (
                <span className="font-medium text-neutral-400">
                  Kuota Penuh
                </span>
              )}
            </div>
          </div>

          <DialogTitle className="text-lg sm:text-xl font-bold text-neutral-950 dark:text-white leading-snug mb-1">
            {program.title}
          </DialogTitle>

          <DialogDescription className="text-xs text-neutral-500 dark:text-neutral-400">
            Penyelenggara: {program.organizer}
          </DialogDescription>
        </div>

        {/* Modal Body with Tab Navigation */}
        <div className="flex-1 overflow-hidden flex flex-col p-6">
          <Tabs
            defaultValue="overview"
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* Tabs List */}
            <TabsList className="grid grid-cols-4 w-full h-10 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-xl mb-5 shrink-0">
              <TabsTrigger
                value="overview"
                className="rounded-lg text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800 data-[state=active]:text-neutral-950 dark:data-[state=active]:text-white data-[state=active]:shadow-sm"
              >
                Silabus
              </TabsTrigger>
              <TabsTrigger
                value="requirements"
                className="rounded-lg text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800 data-[state=active]:text-neutral-950 dark:data-[state=active]:text-white data-[state=active]:shadow-sm"
              >
                Persyaratan
              </TabsTrigger>
              <TabsTrigger
                value="facilities"
                className="rounded-lg text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800 data-[state=active]:text-neutral-950 dark:data-[state=active]:text-white data-[state=active]:shadow-sm"
              >
                Fasilitas &amp; Biaya
              </TabsTrigger>
              <TabsTrigger
                value="schedule"
                className="rounded-lg text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800 data-[state=active]:text-neutral-950 dark:data-[state=active]:text-white data-[state=active]:shadow-sm"
              >
                Jadwal &amp; Kontak
              </TabsTrigger>
            </TabsList>

            {/* Scrollable Tab Content */}
            <ScrollArea className="flex-1 pr-3">
              {/* TAB 1: OVERVIEW & CURRICULUM */}
              <TabsContent value="overview" className="space-y-5 mt-0">
                {/* Meta Summary Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200/80 dark:border-neutral-800 text-xs">
                  <div>
                    <span className="text-neutral-400 block">Durasi</span>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {program.duration}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block">Jam Pelajaran</span>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {program.hours} JP
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block">Metode</span>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {program.method}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block">Kuota</span>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {program.quota} Peserta
                    </span>
                  </div>
                </div>

                {/* Deskripsi */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Deskripsi Program
                  </h4>
                  <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    {program.fullDescription}
                  </p>
                </div>

                {/* Sasaran Peserta */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Sasaran Peserta
                  </h4>
                  <p className="text-xs sm:text-sm text-neutral-800 dark:text-neutral-200">
                    {program.targetAudience}
                  </p>
                </div>

                {/* Tujuan */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                    Tujuan Pembelajaran
                  </h4>
                  <ul className="space-y-1.5">
                    {program.objectives.map((obj, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
                        <span className="text-primary font-bold">•</span>
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Kurikulum */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2.5">
                    Kurikulum Modul
                  </h4>
                  <div className="space-y-2.5">
                    {program.curriculum.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/30"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h5 className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                            {item.title}
                          </h5>
                          {item.duration && (
                            <span className="text-[11px] text-neutral-400 font-mono">
                              {item.duration}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* TAB 2: REQUIREMENTS */}
              <TabsContent value="requirements" className="space-y-4 mt-0">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                    Persyaratan Peserta
                  </h4>
                  <div className="space-y-2">
                    {program.requirements.map((req, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/30 border border-neutral-200/70 dark:border-neutral-800 text-xs sm:text-sm text-neutral-800 dark:text-neutral-200"
                      >
                        <span className="text-primary font-bold text-xs mt-0.5">{idx + 1}.</span>
                        <span className="leading-relaxed">{req}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {isLuarNegeri && (
                  <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 text-xs space-y-1">
                    <p className="font-semibold text-neutral-900 dark:text-white">
                      Ketentuan Khusus Pelatihan Luar Negeri:
                    </p>
                    <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      Wajib melampirkan sertifikat TOEFL/IELTS aktif. Paspor dinas dan Exit Permit akan difasilitasi oleh Biro KSLN Kemensetneg bagi peserta yang lolos seleksi.
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* TAB 3: FACILITIES */}
              <TabsContent value="facilities" className="space-y-4 mt-0">
                <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 text-xs">
                  <span className="font-semibold text-neutral-900 dark:text-white block mb-0.5">
                    Skema Pembiayaan:
                  </span>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {program.fundingScheme}. Peserta tidak dipungut biaya pendaftaran.
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                    Fasilitas Yang Diberikan
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {program.facilities.map((fac, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-neutral-200/70 dark:border-neutral-800 text-xs text-neutral-800 dark:text-neutral-200 flex items-start gap-2"
                      >
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{fac}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* TAB 4: SCHEDULE & CONTACT */}
              <TabsContent value="schedule" className="space-y-4 mt-0">
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-200/80 dark:border-neutral-800">
                    <span className="text-neutral-500">Batas Pendaftaran Berkas</span>
                    <span className="font-semibold text-rose-600 dark:text-rose-400">
                      {program.registrationDeadline}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-200/80 dark:border-neutral-800">
                    <span className="text-neutral-500">Waktu Pelaksanaan</span>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {program.startDate} s/d {program.endDate}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-200/80 dark:border-neutral-800">
                    <span className="text-neutral-500">Lokasi / Penyelenggaraan</span>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100 text-right">
                      {program.location}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                    Narahubung Resmi
                  </h4>
                  <div className="p-3.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 text-xs space-y-1.5">
                    <p className="font-bold text-neutral-900 dark:text-neutral-100">
                      {program.contactPerson.name}
                    </p>
                    <p className="text-neutral-500">{program.contactPerson.role}</p>
                    <div className="pt-1 flex flex-wrap gap-4 text-neutral-600 dark:text-neutral-400">
                      <span>Email: {program.contactPerson.email}</span>
                      <span>WhatsApp: {program.contactPerson.phone}</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-neutral-50 dark:bg-neutral-900/80 border-t border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between gap-3 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-lg h-9 text-xs font-medium border-neutral-300 dark:border-neutral-700"
          >
            Tutup
          </Button>

          <Button
            type="button"
            onClick={() => {
              onClose();
              onRegister(program);
            }}
            disabled={program.status === "penuh" || program.status === "selesai"}
            className={`rounded-lg h-9 px-4 text-xs font-medium shadow-none flex items-center gap-1.5 ${
              program.status === "penuh" || program.status === "selesai"
                ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed"
                : "bg-primary hover:bg-primary/90 text-white"
            }`}
          >
            <span>Daftar Pelatihan</span>
            <ArrowRight className="size-3.5" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
