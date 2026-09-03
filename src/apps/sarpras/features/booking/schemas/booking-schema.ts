import * as z from "zod";
import { TIME_REGEX, WORKING_HOURS } from "../types";

export const bookingSchema = z
  .object({
    bookingStart: z
      .instanceof(Date, { message: "Tanggal mulai wajib diisi" })
      .nullable()
      .optional(),
    bookingEnd: z.instanceof(Date).nullable().optional(),
    startTime: z
      .string()
      .regex(TIME_REGEX, "Format waktu mulai tidak valid (HH:MM)"),
    endTime: z
      .string()
      .regex(TIME_REGEX, "Format waktu selesai tidak valid (HH:MM)"),
    name: z
      .string()
      .trim()
      .min(1, "Nama wajib diisi")
      .max(150, "Nama maksimal 150 karakter"),
    institutionName: z
      .string()
      .trim()
      .min(1, "Nama Unit Kerja wajib diisi")
      .max(150, "Nama Unit Kerja maksimal 150 karakter"),
    purpose: z
      .string()
      .trim()
      .min(1, "Nama Kegiatan wajib diisi")
      .max(500, "Nama Kegiatan maksimal 500 karakter"),
    notes: z
      .string()
      .trim()
      .max(1000, "Catatan maksimal 1000 karakter")
      .optional(),
  })
  .superRefine((data, ctx) => {
    const [sh, sm] = data.startTime.split(":").map(Number);
    const [eh, em] = data.endTime.split(":").map(Number);

    if (Number.isNaN(sh) || Number.isNaN(eh)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid time" });
      return;
    }
    if (eh < sh || (eh === sh && em <= sm)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endTime"],
        message: "End time must be after start time",
      });
    }
    if (sh < WORKING_HOURS.start || eh > WORKING_HOURS.end) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endTime"],
        message: `Booking hours must be between ${WORKING_HOURS.start}:00 and ${WORKING_HOURS.end}:00`,
      });
    }

    if (
      data.bookingStart &&
      data.bookingEnd &&
      data.bookingStart > data.bookingEnd
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["bookingEnd"],
        message: "Booking start must be before or equal to booking end",
      });
    }
  });

export type BookingFormData = z.infer<typeof bookingSchema>;
