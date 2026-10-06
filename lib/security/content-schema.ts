import { z } from "zod";

export const boundedText = z.string().trim().max(10000);
export const contentLinkSchema = z.string().trim().max(2048).refine(value => {
  if (!value || value === "#") return true;
  if (/^\/(?!\/)/.test(value)) return !/[\\\s\x00-\x1f]/.test(value);
  if (/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return true;
  try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password; }
  catch { return false; }
}, "Gunakan path lokal, URL HTTPS, atau alamat mailto yang valid.");

export const contentImageSchema = z.string().trim().max(2048).refine(value => {
  if (!value) return true;
  if (/^\/(?!\/)[^\s\\]*$/.test(value)) return true;
  try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password && ["images.unsplash.com", "plus.unsplash.com", "ppkasn.setneg.go.id"].includes(url.hostname); }
  catch { return false; }
}, "Gunakan gambar lokal atau URL HTTPS PPKASN / Unsplash.");
