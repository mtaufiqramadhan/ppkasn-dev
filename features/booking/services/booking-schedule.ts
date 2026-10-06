import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { DBRoomBookingRow } from "../types";

const publicRow = z.object({
  id: z.string(), room_ids: z.array(z.string()).nullable(), created_at: z.string(), status: z.string(),
  booking_start: z.string(), booking_end: z.string().nullable(),
  start_time: z.string().nullable(), end_time: z.string().nullable(),
});
const publicColumns = "id, room_ids, created_at, status, booking_start:payload->>bookingStart, booking_end:payload->>bookingEnd, start_time:payload->>startTime, end_time:payload->>endTime";

/** Use verified session permissions; public queries only retrieve schedule metadata. */
export async function fetchBookingSchedule(backend: SupabaseClient, admin: boolean, start: string, end: string): Promise<DBRoomBookingRow[]> {
  let rows: DBRoomBookingRow[];
  if (admin) {
    const { data, error } = await backend.from("room_bookings")
      .select("id, room_ids, created_at, status, payload").eq("status", "confirmed")
      .lte("payload->>bookingStart", end.slice(0, 10) + "T23:59:59.999Z").limit(5000);
    if (error) throw error;
    rows = (data || []) as DBRoomBookingRow[];
  } else {
    const response = await backend.rpc("get_public_booking_schedule", { start_day: start.slice(0, 10), end_day: end.slice(0, 10) });
    let values: unknown = response.data;
    if (response.error) {
      // Compatibility before the new read-only RPC migration is applied.
      // Never bypass RLS or fall back after a permissions/backend error.
      if (response.error.code !== "PGRST202") throw response.error;
      const { data, error } = await backend.from("room_bookings").select(publicColumns)
        .eq("status", "confirmed").lte("payload->>bookingStart", end.slice(0, 10) + "T23:59:59.999Z").limit(5000);
      if (error) throw error;
      values = data || [];
    }
    rows = z.array(publicRow).parse(values).map(row => ({
      id: row.id, room_ids: row.room_ids, created_at: row.created_at, status: row.status,
      payload: {
        bookingStart: row.booking_start, bookingEnd: row.booking_end || row.booking_start,
        startTime: row.start_time || "00:00", endTime: row.end_time || "23:59",
        name: "Peminjam", institutionName: "", purpose: "Kegiatan terjadwal",
      },
    }));
  }
  if (rows.length >= 5000) throw new Error("Schedule exceeds the safe result limit");
  return rows.filter(row => {
    const lastDay = row.payload?.bookingEnd || row.payload?.bookingStart;
    return typeof lastDay === "string" && lastDay.slice(0, 10) >= start.slice(0, 10);
  });
}
