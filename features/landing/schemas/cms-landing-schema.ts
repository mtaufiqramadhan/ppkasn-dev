import { z } from "zod";
import { boundedText as text, contentImageSchema as image, contentLinkSchema as link } from "@/lib/security/content-schema";
export const cmsLandingSchema = z.object({
  heroSlides: z.array(z.object({ id: text.min(1), label: text, imageUrl: image, tagline: text.optional(), isActive: z.boolean() }).strict()).max(100),
  spbeApps: z.array(z.object({ id: text.min(1), name: text, fullName: text, description: text, image: image.optional(), isBookingLogo: z.boolean().optional(), link, isExternal: z.boolean(), tag: text, status: text }).strict()).max(100),
  generalInfo: z.array(z.object({ id: text.min(1), title: text, desc: text, actionType: z.enum(["download", "detail"]), link, type: z.enum(["dokumen", "link"]), category: text.optional() }).strict()).max(500),
  socials: z.array(z.object({ id: text.min(1), name: text, handle: text, url: link }).strict()).max(100),
  announcement: z.object({ enabled: z.boolean(), text, link: link.optional() }).strict().optional(),
}).strict();
