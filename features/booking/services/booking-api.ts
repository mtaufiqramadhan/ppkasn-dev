import { apiClient } from "@/lib/api-client";
import type { DBRoomBookingRow } from "../types";

export async function createBookingViaApi(data: { roomIds: string[]; payload: object }): Promise<string> {
  const result = await apiClient<{ id: string }>("/api/public/bookings", { method: "POST", body: data });
  return result.id;
}

export async function fetchBookingRows(start: string, end: string): Promise<DBRoomBookingRow[]> {
  const result = await apiClient<{ data: DBRoomBookingRow[] }>("/api/public/bookings", { params: { start, end }, cache: "no-store" });
  return result.data;
}
