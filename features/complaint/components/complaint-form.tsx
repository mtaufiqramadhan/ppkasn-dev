"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Send,
  Loader2,
  CheckCircle2,
  Copy,
  FileText,
  User,
  Mail,
  Phone,
  Building,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { complaintSchema, type ComplaintFormValues } from "../schemas/complaint-schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const CATEGORIES = [
  "Sarana & Prasarana",
  "Penyelenggaraan Diklat",
  "Pelanggaran & Integritas (WBS)",
  "Saran & Rekomendasi Layanan",
] as const;

export function ComplaintForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ComplaintFormValues>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      isAnonymous: false,
      fullName: "",
      identityNumber: "",
      email: "",
      phoneNumber: "",
      agency: "",
      category: "Sarana & Prasarana",
      title: "",
      description: "",
      agreement: false,
    },
  });

  const isAnonymous = watch("isAnonymous");
  const selectedCategory = watch("category");
  const agreement = watch("agreement");

  const onSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Simulate submission delay
      await new Promise((res) => setTimeout(res, 900));

      const generatedTicket = `PPK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setSubmittedTicket(generatedTicket);
      toast.success("Pengaduan berhasil dikirim!", {
        description: `Nomor tiket Anda: ${generatedTicket}. Simpan nomor ini untuk mengecek progres.`,
      });
      reset();
    } catch {
      toast.error("Gagal mengirim pengaduan. Silakan coba kembali.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyTicketToClipboard = () => {
    if (submittedTicket) {
      navigator.clipboard.writeText(submittedTicket);
      toast.success("Nomor tiket disalin ke papan klip!");
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-[#141414] rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-6 sm:p-8 shadow-none">
        <div className="mb-6 pb-6 border-b border-neutral-100 dark:border-neutral-800">
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-950 dark:text-white">
            Formulir Penyampaian Pengaduan
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Lengkapi rincian formulir di bawah ini dengan informasi yang jelas dan objektif.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Anonymous toggle */}
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 flex items-start gap-3">
            <Checkbox
              id="isAnonymous"
              checked={isAnonymous}
              onCheckedChange={(checked) => setValue("isAnonymous", !!checked)}
              className="mt-0.5"
            />
            <div className="text-xs">
              <label htmlFor="isAnonymous" className="font-semibold text-neutral-900 dark:text-white cursor-pointer">
                Kirim Laporan Secara Anonim (Identitas Dirahasiakan)
              </label>
              <p className="text-neutral-500 dark:text-neutral-400 mt-0.5">
                Nama dan identitas pribadi Anda tidak akan dicatat atau ditampilkan dalam berkas pelaporan.
              </p>
            </div>
          </div>

          {/* Reporter Identification Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {!isAnonymous && (
              <div>
                <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 block mb-1.5">
                  Nama Lengkap Pelapor <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
                  <Input
                    {...register("fullName")}
                    placeholder="Contoh: Rian Hidayat"
                    className="pl-10 text-xs sm:text-sm h-10.5 rounded-xl border-neutral-200 dark:border-neutral-800"
                  />
                </div>
                {errors.fullName && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.fullName.message}</p>
                )}
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 block mb-1.5">
                NIP / NIK (Opsional)
              </label>
              <Input
                {...register("identityNumber")}
                placeholder="Nomor identitas pegawai atau kependudukan"
                className="text-xs sm:text-sm h-10.5 rounded-xl border-neutral-200 dark:border-neutral-800"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 block mb-1.5">
                Email Aktif <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
                <Input
                  {...register("email")}
                  type="email"
                  placeholder="Untuk menerima notifikasi tiket tindak lanjut"
                  className="pl-10 text-xs sm:text-sm h-10.5 rounded-xl border-neutral-200 dark:border-neutral-800"
                />
              </div>
              {errors.email && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 block mb-1.5">
                Nomor WhatsApp / Telepon <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
                <Input
                  {...register("phoneNumber")}
                  placeholder="0812xxxxxxxx"
                  className="pl-10 text-xs sm:text-sm h-10.5 rounded-xl border-neutral-200 dark:border-neutral-800"
                />
              </div>
              {errors.phoneNumber && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.phoneNumber.message}</p>
              )}
            </div>

            <div className={isAnonymous ? "sm:col-span-2" : "sm:col-span-2"}>
              <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 block mb-1.5">
                Instansi / Unit Kerja Pelapor <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
                <Input
                  {...register("agency")}
                  placeholder="Contoh: Biro SDM Kemensetneg / Bappenas / Pemprov DKI"
                  className="pl-10 text-xs sm:text-sm h-10.5 rounded-xl border-neutral-200 dark:border-neutral-800"
                />
              </div>
              {errors.agency && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.agency.message}</p>
              )}
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 block mb-2">
              Kategori Pengaduan <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setValue("category", cat)}
                    className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "border-neutral-900 dark:border-white bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold shadow-none"
                        : "border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/40 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    }`}
                  >
                    <span>{cat}</span>
                    {isSelected && <CheckCircle2 className="size-4 shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>
            {errors.category && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.category.message}</p>
            )}
          </div>

          {/* Title & Description */}
          <div>
            <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 block mb-1.5">
              Judul Pengaduan / Pokok Permasalahan <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
              <Input
                {...register("title")}
                placeholder="Ringkasan singkat kendala atau saran Anda"
                className="pl-10 text-xs sm:text-sm h-10.5 rounded-xl border-neutral-200 dark:border-neutral-800"
              />
            </div>
            {errors.title && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 block mb-1.5">
              Uraian Kronologi / Rincian Pengaduan <span className="text-rose-500">*</span>
            </label>
            <textarea
              {...register("description")}
              rows={5}
              placeholder="Ceritakan secara terperinci apa yang terjadi, waktu kejadian, lokasi ruangan/kegiatan, serta harapan tindak lanjut dari Anda..."
              className="w-full p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141414] text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 transition-colors leading-relaxed"
            />
            {errors.description && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Agreement Checkbox */}
          <div className="pt-2">
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800">
              <Checkbox
                id="agreement"
                checked={agreement}
                onCheckedChange={(checked) => setValue("agreement", !!checked)}
                className="mt-0.5"
              />
              <label htmlFor="agreement" className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed cursor-pointer">
                Saya menyatakan bahwa informasi yang disampaikan dalam pengaduan ini adalah benar, dapat dipertanggungjawabkan, serta disampaikan dengan itikad baik untuk kemajuan pelayanan publik di lingkungan PPKASN Kemensetneg RI.
              </label>
            </div>
            {errors.agreement && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.agreement.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 rounded-xl text-xs sm:text-sm font-semibold gap-2 bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200 cursor-pointer shadow-none"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Sedang Mengirim Laporan...</span>
              </>
            ) : (
              <>
                <Send className="size-4" />
                <span>Kirim Pengaduan Sekarang</span>
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Success Modal with Ticket Code */}
      <Dialog open={!!submittedTicket} onOpenChange={() => setSubmittedTicket(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 shadow-none">
          <DialogHeader className="text-center sm:text-center">
            <div className="size-14 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="size-8" />
            </div>
            <DialogTitle className="text-xl font-bold text-neutral-950 dark:text-white">
              Pengaduan Berhasil Terkirim
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
              Laporan Anda telah berhasil masuk ke antrean verifikasi tim pengawas pelayanan PPKASN Kemensetneg.
            </DialogDescription>
          </DialogHeader>

          {/* Ticket Display Box */}
          <div className="my-5 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 text-center space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
              Nomor Tiket Anda
            </span>
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl sm:text-2xl font-mono font-extrabold text-neutral-950 dark:text-white tracking-wider">
                {submittedTicket}
              </span>
              <button
                type="button"
                onClick={copyTicketToClipboard}
                className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 transition-colors"
                title="Salin Nomor Tiket"
              >
                <Copy className="size-4" />
              </button>
            </div>
            <p className="text-[11px] text-neutral-400">
              Simpan nomor tiket ini untuk melacak perkembangan tindak lanjut pada tab &ldquo;Lacak Status&rdquo;.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              onClick={() => setSubmittedTicket(null)}
              className="w-full rounded-xl text-xs font-semibold h-10 bg-neutral-950 dark:bg-white text-white dark:text-neutral-950"
            >
              Tutup &amp; Kembali
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
