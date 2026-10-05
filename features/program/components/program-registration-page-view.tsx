"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Upload, FileText, X, BookOpen, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { ProgramItem, RegistrationSubmission, SupportingDocumentItem } from "../types";
import {
  programRegistrationSchema,
  ProgramRegistrationFormValues,
} from "../schemas/program-schema";
import { ProgramService } from "../services/program-service";
import { ProgramSuccessTicket } from "./program-success-ticket";
import { SubPelatihanSelectDialog } from "./sub-pelatihan-select-dialog";

export interface ProgramRegistrationPageViewProps {
  program: ProgramItem;
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

export function ProgramRegistrationPageView({ program }: ProgramRegistrationPageViewProps) {
  const router = useRouter();
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
      subPelatihan: "",
      subPelatihanId: "",
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

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* 1. Navigasi Kembali */}
      <div className="mb-6">
        <Link
          href={`/program/${program.slug}`}
          className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>Kembali ke Detail Pelatihan</span>
        </Link>
      </div>

      {/* 2. Header Halaman */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Daftar Pelatihan
        </h1>
      </div>

      <form id="registration-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* SECTION: PROGRAM PELATIHAN */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-base sm:text-lg font-bold text-foreground leading-snug">
            {program.title}
          </h2>
        </div>

        {/* DATA PEGAWAI */}
        <div className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-4">

          <div className="space-y-4 pt-1">
            {/* Nama Lengkap */}
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-xs font-medium text-foreground">
                Nama Lengkap (beserta Gelar) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fullName"
                {...register("fullName")}
                placeholder="Contoh: Budi Santoso, S.STP., M.Si."
                className="h-10 text-sm"
              />
              {errors.fullName && (
                <p className="text-xs text-destructive">{errors.fullName.message}</p>
              )}
            </div>

            {/* NIP & WhatsApp (2-Col Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="nip" className="text-xs font-medium text-foreground">
                  NIP <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nip"
                  value={nipValue}
                  onChange={handleNipInput}
                  placeholder="Masukkan NIP"
                  className="h-10 font-mono text-sm"
                />
                {errors.nip && (
                  <p className="text-xs text-destructive">{errors.nip.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="whatsapp" className="text-xs font-medium text-foreground">
                  Nomor WhatsApp <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="whatsapp"
                  {...register("whatsapp")}
                  placeholder="Contoh: 081234567890"
                  className="h-10 text-sm"
                />
                {errors.whatsapp && (
                  <p className="text-xs text-destructive">{errors.whatsapp.message}</p>
                )}
              </div>
            </div>

            {/* Sub Pelatihan Field */}
            <div className="space-y-1.5">
              <Label htmlFor="subPelatihanPage" className="text-xs font-medium text-foreground">
                Sub Pelatihan <span className="text-destructive">*</span>
              </Label>
              <button
                type="button"
                id="subPelatihanPage"
                onClick={() => setIsSubPelatihanDialogOpen(true)}
                className="w-full flex items-center justify-between h-10 px-3.5 rounded-xl border border-border bg-background text-xs sm:text-sm text-left hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors cursor-pointer"
              >
                <span className={subPelatihanValue ? "font-medium text-foreground truncate" : "text-muted-foreground truncate"}>
                  {subPelatihanValue || "Pilih sub pelatihan..."}
                </span>
                <Search className="size-4 text-muted-foreground shrink-0 ml-2" />
              </button>
              {errors.subPelatihan && (
                <p className="text-xs text-destructive">{errors.subPelatihan.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* MEMO SURAT USULAN */}
        <div className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-3">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Memo Surat Usulan <span className="text-destructive">*</span>
            </h3>
          </div>

          <div className="space-y-3 pt-1">
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
                className={`cursor-pointer rounded-lg border border-dashed p-5 text-center transition-colors ${
                  isDraggingMemo
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/50 hover:bg-muted/30"
                }`}
              >
                <Upload className="size-4 mx-auto text-muted-foreground mb-1.5" />
                <p className="text-xs sm:text-sm font-medium text-foreground">
                  Pilih Berkas Memo Surat Usulan
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Format PDF atau JPG saja (Maksimal 10 MB)
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-muted/30 px-3.5 py-2.5 flex items-center justify-between gap-3 text-xs sm:text-sm">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="size-4 text-muted-foreground shrink-0" />
                  <span className="font-medium text-foreground truncate">{memoFile.name}</span>
                  <span className="text-muted-foreground text-xs shrink-0">
                    ({formatFileSize(memoFile.size)})
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => memoInputRef.current?.click()}
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Ganti
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveMemo}
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
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
        <div className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Dokumen Pendukung
            </h3>
            <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded shrink-0">
              {supportingDocs.length}/10 berkas
            </span>
          </div>

          <div className="space-y-3 pt-1">
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
                className={`cursor-pointer rounded-lg border border-dashed p-4 text-center transition-colors ${
                  isDraggingSupporting
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/50 hover:bg-muted/30"
                }`}
              >
                <p className="text-xs sm:text-sm font-medium text-foreground">
                  + Tambah Dokumen Pendukung
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Format PDF atau JPG saja (Maksimal 10 MB per berkas)
                </p>
              </div>
            )}

            {/* List Dokumen Terunggah */}
            {supportingDocs.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {supportingDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="rounded-lg border border-border bg-muted/20 px-3.5 py-2 flex items-center justify-between gap-3 text-xs sm:text-sm"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="size-4 text-muted-foreground shrink-0" />
                      <span className="text-foreground truncate">{doc.name}</span>
                      <span className="text-muted-foreground text-xs shrink-0">
                        ({formatFileSize(doc.size)})
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSupporting(doc.id)}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive shrink-0"
                      title="Hapus berkas"
                    >
                      <X className="size-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SECTION 4: PAKTA INTEGRITAS & AKSI SUBMIT */}
        <div className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-5">
          <div className="flex items-start gap-3">
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
              className="text-xs sm:text-sm text-muted-foreground leading-relaxed cursor-pointer select-none"
            >
              Saya menyatakan bahwa seluruh data identitas, memo usulan, dan dokumen pendukung yang saya lampirkan adalah benar dan sah sesuai ketentuan kedinasan yang berlaku.
            </label>
          </div>
          {errors.integrityPact && (
            <p className="text-xs text-destructive mt-1 pl-7">{errors.integrityPact.message}</p>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-border flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/program/${program.slug}`)}
              disabled={isSubmitting}
              className="h-10 px-5 text-xs sm:text-sm font-medium"
            >
              Batal
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-10 px-6 text-xs sm:text-sm font-semibold bg-primary hover:bg-primary/90 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Mengirim Berkas...
                </>
              ) : (
                "Kirim Pendaftaran"
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Tiket Sukses Modal setelah berhasil submit */}
      <ProgramSuccessTicket
        submission={successSubmission}
        isOpen={isTicketOpen}
        onClose={() => {
          setIsTicketOpen(false);
          router.push(`/program/${program.slug}`);
        }}
      />

      {/* Sub Pelatihan Selection Popup Modal */}
      <SubPelatihanSelectDialog
        open={isSubPelatihanDialogOpen}
        onOpenChange={setIsSubPelatihanDialogOpen}
        program={program}
        selectedTitle={subPelatihanValue}
        onSelect={(item) => {
          setValue("subPelatihan", item.title, { shouldValidate: true });
          setValue("subPelatihanId", item.id, { shouldValidate: true });
        }}
      />
    </div>
  );
}
