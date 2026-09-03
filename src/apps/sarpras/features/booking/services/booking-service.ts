import { createClient } from "@/lib/supabase/client";
import {
  type Booking,
  type BookingPayload,
  type Room,
  type DBAssetRow,
  type DBRoomBookingRow,
  type IRoomRepository,
  type IBookingRepository,
} from "../types";
import { DateUtils } from "../utils/date-utils";

export class SupabaseRoomRepository implements IRoomRepository {
  private supabase = createClient();

  async getRoomsForRange(start?: Date | null, end?: Date | null): Promise<Room[]> {
    void start;
    void end;
    const { data, error } = await this.supabase
      .from("assets")
      .select("id, name, floor, capacity, facilities")
      .in("type", ["ruang_rapat", "ruangan", "ruang"]);

    if (error) {
      console.error("Error fetching rooms:", error);
      return [];
    }

    const rows = (data || []) as DBAssetRow[];
    return rows.map((d) => this.mapToEntity(d));
  }

  private mapToEntity(d: DBAssetRow): Room {
    const rowFloor = Number(d.floor);
    const floor = Number.isFinite(rowFloor) ? rowFloor : 1;
    let features: string[] = [];

    if (Array.isArray(d.facilities)) {
      features = d.facilities.filter(
        (s: unknown): s is string => typeof s === "string"
      );
    } else if (typeof d.facilities === "string" && d.facilities.length > 0) {
      features = d.facilities
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);
    }

    return {
      id: d.id,
      name: d.name ?? "Unknown Room",
      floor,
      capacity: Number.isFinite(Number(d.capacity)) ? Number(d.capacity) : 0,
      features,
      status: "available",
    };
  }
}

export class SupabaseBookingRepository implements IBookingRepository {
  private supabase = createClient();

  async createBooking(
    data: Omit<Booking, "id" | "createdAt" | "status">
  ): Promise<string> {
    const newBooking = {
      room_ids: data.roomIds,
      payload: { ...data.payload },
      created_at: new Date().toISOString(),
      status: "confirmed",
    };

    const { data: inserted, error } = await this.supabase
      .from("room_bookings")
      .insert(newBooking)
      .select()
      .single();

    if (error) {
      console.error("Booking persistence failed:", error);
      throw new Error(error.message);
    }

    return inserted.id;
  }

  async listBookingsOverlapping(
    startISO: string,
    endISO: string
  ): Promise<Booking[]> {
    const { data, error } = await this.supabase
      .from("room_bookings")
      .select("id, room_ids, created_at, status, payload");

    if (error || !data) {
      console.error("Error fetching bookings:", error);
      return [];
    }

    const rows = data as DBRoomBookingRow[];
    const results: Booking[] = rows.map((d) => this.mapToEntity(d));

    return results.filter((b) => {
      try {
        return DateUtils.dateRangesOverlap(
          startISO,
          endISO,
          b.payload.bookingStart,
          b.payload.bookingEnd
        );
      } catch {
        return false;
      }
    });
  }

  private mapToEntity(d: DBRoomBookingRow): Booking {
    const p = d.payload || {};
    const payload: BookingPayload = {
      bookingStart: p.bookingStart ?? "",
      bookingEnd: p.bookingEnd ?? "",
      startTime: p.startTime ?? "",
      endTime: p.endTime ?? "",
      name: p.name ?? "",
      institutionName: p.institutionName ?? "",
      purpose: p.purpose ?? "",
      notes: p.notes ?? "",
    };

    return {
      id: d.id,
      roomIds: Array.isArray(d.room_ids) ? d.room_ids : [],
      createdAt: d.created_at,
      status: "confirmed",
      payload,
    };
  }
}

export const roomRepository = new SupabaseRoomRepository();
export const bookingRepository = new SupabaseBookingRepository();
