import { z } from "zod";

export const PROGRAM_CATEGORIES = [
  "Kepemimpinan & Manajerial", "Teknis Kepresidenan & Protokoler", "Transformasi Digital & AI",
  "Hukum & Legal Drafting", "Diplomasi & Kerja Sama Internasional", "Pelayanan Publik & Komunikasi",
  "Tata Kelola & Kebijakan Publik",
] as const;
export const PROGRAM_METHODS = ["Blended Learning", "Tatap Muka", "Virtual Synchronous", "On-site Internasional"] as const;
export const PROGRAM_STATUSES = ["buka", "segera", "penuh", "selesai"] as const;
const text = z.string().trim().max(10000);
const required = text.min(1, "Wajib diisi");
const count = z.number().int("Gunakan bilangan bulat").nonnegative("Tidak boleh negatif");
const date = text.regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tidak valid").refine(value => {
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}, "Tanggal tidak valid");
const optionalDate = z.union([date, z.literal("")]).optional();
const list = z.array(z.string().max(10000)).max(500).transform(items => items.map(item => item.trim()).filter(Boolean));
const contact = z.object({ name: text, role: text, email: z.union([text.email("Email tidak valid"), z.literal("")]), phone: text }).strict();
const moduleSchema = z.object({ title: required, duration: text.optional(), description: required }).strict();
export const subPelatihanSchema = z.object({
  id: required, code: text.optional(), title: required, description: required,
  duration: text.optional(), hours: count.optional(), objectives: list.optional(), curriculum: z.array(moduleSchema).max(200).optional(),
  quota: count.optional(), enrolledCount: count.optional(), startDate: optionalDate, endDate: optionalDate,
  registrationDeadline: optionalDate, status: z.enum(PROGRAM_STATUSES).optional(), method: z.enum(PROGRAM_METHODS).optional(),
  location: text.optional(), country: text.optional(), targetAudience: text.optional(), requirements: list.optional(),
  facilities: list.optional(), fundingScheme: text.optional(), contactPerson: contact.optional(),
}).strict();

export const cmsProgramSchema = z.object({
  id: required, slug: required.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Gunakan huruf kecil, angka, dan tanda hubung"),
  type: z.enum(["diklat", "luar-negeri"]), title: required, category: z.enum(PROGRAM_CATEGORIES),
  organizer: required, batch: required, duration: required, hours: count, method: z.enum(PROGRAM_METHODS),
  location: required, country: text.optional(), countryFlag: text.optional(),
  startDate: date, endDate: date, registrationDeadline: date, status: z.enum(PROGRAM_STATUSES), quota: count,
  enrolledCount: count, targetAudience: text, shortDescription: required, fullDescription: required,
  objectives: list, curriculum: z.array(moduleSchema).max(200), subPelatihan: z.array(subPelatihanSchema).max(200).min(1, "Tambahkan minimal satu subpelatihan"),
  requirements: list, facilities: list, fundingScheme: text, contactPerson: contact, tags: list,
  accentColor: z.union([text.regex(/^#[0-9a-fA-F]{6}$/, "Gunakan kode warna #RRGGBB"), z.literal("")]).optional(),
}).strict().superRefine((program, ctx) => {
  if (program.endDate < program.startDate) ctx.addIssue({code: "custom", path: ["endDate"], message: "Tanggal selesai harus setelah tanggal mulai"});
  const ids = new Set<string>();
  program.subPelatihan.forEach((sub, index) => {
    if (ids.has(sub.id)) ctx.addIssue({code: "custom", path: ["subPelatihan", index, "id"], message: "ID subpelatihan harus unik"});
    ids.add(sub.id);
    if (sub.startDate && sub.endDate && sub.endDate < sub.startDate) ctx.addIssue({code: "custom", path: ["subPelatihan", index, "endDate"], message: "Tanggal selesai harus setelah tanggal mulai"});
  });
});
export type CmsProgramFormValues = z.infer<typeof cmsProgramSchema>;
