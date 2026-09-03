import { createClient } from "@/lib/supabase/client";
import {
  type Room,
  type Booking,
  type BookingPayload,
  type IRoomRepository,
  type IBookingRepository,
} from "../types";

interface DatabaseAssetRow {
  id: string;
  name: string | null;
  floor: string | number | null;
  location: string | null;
  capacity: string | number | null;
  facilities: string[] | string | null;
}

interface DatabaseBookingRow {
  id: string;
  room_ids: string[] | null;
  created_at: string;
  status: "confirmed" | "cancelled";
  payload: BookingPayload | null;
}

const isoDateOnly = (iso: string): string => iso.split("T")[0];

const dateRangesOverlap = (
  aStartISO: string,
  aEndISO: string,
  bStartISO: string,
  bEndISO: string
): boolean => {
  const aStart = new Date(isoDateOnly(aStartISO));
  const aEnd = new Date(isoDateOnly(aEndISO));
  const bStart = new Date(isoDateOnly(bStartISO));
  const bEnd = new Date(isoDateOnly(bEndISO));
  return !(aEnd < bStart || bEnd < aStart);
};

export class SupabaseRoomRepository implements IRoomRepository {
  private supabase = createClient();
  private static readonly TABLE = "assets";

  async getRoomsForRange(start?: Date | null, end?: Date | null): Promise<Room[]> {
    void start;
    void end;
    const { data, error } = await this.supabase
      .from(SupabaseRoomRepository.TABLE)
      .select("id, name, floor, location, capacity, facilities")
      .eq("type", "asrama");

    if (error) {
      console.error("Error fetching rooms:", error);
      return [];
    }

    const rows = (data || []) as DatabaseAssetRow[];

    return rows.map((row) => {
      const rawFloor = row.floor ?? row.location ?? 0;
      const floor = Number(rawFloor);
      const features = Array.isArray(row.facilities)
        ? row.facilities.filter((s): s is string => typeof s === "string")
        : typeof row.facilities === "string" && row.facilities.length > 0
        ? String(row.facilities)
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean)
        : [];

      return {
        id: row.id,
        name: row.name ?? row.id,
        floor: Number.isFinite(floor) ? floor : 0,
        capacity: Number.isFinite(Number(row.capacity))
          ? Number(row.capacity)
          : 0,
        features,
        status: "available",
      };
    });
  }
}

export class SupabaseBookingRepository implements IBookingRepository {
  private supabase = createClient();
  private static readonly TABLE = "room_bookings";

  async createBooking(
    data: Omit<Booking, "id" | "createdAt" | "status">
  ): Promise<string> {
    const { data: result, error } = await this.supabase
      .from(SupabaseBookingRepository.TABLE)
      .insert({
        room_ids: data.roomIds,
        payload: data.payload,
        status: "confirmed",
      })
      .select("id")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return result.id;
  }

  async listBookingsOverlapping(
    startISO: string,
    endISO: string
  ): Promise<Booking[]> {
    const { data, error } = await this.supabase
      .from(SupabaseBookingRepository.TABLE)
      .select("id, room_ids, created_at, status, payload")
      .not("payload", "is", null);

    if (error) {
      console.error("Error fetching bookings:", error);
      return [];
    }

    const rows = (data || []) as DatabaseBookingRow[];

    const bookings: Booking[] = rows.map((d) => ({
      id: d.id,
      roomIds: d.room_ids || [],
      createdAt: d.created_at,
      status: d.status,
      payload: d.payload || {
        bookingStart: "",
        bookingEnd: "",
        startTime: "",
        endTime: "",
        name: "",
        institutionName: "",
        phoneNumber: "",
        institutionType: "Kemensetneg",
      },
    }));

    return bookings.filter((b) => {
      if (b.status !== "confirmed") return false;
      try {
        const bs = String(b.payload.bookingStart);
        const be = String(b.payload.bookingEnd || b.payload.bookingStart);
        return dateRangesOverlap(startISO, endISO, bs, be);
      } catch {
        return false;
      }
    });
  }

  async deleteBooking(id: string): Promise<void> {
    const { error } = await this.supabase
      .from(SupabaseBookingRepository.TABLE)
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }
  }
}
