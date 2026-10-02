"use client";

import React, { useState, useEffect, useRef } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Loader2,
  Upload,
  FileText,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { ProgramItem, RegistrationSubmission, SupportingDocumentItem } from "../types";
import {
  programRegistrationSchema,
  ProgramRegistrationFormValues,
} from "../schemas/program-schema";
import { ProgramService } from "../services/program-service";

export interface ProgramRegistrationModalProps {
  initialProgram: ProgramItem | null;
  allPrograms: ProgramItem[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (submission: RegistrationSubmission) => void;
}

const MAX_SUPPORTING_DOCS = 10;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

function formatFileSize(bytes: number): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

export function ProgramRegistrationModal({
  initialProgram,
  allPrograms,
  isOpen,
  onClose,
  onSuccess,
}: ProgramRegistrationModalProps) {
  const [selectedProgram, setSelectedProgram] = useState<ProgramItem | null>(initialProgram);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // File states
  const [memoFile, setMemoFile] = useState<{ name: string; size: number } | null>(null);
  const [supportingDocs, setSupportingDocs] = useState<SupportingDocumentItem[]>([]);
  const [isDraggingMemo, setIsDraggingMemo] = useState(false);
  const [isDraggingSupporting, setIsDraggingSupporting] = useState(false);

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
      programId: initialProgram?.id ?? "",
      programTitle: initialProgram?.title ?? "",
      programType: initialProgram?.type ?? "diklat",
      fullName: "",
      nip: "",
      whatsapp: "",
      memoFileName: "",
      memoNumber: "",
      supportingDocuments: [],
      integrityPact: false,
    },
  });

  const nipValue = watch("nip") || "";
  const integrityPactValue = watch("integrityPact") || false;

  useEffect(() => {
    if (initialProgram) {
      setSelectedProgram(initialProgram);
      setValue("programId", initialProgram.id);
      setValue("programTitle", initialProgram.title);
      setValue("programType", initialProgram.type);
    }
  }, [initialProgram, setValue]);

  useEffect(() => {
    setValue("supportingDocuments", supportingDocs, { shouldValidate: true });
  }, [supportingDocs, setValue]);

  // Memo file handling
  const handleMemoSelect = (file: File) => {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error(`Ukuran file melebihi batas 10 MB.`);
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

  // Supporting docs handling (Max 10)
  const handleSupportingSelect = (files: FileList | File[]) => {
    const fileList = Array.from(files);
    if (!fileList.length) return;

    const availableSlots = MAX_SUPPORTING_DOCS - supportingDocs.length;
    if (availableSlots <= 0) {
      toast.warning(`Maksimal 10 dokumen pendukung telah tercapai.`);
      return;
    }

    const acceptedFiles = fileList.slice(0, availableSlots);
    if (fileList.length > availableSlots) {
      toast.info(`Hanya ${availableSlots} dokumen yang dapat ditambahkan.`);
    }

    const newItems: SupportingDocumentItem[] = [];
    for (const f of acceptedFiles) {
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

      toast.success("Pendaftaran berhasil dikirim");
      reset();
      setMemoFile(null);
      setSupportingDocs([]);
      onClose();
      onSuccess(submission);
    } catch {
      toast.error("Gagal mengirim pendaftaran. Periksa kembali form Anda.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full max-w-xl sm:max-w-2xl max-h-[90vh] flex flex-col p-0 rounded-xl border border-border bg-background shadow-xl overflow-hidden">
        {/* Header Modal */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-border bg-background shrink-0">
          <DialogTitle className="text-lg font-semibold tracking-tight text-foreground">
            Daftar Pelatihan
          </DialogTitle>
        </div>

        {/* Form Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
          <form id="registration-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* 1. SECTION KHUSUS: PROGRAM PELATIHAN YANG DIDAFTAR (DI ATAS NAMA) */}
            <div className="rounded-lg border border-border bg-muted/30 p-3.5 sm:p-4">
              <h3 className="text-sm sm:text-base font-semibold text-foreground leading-snug">
                {selectedProgram?.title}
              </h3>
            </div>

            {/* 2. SECTION DATA IDENTITAS (NAMA, NIP, WHATSAPP) */}
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
                  className="h-9.5 text-sm"
                />
                {errors.fullName && (
                  <p className="text-xs text-destructive">{errors.fullName.message}</p>
                )}
              </div>

              {/* NIP & WhatsApp (Responsive 2-Col Grid) */}
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
                    className="h-9.5 font-mono text-sm"
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
                    className="h-9.5 text-sm"
                  />
                  {errors.whatsapp && (
                    <p className="text-xs text-destructive">{errors.whatsapp.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* 3. SECTION MEMO SURAT USULAN */}
            <div className="space-y-2.5 pt-3 border-t border-border">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <Label className="text-xs font-medium text-foreground">
                  Memo Surat Usulan <span className="text-destructive">*</span>
                </Label>
                <span className="text-[11px] text-muted-foreground">Format PDF atau DOCX (maks. 10 MB)</span>
              </div>

              <input
                ref={memoInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
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
                  className={`cursor-pointer rounded-lg border border-dashed p-4 text-center transition-colors ${
                    isDraggingMemo
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/50 hover:bg-muted/30"
                  }`}
                >
                  <Upload className="size-4 mx-auto text-muted-foreground mb-1.5" />
                  <p className="text-xs font-medium text-foreground">
                    Unggah memo atau surat usulan resmi
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Klik untuk memilih berkas atau seret dokumen ke sini
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border border-border bg-muted/30 px-3.5 py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="size-4 text-muted-foreground shrink-0" />
                    <span className="font-medium text-foreground truncate">{memoFile.name}</span>
                    <span className="text-muted-foreground shrink-0 text-[11px]">
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

            {/* 4. SECTION DOKUMEN PENDUKUNG (MAKS. 10 DOKUMEN) */}
            <div className="space-y-2.5 pt-3 border-t border-border">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs font-medium text-foreground">
                    Dokumen Pendukung
                  </Label>
                  <p className="text-[11px] text-muted-foreground">
                    Lampirkan SK Pangkat/Jabatan, Sertifikat, CV, atau kelengkapan lain jika ada.
                  </p>
                </div>
                <span className="text-[11px] text-muted-foreground tabular-nums font-mono shrink-0">
                  {supportingDocs.length}/10 dokumen
                </span>
              </div>

              <input
                ref={supportingInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
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
                  className={`cursor-pointer rounded-lg border border-dashed p-3.5 text-center transition-colors ${
                    isDraggingSupporting
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/50 hover:bg-muted/30"
                  }`}
                >
                  <p className="text-xs text-muted-foreground">
                    + Tambah dokumen pendukung (PDF, DOCX, JPG, PNG — maks. 10 MB per berkas)
                  </p>
                </div>
              )}

              {/* List Dokumen Terunggah */}
              {supportingDocs.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  {supportingDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="rounded-md border border-border bg-muted/20 px-3 py-2 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="size-3.5 text-muted-foreground shrink-0" />
                        <span className="text-foreground truncate">{doc.name}</span>
                        <span className="text-muted-foreground text-[11px] shrink-0">
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
                        <X className="size-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 5. PAKTA INTEGRITAS */}
            <div className="pt-3 border-t border-border">
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
                  className="text-xs text-muted-foreground leading-normal cursor-pointer select-none"
                >
                  Saya menyatakan bahwa seluruh data identitas, memo usulan, dan dokumen pendukung yang saya lampirkan adalah benar dan sah.
                </label>
              </div>
              {errors.integrityPact && (
                <p className="text-xs text-destructive mt-1 pl-6">{errors.integrityPact.message}</p>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 sm:px-6 sm:py-4 border-t border-border bg-muted/10 flex items-center justify-end gap-2.5 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-9 px-4 text-xs font-medium"
          >
            Batal
          </Button>

          <Button
            type="submit"
            form="registration-form"
            disabled={isSubmitting}
            className="h-9 px-4 text-xs font-medium"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-3.5 animate-spin mr-1.5" />
                Mengirim...
              </>
            ) : (
              "Kirim Pendaftaran"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
