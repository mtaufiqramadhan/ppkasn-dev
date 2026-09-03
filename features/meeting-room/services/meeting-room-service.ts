import { createClient } from "@/lib/supabase/client";
import {
  type Room,
  type Booking,
  type BookingPayload,
  type BookingStatus,
} from "../types";

interface DBAssetRow {
  id: string;
  name: string | null;
  floor: string | number | null;
  location: string | null;
  capacity: string | number | null;
  facilities: string[] | string | null;
}

interface DBRoomBookingRow {
  id: string;
  room_ids: string[] | null;
  created_at: string;
  status: string;
  payload: BookingPayload | null;
}

export class SupabaseRoomService {
  private supabase = createClient();

  async fetchAllRooms(): Promise<Room[]> {
    const { data, error } = await this.supabase
      .from("assets")
      .select("id, name, floor, location, capacity, facilities")
      .in("type", ["ruang_rapat", "ruangan", "ruang"])
      .order("name", { ascending: true });

    if (error) {
      console.error("SupabaseRoomService: fetchAllRooms error:", error);
      return [];
    }

    const rows = (data || []) as DBAssetRow[];
    return rows.map((d) => ({
      id: d.id,
      name: d.name ?? "—",
      floor: Number(d.floor) || 1,
      location: d.location ?? undefined,
      capacity: Number(d.capacity) || 0,
      features: Array.isArray(d.facilities)
        ? d.facilities
        : typeof d.facilities === "string" && d.facilities
        ? d.facilities.split(",")
        : [],
    }));
  }
}

export class SupabaseBookingService {
  private supabase = createClient();

  private dateRangesOverlap(
    aStartISO: string,
    aEndISO: string,
    bStartISO: string,
    bEndISO: string
  ): boolean {
    const aStart = new Date(aStartISO.split("T")[0]);
    const aEnd = new Date(aEndISO.split("T")[0]);
    const bStart = new Date(bStartISO.split("T")[0]);
    const bEnd = new Date(bEndISO.split("T")[0]);
    return !(aEnd < bStart || bEnd < aStart);
  }

  async fetchBookings(startISO: string, endISO: string): Promise<Booking[]> {
    const { data, error } = await this.supabase
      .from("room_bookings")
      .select("id, room_ids, created_at, status, payload");

    if (error) {
      console.error("SupabaseBookingService: fetchBookings error:", error.message);
      return [];
    }

    const rows = (data || []) as DBRoomBookingRow[];
    const results: Booking[] = rows.map((d) => ({
      id: d.id,
      payload: {
        bookingStart: d.payload?.bookingStart ?? "",
        bookingEnd: d.payload?.bookingEnd,
        startTime: d.payload?.startTime,
        endTime: d.payload?.endTime,
        name: d.payload?.name ?? "",
        institutionName: d.payload?.institutionName ?? "",
        purpose: d.payload?.purpose,
        notes: d.payload?.notes,
        userId: d.payload?.userId,
        institutionType: d.payload?.institutionType,
        phoneNumber: d.payload?.phoneNumber,
        attendees: d.payload?.attendees,
        roomSetup: d.payload?.roomSetup,
      },
      roomIds: d.room_ids || [],
      createdAt: d.created_at,
      status: (d.status === "cancelled" ? "cancelled" : "confirmed") as BookingStatus,
    }));

    return results.filter((b) => {
      try {
        const bs = String(b.payload.bookingStart);
        const be = String(b.payload.bookingEnd ?? b.payload.bookingStart);
        return this.dateRangesOverlap(startISO, endISO, bs, be);
      } catch {
        return false;
      }
    });
  }

  async createBooking(
    data: Omit<Booking, "id" | "createdAt" | "status">
  ): Promise<string> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    const payload = {
      ...data.payload,
      userId: data.payload.userId || user?.id,
    };

    const newBooking = {
      room_ids: data.roomIds,
      payload,
      created_at: new Date().toISOString(),
      status: "confirmed",
    };

    const { data: inserted, error } = await this.supabase
      .from("room_bookings")
      .insert(newBooking)
      .select()
      .single();

    if (error) {
      console.error("SupabaseBookingService: createBooking error:", error);
      throw new Error(error.message);
    }

    return inserted.id;
  }

  async updateBooking(id: string, updates: Partial<BookingPayload>): Promise<void> {
    if (!id || typeof id !== "string") {
      throw new Error("Invalid booking ID");
    }

    const { data: existing, error: fetchError } = await this.supabase
      .from("room_bookings")
      .select("payload")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      throw new Error("Booking not found");
    }

    const currentPayload = (existing.payload as BookingPayload) || {};
    const safeUpdates: Partial<BookingPayload> = {};
    const allowedKeys: (keyof BookingPayload)[] = [
      "bookingStart",
      "bookingEnd",
      "startTime",
      "endTime",
      "name",
      "institutionName",
      "purpose",
      "notes",
      "userId",
      "institutionType",
      "phoneNumber",
      "attendees",
      "roomSetup",
    ];

    allowedKeys.forEach((key) => {
      const val = updates[key];
      if (val !== undefined) {
        (safeUpdates as Record<string, unknown>)[key] = val;
      }
    });

    const newPayload = { ...currentPayload, ...safeUpdates };

    const { error } = await this.supabase
      .from("room_bookings")
      .update({ payload: newPayload })
      .eq("id", id);

    if (error) {
      throw new Error("Gagal mengupdate booking: " + error.message);
    }
  }

  async deleteBooking(id: string): Promise<void> {
    if (!id || typeof id !== "string") {
      throw new Error("Invalid booking ID");
    }
    const { error } = await this.supabase
      .from("room_bookings")
      .delete()
      .eq("id", id);
    if (error) {
      throw new Error("Gagal menghapus booking: " + error.message);
    }
  }
}

export const roomService = new SupabaseRoomService();
export const bookingService = new SupabaseBookingService();
