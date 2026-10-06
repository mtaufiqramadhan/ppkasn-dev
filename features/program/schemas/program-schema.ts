import { z } from "zod";

export const supportingDocumentItemSchema = z.object({
  id: z.string().max(100),
  name: z.string().max(255).min(1, "Nama berkas tidak boleh kosong"),
  size: z.number().int().nonnegative().max(10 * 1024 * 1024),
  type: z.string().max(100).optional(),
  category: z.string().max(100).optional(),
  uploadedAt: z.string().max(100).optional(),
});

export type SupportingDocumentItem = z.infer<typeof supportingDocumentItemSchema>;

export const programRegistrationSchema = z.object({
  programId: z.string().max(100).min(1, "Program pelatihan wajib dipilih"),
  programTitle: z.string().max(500).min(1, "Judul program wajib tertera"),
  programType: z.enum(["diklat", "luar-negeri"]),
  fullName: z
    .string()
    .trim()
    .min(3, "Nama lengkap minimal 3 karakter")
    .max(100, "Nama lengkap maksimal 100 karakter"),
  nip: z
    .string()
    .trim()
    .min(3, "NIP minimal 3 karakter")
    .max(30, "NIP maksimal 30 karakter"),
  subPelatihan: z
    .string()
    .trim()
    .min(1, "Sub pelatihan wajib dipilih"),
  subPelatihanId: z.string().max(1000).optional(),
  whatsapp: z
    .string()
    .trim()
    .min(9, "Nomor WhatsApp minimal 9 digit")
    .max(16, "Nomor WhatsApp maksimal 16 digit")
    .regex(/^[0-9+-\s]+$/, "Nomor WhatsApp hanya boleh memuat angka, spasi, dan tanda plus"),
  // Alias for backward compatibility
  phone: z.string().max(1000).optional(),
  // Memo Surat Usulan
  memoFileName: z.string().max(255).min(1, "Berkas memo / surat usulan resmi wajib dilampirkan"),
  memoFileSize: z.number().nonnegative().max(10 * 1024 * 1024).optional(),
  memoNumber: z.string().trim().max(100, "Nomor memo maksimal 100 karakter").optional(),
  memoNotes: z.string().trim().max(500, "Catatan memo maksimal 500 karakter").optional(),
  // Dokumen Pendukung (Maksimal 10 dokumen)
  supportingDocuments: z
    .array(supportingDocumentItemSchema)
    .max(10, "Maksimal 10 dokumen pendukung yang dapat diunggah"),
  // Pakta Integritas
  integrityPact: z.boolean().refine((val) => val === true, {
    message: "Anda wajib menyetujui pakta integritas dan keabsahan dokumen usulan",
  }),
  // Optional legacy fields for backwards compatibility
  institution: z.string().max(1000).optional(),
  workUnit: z.string().max(1000).optional(),
  position: z.string().max(1000).optional(),
  rankGrade: z.string().max(1000).optional(),
  email: z.string().max(1000).optional(),
  englishScore: z.string().max(1000).optional(),
  motivation: z.string().max(1000).optional(),
  recommendationFileName: z.string().max(1000).optional(),
  commitmentFileName: z.string().max(1000).optional(),
});

export type ProgramRegistrationFormValues = z.infer<typeof programRegistrationSchema>;

export const RANK_GRADES = [
  "Pengatur Muda (II/a)",
  "Pengatur Muda Tk. I (II/b)",
  "Pengatur (II/c)",
  "Pengatur Tk. I (II/d)",
  "Penata Muda (III/a)",
  "Penata Muda Tk. I (III/b)",
  "Penata (III/c)",
  "Penata Tk. I (III/d)",
  "Pembina (IV/a)",
  "Pembina Tk. I (IV/b)",
  "Pembina Utama Muda (IV/c)",
  "Pembina Utama Madya (IV/d)",
  "Pembina Utama (IV/e)",
] as const;

export const SUPPORTING_DOC_CATEGORIES = [
  "SK Jabatan / Pangkat Terakhir",
  "Sertifikat Pelatihan / Toefl",
  "Curriculum Vitae / Portofolio",
  "Surat Persetujuan Atasan Langsung",
  "Ijazah Pendidikan Terakhir",
  "Dokumen Pendukung Lainnya",
] as const;

