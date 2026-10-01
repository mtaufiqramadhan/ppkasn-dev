import { z } from "zod";

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
    .regex(/^\d{18}$/, "NIP harus berupa 18 digit angka yang valid"),
  institution: z
    .string()
    .trim()
    .min(3, "Instansi asal minimal 3 karakter"),
  workUnit: z
    .string()
    .trim()
    .min(2, "Unit kerja / Satuan kerja wajib diisi"),
  position: z
    .string()
    .trim()
    .min(2, "Nama jabatan saat ini wajib diisi"),
  rankGrade: z
    .string()
    .min(1, "Pangkat / Golongan ruang wajib dipilih"),
  email: z
    .string()
    .trim()
    .email("Format alamat email kedinasan tidak valid"),
  phone: z
    .string()
    .trim()
    .min(9, "Nomor WhatsApp/telepon minimal 9 digit")
    .max(16, "Nomor telepon maksimal 16 digit")
    .regex(/^[0-9+-\s]+$/, "Nomor telepon hanya boleh memuat angka dan tanda plus"),
  englishScore: z
    .string()
    .trim()
    .optional(),
  motivation: z
    .string()
    .trim()
    .min(20, "Alasan dan motivasi minimal 20 karakter agar memperkuat pertimbangan seleksi")
    .max(1000, "Alasan dan motivasi maksimal 1000 karakter"),
  recommendationFileName: z.string().optional(),
  commitmentFileName: z.string().optional(),
  integrityPact: z.boolean().refine((val) => val === true, {
    message: "Anda wajib menyetujui pakta integritas dan komitmen kehadiran",
  }),
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
