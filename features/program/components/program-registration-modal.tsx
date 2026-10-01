"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  UploadCloud,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { ProgramItem, RegistrationSubmission } from "../types";
import {
  programRegistrationSchema,
  ProgramRegistrationFormValues,
  RANK_GRADES,
} from "../schemas/program-schema";
import { ProgramService } from "../services/program-service";

export interface ProgramRegistrationModalProps {
  initialProgram: ProgramItem | null;
  allPrograms: ProgramItem[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (submission: RegistrationSubmission) => void;
}

export function ProgramRegistrationModal({
  initialProgram,
  allPrograms,
  isOpen,
  onClose,
  onSuccess,
}: ProgramRegistrationModalProps) {
  const [selectedProgram, setSelectedProgram] = useState<ProgramItem | null>(initialProgram);
  const [recommendationFileName, setRecommendationFileName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter available programs that are open
  const openPrograms = allPrograms.filter((p) => p.status === "buka");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProgramRegistrationFormValues>({
    resolver: zodResolver(programRegistrationSchema),
    defaultValues: {
      programId: initialProgram?.id ?? "",
      programTitle: initialProgram?.title ?? "",
      programType: initialProgram?.type ?? "diklat",
      fullName: "",
      nip: "",
      institution: "",
      workUnit: "",
      position: "",
      rankGrade: "",
      email: "",
      phone: "",
      englishScore: "",
      motivation: "",
      recommendationFileName: "",
      integrityPact: false,
    },
  });

  // Keep in sync when initialProgram changes
  useEffect(() => {
    if (initialProgram) {
      setSelectedProgram(initialProgram);
      setValue("programId", initialProgram.id);
      setValue("programTitle", initialProgram.title);
      setValue("programType", initialProgram.type);
    } else if (openPrograms.length > 0 && !selectedProgram) {
      setSelectedProgram(openPrograms[0]);
      setValue("programId", openPrograms[0].id);
      setValue("programTitle", openPrograms[0].title);
      setValue("programType", openPrograms[0].type);
    }
  }, [initialProgram, openPrograms, setValue]);

  const handleProgramSelection = (progId: string) => {
    const prog = allPrograms.find((p) => p.id === progId);
    if (prog) {
      setSelectedProgram(prog);
      setValue("programId", prog.id, { shouldValidate: true });
      setValue("programTitle", prog.title, { shouldValidate: true });
      setValue("programType", prog.type, { shouldValidate: true });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRecommendationFileName(file.name);
      setValue("recommendationFileName", file.name);
      toast.info(`Berkas "${file.name}" dilampirkan.`);
    }
  };

  const onSubmit = async (values: ProgramRegistrationFormValues) => {
    try {
      setIsSubmitting(true);
      const submission = await ProgramService.submitRegistration({
        ...values,
        recommendationFileName: recommendationFileName || "Surat_Usulan_Resmi.pdf",
      });

      toast.success("Pendaftaran Pelatihan Berhasil Diajukan!", {
        description: `Nomor Registrasi: ${submission.registrationCode}`,
      });

      reset();
      setRecommendationFileName("");
      onClose();
      onSuccess(submission);
    } catch (err: unknown) {
      toast.error("Gagal mengirim pendaftaran", {
        description: "Silakan periksa kembali data yang diinput.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLuarNegeri = selectedProgram?.type === "luar-negeri";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141517] overflow-hidden shadow-xl">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-neutral-50 dark:bg-neutral-900/60 border-b border-neutral-200/80 dark:border-neutral-800 shrink-0">
          <DialogTitle className="text-lg sm:text-xl font-bold text-neutral-950 dark:text-white leading-tight">
            Form Pendaftaran Pelatihan
          </DialogTitle>
          <DialogDescription className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Isi data kepegawaian dan lampirkan surat usulan resmi untuk seleksi administrasi PPKASN.
          </DialogDescription>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          <form id="registration-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* PROGRAM YANG DIDAFTAR */}
            <div className="p-3.5 rounded-xl border border-neutral-200/90 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40 space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary block">
                Pelatihan Yang Didaftar
              </span>
              <p className="text-sm font-bold text-neutral-950 dark:text-white leading-snug">
                {selectedProgram?.title}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                <span>{selectedProgram?.batch}</span>
                <span>•</span>
                <span>{selectedProgram?.startDate} – {selectedProgram?.endDate}</span>
                <span>•</span>
                <span>Batas: {selectedProgram?.registrationDeadline}</span>
              </div>
            </div>

            {/* 2. DATA DIRI & KEPEGAWAIAN */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 pb-1 border-b border-neutral-200 dark:border-neutral-800">
                1. Identitas Aparatur
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Nama Lengkap */}
                <div className="space-y-1">
                  <Label htmlFor="fullName" className="text-xs font-medium">
                    Nama Lengkap (beserta Gelar) <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    {...register("fullName")}
                    placeholder="Contoh: Budi Santoso, S.STP., M.Si."
                    className="h-9.5 rounded-lg bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-xs sm:text-sm"
                  />
                  {errors.fullName && (
                    <p className="text-xs text-rose-500">{errors.fullName.message}</p>
                  )}
                </div>

                {/* NIP */}
                <div className="space-y-1">
                  <Label htmlFor="nip" className="text-xs font-medium">
                    NIP (18 Digit) <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="nip"
                    maxLength={18}
                    {...register("nip")}
                    placeholder="198904122015031002"
                    className="h-9.5 font-mono rounded-lg bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-xs sm:text-sm"
                  />
                  {errors.nip && (
                    <p className="text-xs text-rose-500">{errors.nip.message}</p>
                  )}
                </div>

                {/* Instansi Asal */}
                <div className="space-y-1">
                  <Label htmlFor="institution" className="text-xs font-medium">
                    Instansi Asal <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="institution"
                    {...register("institution")}
                    placeholder="Kementerian Sekretariat Negara"
                    className="h-9.5 rounded-lg bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-xs sm:text-sm"
                  />
                  {errors.institution && (
                    <p className="text-xs text-rose-500">{errors.institution.message}</p>
                  )}
                </div>

                {/* Unit Kerja / Satker */}
                <div className="space-y-1">
                  <Label htmlFor="workUnit" className="text-xs font-medium">
                    Unit Kerja / Satuan Kerja <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="workUnit"
                    {...register("workUnit")}
                    placeholder="Biro Protokol"
                    className="h-9.5 rounded-lg bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-xs sm:text-sm"
                  />
                  {errors.workUnit && (
                    <p className="text-xs text-rose-500">{errors.workUnit.message}</p>
                  )}
                </div>

                {/* Jabatan */}
                <div className="space-y-1">
                  <Label htmlFor="position" className="text-xs font-medium">
                    Jabatan Saat Ini <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="position"
                    {...register("position")}
                    placeholder="Pranata Humas Ahli Muda"
                    className="h-9.5 rounded-lg bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-xs sm:text-sm"
                  />
                  {errors.position && (
                    <p className="text-xs text-rose-500">{errors.position.message}</p>
                  )}
                </div>

                {/* Pangkat / Golongan */}
                <div className="space-y-1">
                  <Label className="text-xs font-medium">
                    Pangkat / Golongan <span className="text-rose-500">*</span>
                  </Label>
                  <Select
                    value={watch("rankGrade")}
                    onValueChange={(val) => setValue("rankGrade", val, { shouldValidate: true })}
                  >
                    <SelectTrigger className="h-9.5 rounded-lg bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-xs sm:text-sm">
                      <SelectValue placeholder="Pilih Pangkat / Golongan" />
                    </SelectTrigger>
                    <SelectContent className="max-h-56 rounded-xl border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                      {RANK_GRADES.map((rg) => (
                        <SelectItem key={rg} value={rg}>
                          {rg}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.rankGrade && (
                    <p className="text-xs text-rose-500">{errors.rankGrade.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* 3. KONTAK & KUALIFIKASI */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 pb-1 border-b border-neutral-200 dark:border-neutral-800">
                2. Kontak &amp; Kemampuan Bahasa
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Email Dinas */}
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-xs font-medium">
                    Email Kedinasan <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="nama.pegawai@setneg.go.id"
                    className="h-9.5 rounded-lg bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-xs sm:text-sm"
                  />
                  {errors.email && (
                    <p className="text-xs text-rose-500">{errors.email.message}</p>
                  )}
                </div>

                {/* No WhatsApp */}
                <div className="space-y-1">
                  <Label htmlFor="phone" className="text-xs font-medium">
                    Nomor WhatsApp / HP <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    {...register("phone")}
                    placeholder="081234567890"
                    className="h-9.5 rounded-lg bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-xs sm:text-sm"
                  />
                  {errors.phone && (
                    <p className="text-xs text-rose-500">{errors.phone.message}</p>
                  )}
                </div>

                {/* Skor Bahasa Inggris */}
                <div className="sm:col-span-2 space-y-1">
                  <Label htmlFor="englishScore" className="text-xs font-medium">
                    Skor Bahasa Inggris (TOEFL / IELTS) {isLuarNegeri ? <span className="text-rose-500">*</span> : "(Opsional)"}
                  </Label>
                  <Input
                    id="englishScore"
                    {...register("englishScore")}
                    placeholder="Contoh: TOEFL ITP 550 / IELTS 6.5"
                    className="h-9.5 rounded-lg bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-xs sm:text-sm"
                  />
                  {errors.englishScore && (
                    <p className="text-xs text-rose-500">{errors.englishScore.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* 4. BERKAS & MOTIVASI */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 pb-1 border-b border-neutral-200 dark:border-neutral-800">
                3. Berkas &amp; Rencana Pemanfaatan
              </h4>

              {/* Motivasi */}
              <div className="space-y-1">
                <Label htmlFor="motivation" className="text-xs font-medium">
                  Rencana Pemanfaatan Hasil Pelatihan di Instansi <span className="text-rose-500">*</span>
                </Label>
                <Textarea
                  id="motivation"
                  rows={2}
                  {...register("motivation")}
                  placeholder="Uraikan secara singkat bagaimana hasil pelatihan ini akan Anda terapkan pada unit kerja..."
                  className="rounded-lg bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-xs sm:text-sm"
                />
                {errors.motivation && (
                  <p className="text-xs text-rose-500">{errors.motivation.message}</p>
                )}
              </div>

              {/* Upload Berkas Rekomendasi */}
              <div className="space-y-1">
                <Label className="text-xs font-medium">
                  Lampiran Surat Usulan / Rekomendasi Pimpinan (PDF/DOCX)
                </Label>
                <div className="relative border border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl p-3 text-center bg-neutral-50/50 dark:bg-neutral-900/30">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex items-center justify-center gap-2 pointer-events-none text-xs">
                    <UploadCloud className="size-4 text-neutral-400" />
                    {recommendationFileName ? (
                      <span className="font-semibold text-primary">{recommendationFileName}</span>
                    ) : (
                      <span className="text-neutral-500">Pilih berkas dokumen (Maks. 5 MB)</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Pakta Integritas */}
              <div className="pt-2">
                <div className="flex items-start space-x-2.5">
                  <Checkbox
                    id="integrityPact"
                    checked={watch("integrityPact")}
                    onCheckedChange={(checked) =>
                      setValue("integrityPact", checked === true, { shouldValidate: true })
                    }
                    className="mt-0.5"
                  />
                  <label
                    htmlFor="integrityPact"
                    className="text-xs text-neutral-600 dark:text-neutral-400 leading-normal cursor-pointer"
                  >
                    Saya menyatakan data yang saya isi adalah benar dan saya berkomitmen mengikuti seluruh tahapan pelatihan secara penuh waktu.
                  </label>
                </div>
                {errors.integrityPact && (
                  <p className="text-xs text-rose-500 pl-6">{errors.integrityPact.message}</p>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-neutral-50 dark:bg-neutral-900/80 border-t border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between gap-3 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg h-9 text-xs font-medium border-neutral-300 dark:border-neutral-700"
          >
            Batal
          </Button>

          <Button
            type="submit"
            form="registration-form"
            disabled={isSubmitting}
            className="rounded-lg h-9 px-5 text-xs font-medium bg-primary hover:bg-primary/90 text-white shadow-none flex items-center gap-1.5"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Mengirim...</span>
              </>
            ) : (
              <span>Kirim Pendaftaran</span>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
