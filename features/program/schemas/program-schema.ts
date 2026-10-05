import { z } from "zod";

export const supportingDocumentItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nama berkas tidak boleh kosong"),
  size: z.number().nonnegative(),
  type: z.string().optional(),
  category: z.string().optional(),
  uploadedAt: z.string().optional(),
});

export type SupportingDocumentItem = z.infer<typeof supportingDocumentItemSchema>;

export const programRegistrationSchema = z.object({
  programId: z.string().min(1, "Program pelatihan wajib dipilih"),
  programTitle: z.string().min(1, "Judul program wajib tertera"),
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
  subPelatihanId: z.string().optional(),
  whatsapp: z
    .string()
    .trim()
    .min(9, "Nomor WhatsApp minimal 9 digit")
    .max(16, "Nomor WhatsApp maksimal 16 digit")
    .regex(/^[0-9+-\s]+$/, "Nomor WhatsApp hanya boleh memuat angka, spasi, dan tanda plus"),
  // Alias for backward compatibility
  phone: z.string().optional(),
  // Memo Surat Usulan
  memoFileName: z.string().min(1, "Berkas memo / surat usulan resmi wajib dilampirkan"),
  memoFileSize: z.number().optional(),
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
  institution: z.string().optional(),
  workUnit: z.string().optional(),
  position: z.string().optional(),
  rankGrade: z.string().optional(),
  email: z.string().optional(),
  englishScore: z.string().optional(),
  motivation: z.string().optional(),
  recommendationFileName: z.string().optional(),
  commitmentFileName: z.string().optional(),
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

