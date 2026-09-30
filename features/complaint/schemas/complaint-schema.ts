import { z } from "zod";

export const complaintSchema = z.object({
  isAnonymous: z.boolean(),
  fullName: z.string().trim().optional(),
  identityNumber: z.string().trim().optional(),
  email: z.string().trim().email("Format alamat email tidak valid"),
  phoneNumber: z
    .string()
    .trim()
    .min(9, "Nomor WhatsApp/telepon minimal 9 digit")
    .max(15, "Nomor WhatsApp/telepon maksimal 15 digit")
    .regex(/^[0-9+\s-]+$/, "Nomor telepon hanya boleh berisi angka, tanda plus, atau strip"),
  agency: z.string().trim().min(3, "Nama instansi/unit kerja minimal 3 karakter"),
  category: z.enum([
    "Sarana & Prasarana",
    "Penyelenggaraan Diklat",
    "Pelanggaran & Integritas (WBS)",
    "Saran & Rekomendasi Layanan",
  ], {
    errorMap: () => ({ message: "Pilih salah satu kategori pengaduan" }),
  }),
  title: z
    .string()
    .trim()
    .min(5, "Judul pengaduan minimal 5 karakter")
    .max(120, "Judul pengaduan maksimal 120 karakter"),
  description: z
    .string()
    .trim()
    .min(20, "Uraian pengaduan minimal 20 karakter agar dapat ditindaklanjuti")
    .max(2500, "Uraian pengaduan maksimal 2500 karakter"),
  agreement: z.boolean().refine((val) => val === true, {
    message: "Anda wajib menyetujui pernyataan kebenaran laporan",
  }),
}).refine(
  (data) => {
    if (!data.isAnonymous && (!data.fullName || data.fullName.trim().length < 3)) {
      return false;
    }
    return true;
  },
  {
    message: "Nama lengkap wajib diisi jika laporan tidak bersifat anonim",
    path: ["fullName"],
  }
);

export type ComplaintFormValues = z.infer<typeof complaintSchema>;
