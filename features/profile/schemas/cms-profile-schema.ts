import { z } from "zod";
import { boundedText as text, contentImageSchema as image } from "@/lib/security/content-schema";
export const cmsProfileSchema = z.object({
  orgStructure: z.object({ title: text, subtitle: text, imageUrl: image }).strict(),
  strategicPolicy: z.object({ title: text, intro: text, pillars: z.array(z.object({ number: text, title: text, description: text }).strict()).max(100) }).strict(),
}).strict();
