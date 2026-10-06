import { z } from "zod";
export const NEWS_CATEGORIES = ["Forum & Kebijakan", "Kepemimpinan", "Transformasi Digital", "Sarpras & Kediklatan", "Prestasi & Akreditasi", "Pengumuman"] as const;
const text = z.string().trim();
const required = text.min(1, "Wajib diisi");
const image = text.refine(value => {
  if (/^\/(?!\/)[^\s\\]*$/.test(value)) return true;
  try { const url = new URL(value); return url.protocol === "https:" && ["images.unsplash.com", "plus.unsplash.com", "ppkasn.setneg.go.id"].includes(url.hostname) && !url.username && !url.password; } catch { return false; }
}, "Gunakan path gambar lokal atau URL HTTPS dari PPKASN / Unsplash");
export const cmsNewsBaseSchema = z.object({
  id: required, slug: required.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Gunakan huruf kecil, angka, dan tanda hubung"),
  title: required, excerpt: text, category: z.enum(NEWS_CATEGORIES), publicationStatus: z.enum(["draft", "published"]),
  publishedDateIso: text.regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tidak valid").refine(value => {
    const parsed = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0,10) === value;
  }, "Tanggal tidak valid"),
  image, imageCaption: text.optional(), isFeatured: z.boolean(), tags: z.array(text),
  author: z.object({name:text,role:text,department:text.optional(),avatar:z.union([image,z.literal("")]).optional()}).strict(),
  content: z.object({
    lead:text,
    sections:z.array(z.object({heading:text.optional(),paragraphs:z.array(text),quote:z.object({text, speaker:text,speakerRole:text.optional()}).strict().optional()}).strict()),
    keyTakeaways:z.array(text).optional(),
  }).strict(),
}).strict();
export const cmsNewsSchema = cmsNewsBaseSchema.superRefine((article,ctx)=>{
  if(article.publicationStatus !== "published") return;
  for (const [path,value] of [["excerpt",article.excerpt],["content.lead",article.content.lead],["author.name",article.author.name]] as const) {
    if(!value) ctx.addIssue({code:"custom",path:path.split("."),message:"Wajib diisi sebelum diterbitkan"});
  }
  article.content.sections.forEach((section,index)=>{
    if(!section.paragraphs.some(Boolean)) ctx.addIssue({code:"custom",path:["content","sections",index,"paragraphs"],message:"Isi minimal satu paragraf"});
    if(section.quote?.text && !section.quote.speaker) ctx.addIssue({code:"custom",path:["content","sections",index,"quote","speaker"],message:"Nama narasumber wajib diisi"});
  });
});
export type CmsNewsFormValues = z.infer<typeof cmsNewsSchema>;
export const deleteNewsSchema = z.object({id:required}).strict();

export const storedNewsSchema = cmsNewsBaseSchema.extend({
  publicationStatus:z.enum(["draft","published"]).default("published"),
  isFeatured:z.boolean().default(false),
  publishedAt:z.string(),readTimeMinutes:z.number().int().positive(),viewsCount:z.number().int().nonnegative().optional(),
});
