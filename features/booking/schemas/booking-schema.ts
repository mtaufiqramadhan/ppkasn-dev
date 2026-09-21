import * as z from "zod";
import { TIME_REGEX, WORKING_HOURS, PHONE_REGEX } from "../types";

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
    phoneNumber: z
      .string()
      .trim()
      .min(1, "Nomor telepon/WA wajib diisi")
      .max(20, "Nomor telepon maksimal 20 karakter")
      .regex(
        PHONE_REGEX,
        "Nomor telepon tidak valid (hanya angka, +, -, (), dan spasi, 8-20 karakter)"
      )
      .optional()
      .or(z.literal("")),
    institutionName: z
      .string()
      .trim()
      .min(1, "Nama Unit Kerja / Instansi wajib diisi")
      .max(150, "Nama Unit Kerja maksimal 150 karakter"),
    institutionType: z.enum(["Kemensetneg", "Non-Kemensetneg"]),
    roomSetup: z.enum(["Island", "U-shape", "Classroom"]),
    attendees: z.coerce.number().int().min(1, "Jumlah peserta minimal 1").max(10000, "Jumlah peserta maksimal 10.000"),
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
