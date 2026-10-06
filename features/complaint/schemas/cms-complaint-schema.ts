import { z } from "zod";
import { boundedText as text, contentImageSchema as image, contentLinkSchema as link } from "@/lib/security/content-schema";
export const complaintCategorySchema = z.enum(["Sarana & Prasarana", "Penyelenggaraan Diklat", "Pelanggaran & Integritas (WBS)", "Saran & Rekomendasi Layanan"]);
export const complaintStatusSchema = z.enum(["TERKIRIM", "DIVERIFIKASI", "SEDANG_DITINDAKLANJUTI", "SELESAI"]);
export const complaintSubmissionSchema = z.object({
  category: complaintCategorySchema, title: text.min(5).max(120), description: text.min(20).max(2500),
  isAnonymous: z.boolean(), reporterName: text.max(150).optional(), agency: text.max(250).optional(),
}).strict();
export const complaintStatusUpdateSchema = z.object({ ticketNumber: text.min(1).max(100), status: complaintStatusSchema, statusNotes: text.max(2500).optional() }).strict();
export const cmsComplaintContentSchema = z.object({
  hero: z.object({ title: text, description: text }).strict(), bannerUrl: image,
  channelsTitle: text, channelsDescription: text,
  channels: z.array(z.object({ id: text.min(1), number: text, name: text, description: text, actionText: text, actionUrl: link, type: z.enum(["whatsapp", "email", "external"]), isActive: z.boolean() }).strict()).max(100),
  commitment1: text, commitment2: text,
}).strict().partial();
