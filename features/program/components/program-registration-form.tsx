"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Upload, FileText, X, Lock, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ProgramItem, RegistrationSubmission, SubPelatihanItem, SupportingDocumentItem } from "../types";
import {
  programRegistrationSchema,
  ProgramRegistrationFormValues,
} from "../schemas/program-schema";
import { ProgramService } from "../services/program-service";
import { ProgramSuccessTicket } from "./program-success-ticket";
import { SubPelatihanSelectDialog } from "./sub-pelatihan-select-dialog";

export interface ProgramRegistrationFormProps {
  program: ProgramItem;
  selectedSubPelatihan?: SubPelatihanItem;
  onSubPelatihanChange?: (subPelatihan: SubPelatihanItem) => void;
}

const MAX_SUPPORTING_DOCS = 10;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_EXTENSIONS = [".pdf", ".jpg", ".jpeg"];

function isValidPdfOrJpg(file: File): boolean {
  const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  const validMimes = ["application/pdf", "image/jpeg", "image/jpg", "image/pjpeg"];
  return ALLOWED_FILE_EXTENSIONS.includes(ext) || validMimes.includes(file.type);
}

function formatFileSize(bytes: number): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

export function ProgramRegistrationForm({
  program,
  selectedSubPelatihan,
  onSubPelatihanChange,
}: ProgramRegistrationFormProps) {
  const isClosed = program.status !== "buka";
  const [isSubmitting, setIsSubmitting] = useState(false);

  // File states
  const [memoFile, setMemoFile] = useState<{ name: string; size: number } | null>(null);
  const [supportingDocs, setSupportingDocs] = useState<SupportingDocumentItem[]>([]);
  const [isDraggingMemo, setIsDraggingMemo] = useState(false);
  const [isDraggingSupporting, setIsDraggingSupporting] = useState(false);

  // Success ticket state
  const [successSubmission, setSuccessSubmission] = useState<RegistrationSubmission | null>(null);
  const [isTicketOpen, setIsTicketOpen] = useState(false);
  const [isSubPelatihanDialogOpen, setIsSubPelatihanDialogOpen] = useState(false);

  const memoInputRef = useRef<HTMLInputElement>(null);
  const supportingInputRef = useRef<HTMLInputElement>(null);

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
      programId: program.id,
      programTitle: program.title,
      programType: program.type,
      fullName: "",
      nip: "",
      subPelatihan: selectedSubPelatihan?.title ?? "",
      subPelatihanId: selectedSubPelatihan?.id ?? "",
      whatsapp: "",
      memoFileName: "",
      memoNumber: "",
      supportingDocuments: [],
      integrityPact: false,
    },
  });

  const nipValue = watch("nip") || "";
  const subPelatihanValue = watch("subPelatihan") || "";
  const integrityPactValue = watch("integrityPact") || false;

  // Sync with selectedSubPelatihan prop
  React.useEffect(() => {
    if (selectedSubPelatihan) {
      setValue("subPelatihan", selectedSubPelatihan.title, { shouldValidate: true });
      setValue("subPelatihanId", selectedSubPelatihan.id, { shouldValidate: true });
    }
  }, [selectedSubPelatihan, setValue]);

  // Sync supportingDocs with react-hook-form
  React.useEffect(() => {
    setValue("supportingDocuments", supportingDocs, { shouldValidate: true });
  }, [supportingDocs, setValue]);

  // Memo file handlers
  const handleMemoSelect = (file: File) => {
    if (!isValidPdfOrJpg(file)) {
      toast.error("Format berkas tidak didukung. Harap unggah file PDF atau JPG saja.");
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error("Ukuran file melebihi batas 10 MB.");
      return;
    }
    setMemoFile({ name: file.name, size: file.size });
    setValue("memoFileName", file.name, { shouldValidate: true });
  };

  const handleRemoveMemo = () => {
    setMemoFile(null);
    setValue("memoFileName", "", { shouldValidate: true });
    if (memoInputRef.current) memoInputRef.current.value = "";
  };

  // Supporting docs handlers (Max 10)
  const handleSupportingSelect = (files: FileList | File[]) => {
    const fileList = Array.from(files);
    if (!fileList.length) return;

    const availableSlots = MAX_SUPPORTING_DOCS - supportingDocs.length;
    if (availableSlots <= 0) {
      toast.warning("Maksimal 10 dokumen pendukung telah tercapai.");
      return;
    }

    const acceptedFiles = fileList.slice(0, availableSlots);
    if (fileList.length > availableSlots) {
      toast.info(`Hanya ${availableSlots} dokumen yang dapat ditambahkan.`);
    }

    const newItems: SupportingDocumentItem[] = [];
    for (const f of acceptedFiles) {
      if (!isValidPdfOrJpg(f)) {
        toast.error(`File "${f.name}" bukan format PDF atau JPG.`);
        continue;
      }
      if (f.size > MAX_FILE_SIZE_BYTES) {
        toast.error(`File "${f.name}" melebihi batas 10 MB.`);
        continue;
      }
      newItems.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: f.name,
        size: f.size,
        type: f.type,
      });
    }

    if (newItems.length > 0) {
      setSupportingDocs((prev) => [...prev, ...newItems]);
    }

    if (supportingInputRef.current) {
      supportingInputRef.current.value = "";
    }
  };

  const handleRemoveSupporting = (id: string) => {
    setSupportingDocs((prev) => prev.filter((item) => item.id !== id));
  };

  // NIP input
  const handleNipInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("nip", e.target.value, { shouldValidate: true });
  };

  const onSubmit = async (values: ProgramRegistrationFormValues) => {
    try {
      setIsSubmitting(true);
      const submission = await ProgramService.submitRegistration({
        ...values,
        memoFileName: memoFile?.name || values.memoFileName,
        supportingDocuments: supportingDocs,
      });

      toast.success("Pendaftaran berhasil dikirim!");
      reset();
      setMemoFile(null);
      setSupportingDocs([]);
      setSuccessSubmission(submission);
      setIsTicketOpen(true);
    } catch {
      toast.error("Gagal mengirim pendaftaran. Periksa kembali isian form Anda.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tampilan saat pendaftaran ditutup
  if (isClosed) {
    return (
      <div className="rounded-2xl sm:rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-[#141414] p-6 sm:p-8 shadow-none text-center">
        <div className="size-12 rounded-2xl sm:rounded-3xl bg-neutral-100 dark:bg-neutral-800/80 flex items-center justify-center mx-auto mb-4 text-neutral-400 dark:text-neutral-500">
          <Lock className="size-5" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-neutral-950 dark:text-white mb-2">
          Pendaftaran Ditutup
        </h3>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-sm mx-auto mb-6">
          Periode pendaftaran untuk program pelatihan ini telah berakhir atau kuota peserta telah terpenuhi.
        </p>
        <Button asChild variant="outline" className="rounded-2xl sm:rounded-3xl text-xs sm:text-sm font-semibold h-10 px-5">
          <Link href="/program">Lihat Program Pelatihan Lainnya</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl sm:rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-[#141414] p-6 sm:p-8 shadow-none">
      {/* Header Form */}
      <div className="flex items-center justify-between pb-5 mb-6 border-b border-neutral-100 dark:border-neutral-800/80">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-neutral-950 dark:text-white leading-snug">
            Formulir Pendaftaran
          </h2>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold shrink-0">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Pendaftaran Dibuka
        </span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* DATA PEGAWAI */}
        <div className="space-y-4">
          {/* Nama Lengkap */}
          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
              Nama Lengkap (beserta Gelar) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fullName"
              {...register("fullName")}
              placeholder="Contoh: Budi Santoso, S.STP., M.Si."
              className="h-10 text-xs sm:text-sm rounded-2xl sm:rounded-3xl border-neutral-200 dark:border-neutral-800"
            />
            {errors.fullName && (
              <p className="text-xs text-destructive">{errors.fullName.message}</p>
            )}
          </div>

          {/* NIP & WhatsApp (2-Col Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="nip" className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                NIP <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nip"
                value={nipValue}
                onChange={handleNipInput}
                placeholder="Masukkan NIP"
                className="h-10 font-mono text-xs sm:text-sm rounded-2xl sm:rounded-3xl border-neutral-200 dark:border-neutral-800"
              />
              {errors.nip && (
                <p className="text-xs text-destructive">{errors.nip.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="whatsapp" className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                Nomor WhatsApp <span className="text-destructive">*</span>
              </Label>
              <Input
                id="whatsapp"
                {...register("whatsapp")}
                placeholder="Contoh: 081234567890"
                className="h-10 text-xs sm:text-sm rounded-2xl sm:rounded-3xl border-neutral-200 dark:border-neutral-800"
              />
              {errors.whatsapp && (
                <p className="text-xs text-destructive">{errors.whatsapp.message}</p>
              )}
            </div>
          </div>

          {/* Sub Pelatihan Field */}
          <div className="space-y-1.5">
            <Label htmlFor="subPelatihan" className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
              Sub Pelatihan <span className="text-destructive">*</span>
            </Label>
            <button
              type="button"
              id="subPelatihan"
              onClick={() => setIsSubPelatihanDialogOpen(true)}
              className="w-full flex items-center justify-between h-10 px-3.5 rounded-2xl sm:rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-background text-xs sm:text-sm text-left hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors cursor-pointer"
            >
              <span className={subPelatihanValue ? "font-medium text-foreground truncate" : "text-neutral-400 dark:text-neutral-500 truncate"}>
                {subPelatihanValue || "Pilih sub pelatihan..."}
              </span>
              <Search className="size-4 text-neutral-400 shrink-0 ml-2" />
            </button>
            {errors.subPelatihan && (
              <p className="text-xs text-destructive">{errors.subPelatihan.message}</p>
            )}
          </div>
        </div>

        {/* MEMO SURAT USULAN */}
        <div className="space-y-3 pt-1">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-200">
              Memo Surat Usulan <span className="text-destructive">*</span>
            </h3>
          </div>

          <div className="space-y-3">
            <input
              ref={memoInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleMemoSelect(f);
              }}
            />

            {!memoFile ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingMemo(true);
                }}
                onDragLeave={() => setIsDraggingMemo(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingMemo(false);
                  const f = e.dataTransfer.files?.[0];
                  if (f) handleMemoSelect(f);
                }}
                onClick={() => memoInputRef.current?.click()}
                className={`cursor-pointer rounded-2xl sm:rounded-3xl border border-dashed p-4 text-center transition-colors ${isDraggingMemo
                    ? "border-primary bg-primary/5"
                    : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-900/20"
                  }`}
              >
                <Upload className="size-4 mx-auto text-neutral-400 mb-1.5" />
                <p className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-white">
                  Pilih Berkas Memo Surat Usulan
                </p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                  Format PDF atau JPG saja (Maksimal 10 MB)
                </p>
              </div>
            ) : (
              <div className="rounded-2xl sm:rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/40 px-3.5 py-2.5 flex items-center justify-between gap-3 text-xs sm:text-sm">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="size-4 text-primary shrink-0" />
                  <span className="font-medium text-neutral-900 dark:text-white truncate">{memoFile.name}</span>
                  <span className="text-neutral-500 text-xs shrink-0">
                    ({formatFileSize(memoFile.size)})
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => memoInputRef.current?.click()}
                    className="h-7 px-2 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                  >
                    Ganti
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveMemo}
                    className="h-7 w-7 p-0 text-neutral-400 hover:text-destructive"
                    title="Hapus berkas memo"
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
              </div>
            )}

            {errors.memoFileName && (
              <p className="text-xs text-destructive">{errors.memoFileName.message}</p>
            )}

          </div>
        </div>

        {/* DOKUMEN PENDUKUNG */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-200">
              Dokumen Pendukung
            </h3>
            <span className="text-[11px] font-mono text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full shrink-0">
              {supportingDocs.length}/10 berkas
            </span>
          </div>

          <div className="space-y-3">
            <input
              ref={supportingInputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg"
              disabled={supportingDocs.length >= MAX_SUPPORTING_DOCS}
              className="hidden"
              onChange={(e) => {
                if (e.target.files) handleSupportingSelect(e.target.files);
              }}
            />

            {supportingDocs.length < MAX_SUPPORTING_DOCS && (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingSupporting(true);
                }}
                onDragLeave={() => setIsDraggingSupporting(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingSupporting(false);
                  if (e.dataTransfer.files) handleSupportingSelect(e.dataTransfer.files);
                }}
                onClick={() => supportingInputRef.current?.click()}
                className={`cursor-pointer rounded-2xl sm:rounded-3xl border border-dashed p-3.5 text-center transition-colors ${isDraggingSupporting
                    ? "border-primary bg-primary/5"
                    : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-900/20"
                  }`}
              >
                <p className="text-xs font-semibold text-neutral-900 dark:text-white">
                  + Tambah Dokumen Pendukung
                </p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                  Format PDF atau JPG saja (Maksimal 10 MB per berkas)
                </p>
              </div>
            )}

            {/* List Dokumen Terunggah */}
            {supportingDocs.length > 0 && (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {supportingDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="rounded-2xl sm:rounded-3xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 px-3 py-2 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="size-3.5 text-neutral-400 shrink-0" />
                      <span className="text-neutral-800 dark:text-neutral-200 truncate">{doc.name}</span>
                      <span className="text-neutral-500 text-[11px] shrink-0">
                        ({formatFileSize(doc.size)})
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSupporting(doc.id)}
                      className="h-6 w-6 p-0 text-neutral-400 hover:text-destructive shrink-0"
                      title="Hapus berkas"
                    >
                      <X className="size-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SECTION 4: PAKTA INTEGRITAS & AKSI SUBMIT */}
        <div className="space-y-4 pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
          <div className="flex items-start gap-2.5">
            <Checkbox
              id="integrityPact"
              checked={integrityPactValue}
              onCheckedChange={(checked) =>
                setValue("integrityPact", checked === true, { shouldValidate: true })
              }
              className="mt-0.5"
            />
            <label
              htmlFor="integrityPact"
              className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed cursor-pointer select-none"
            >
              Saya menyatakan bahwa seluruh data identitas, memo usulan, dan dokumen pendukung yang saya lampirkan adalah benar dan sah sesuai ketentuan kedinasan yang berlaku.
            </label>
          </div>
          {errors.integrityPact && (
            <p className="text-xs text-destructive">{errors.integrityPact.message}</p>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl sm:rounded-3xl h-11 text-xs sm:text-sm font-semibold bg-primary hover:bg-primary/90 text-white shadow-none cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                Mengirim Berkas Pendaftaran...
              </>
            ) : (
              "Kirim Pendaftaran Pelatihan"
            )}
          </Button>
        </div>
      </form>

      {/* Tiket Sukses Modal setelah berhasil submit */}
      <ProgramSuccessTicket
        submission={successSubmission}
        isOpen={isTicketOpen}
        onClose={() => {
          setIsTicketOpen(false);
        }}
      />

      {/* Sub Pelatihan Selection Popup Modal */}
      <SubPelatihanSelectDialog
        open={isSubPelatihanDialogOpen}
        onOpenChange={setIsSubPelatihanDialogOpen}
        program={program}
        selectedId={watch("subPelatihanId")}
        selectedTitle={subPelatihanValue}
        onSelect={(item) => {
          setValue("subPelatihan", item.title, { shouldValidate: true });
          setValue("subPelatihanId", item.id, { shouldValidate: true });
          onSubPelatihanChange?.(item);
        }}
      />
    </div>
  );
}
