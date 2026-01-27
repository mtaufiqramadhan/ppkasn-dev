import { createClient } from "@/utils/supabase/client";
import { format } from "date-fns";

export interface Room {
    id: string;
    name: string;
    floor: number;
    capacity: number;
    features: string[];
    status: "available" | "booked" | "selected";
}

export interface Booking {
    id: string;
    roomIds: string[];
    createdAt: string;
    status: "confirmed" | "cancelled";
    payload: {
        bookingStart: string;
        bookingEnd: string;
        startTime: string;
        endTime: string;
        name: string;
        institutionName: string;
        phoneNumber: string;
        purpose?: string;
        institutionType: string;
        participants?: Array<{
            id: string;
            name: string;
            gender: "L" | "P";
            unitKerja: string;
            instansi: string;
        }>;
        roomAssignments?: Record<string, string[]>;
    };
}

export interface IRoomRepository {
    getRoomsForRange(start?: Date | null, end?: Date | null): Promise<Room[]>;
}

export interface IBookingRepository {
    createBooking(
        data: Omit<Booking, "id" | "createdAt" | "status">
    ): Promise<string>;
    listBookingsOverlapping(startISO: string, endISO: string): Promise<Booking[]>;
    deleteBooking(id: string): Promise<void>;
}

const isoDateOnly = (iso: string) => iso.split("T")[0];
const dateRangesOverlap = (
    aStartISO: string,
    aEndISO: string,
    bStartISO: string,
    bEndISO: string
) => {
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
        const { data, error } = await this.supabase
            .from(SupabaseRoomRepository.TABLE)
            .select("*")
            .eq("type", "asrama");

        if (error) {
            console.error("Error fetching rooms:", error);
            return [];
        }

        return (data || []).map((row: any) => {
            const rawFloor = row.floor ?? row.location ?? 0;
            const floor = Number(rawFloor);
            const features = Array.isArray(row.facilities) // Assuming 'facilities' column maps to features
                ? row.facilities.filter((s: any) => typeof s === "string")
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
        // We can optimize this by querying based on dates if we extracted them to columns,
        // but the current schema uses JSONB payload. For now we'll fetch potentially relevant bookings
        // and filter in memory, or use JSONB operators if performance is needed.
        // Given the previous implementation did client side filtering on dates in JSON, we can do similar
        // or try to use Postgres's JSONB query capabilities.
        // However, the Firebase implementation queried where bookingStart <= endISO.
        // We can replicate that with Supabase JSONB query.

        const { data, error } = await this.supabase
            .from(SupabaseBookingRepository.TABLE)
            .select("*")
            // Filter where payload->bookingStart <= endISO
            // Note: Comparing strings as dates is tricky but ISO format usually sorts correctly lexicographically
            .not("payload", "is", null);

        // Since JSONB filtering < on a property might be tricky without a specific index/casting in standard PostgREST sometimes,
        // let's fetch all active/confirmed bookings and filter client side for safety, mimicking the Firebase approach but adapting.
        // Or better, let's just fetch all 'confirmed' bookings and filter.
        // Optimization: If we had start/end columns we'd use them.

        if (error) {
            console.error("Error fetching bookings:", error);
            return [];
        }

        const bookings = (data || []).map((d: any) => ({
            id: d.id,
            roomIds: d.room_ids || [],
            createdAt: d.created_at,
            status: d.status,
            payload: d.payload || {},
        })) as Booking[];

        return bookings.filter((b) => {
            if (b.status !== 'confirmed') return false;
            try {
                const bs = String(b.payload.bookingStart);
                const be = String(b.payload.bookingEnd || b.payload.bookingStart);
                // Basic optimization: if booking starts after our range ends, skip.
                // But we can just use the exact overlap logic.
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
