import { z } from "zod";
const text = z.string().trim().max(1000);
const date = z.string().max(40).refine(value => /^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value.slice(0, 10)).toISOString().slice(0, 10) === value.slice(0, 10), "Tanggal tidak valid");
const time = z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/);
export const bookingApiSchema = z.object({
  roomIds: z.array(z.string().trim().min(1).max(100)).min(1).max(100),
  payload: z.object({
    bookingStart: date, bookingEnd: date.optional(), startTime: time, endTime: time,
    name: text.min(1).max(150), institutionName: text.min(1).max(250), purpose: text.max(500).optional(), notes: text.optional(),
    phoneNumber: text.max(30).optional(), institutionType: z.enum(["Kemensetneg", "Non-Kemensetneg"]).optional(),
    roomSetup: z.enum(["Island", "U-shape", "Classroom"]).optional(), attendees: z.number().int().positive().max(10000).optional(),
    participants: z.array(z.object({ id: text.min(1).max(100), name: text.min(1).max(150), gender: z.enum(["L", "P"]), unitKerja: text.max(250), instansi: text.max(250) }).strict()).max(500).optional(),
    roomAssignments: z.record(z.string().max(100), z.array(z.string().max(100)).max(500)).refine(value => Object.keys(value).length <= 100 && !Object.keys(value).some(key => ["__proto__", "constructor", "prototype"].includes(key)), "Penempatan kamar tidak valid").optional(),
  }).strict(),
}).strict().superRefine((booking, ctx) => {
  const { bookingStart, bookingEnd, startTime, endTime } = booking.payload;
  if (bookingEnd && bookingEnd.slice(0,10) < bookingStart.slice(0,10)) ctx.addIssue({ code: "custom", path: ["payload", "bookingEnd"], message: "Tanggal selesai harus setelah tanggal mulai." });
  if (endTime <= startTime) ctx.addIssue({ code: "custom", path: ["payload", "endTime"], message: "Waktu selesai harus setelah waktu mulai." });
  if (new Set(booking.roomIds).size !== booking.roomIds.length) ctx.addIssue({ code: "custom", path: ["roomIds"], message: "Ruangan tidak boleh duplikat." });
  if (booking.payload.roomAssignments && Object.keys(booking.payload.roomAssignments).some(key => !booking.roomIds.includes(key))) ctx.addIssue({ code: "custom", path: ["payload", "roomAssignments"], message: "Kamar harus sesuai ruangan terpilih." });
});

export const bookingRangeSchema = z.object({ start: date, end: date }).refine(range => {
  const span = Date.parse(range.end) - Date.parse(range.start);
  return span >= 0 && span <= 120 * 86400000;
}, "Rentang jadwal maksimal 120 hari.");
