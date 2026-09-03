import { createClient as createBrowserClient } from "@/lib/supabase/client";
import {
  type Asset,
  type AssetStatus,
  normalizeAssetType,
  ASSET_STATUSES,
} from "@/features/assets";

interface DatabaseAsset {
  id: string;
  name: string;
  category: string;
  location: string;
  status: string;
  type: string;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

const safeString = (value: unknown): string | undefined => {
  if (value === null || value === undefined || value === "") return undefined;
  return String(value);
};

const safeParseInt = (value: unknown): number | undefined => {
  if (value === null || value === undefined || value === "") return undefined;
  const num = parseInt(String(value), 10);
  return isNaN(num) ? undefined : num;
};

const safeParseStringArray = (value: unknown): string[] | undefined => {
  if (!value) return undefined;
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed) ? parsed.map(String) : [trimmed];
      } catch {
        // Fallback
      }
    }
    return trimmed.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return undefined;
};

export const mapDatabaseAssetToDomain = (dbAsset: DatabaseAsset): Asset => {
  const normalizedType = normalizeAssetType(dbAsset.type);
  const rawStatus = dbAsset.status?.toLowerCase().trim() || "tersedia";
  const status: AssetStatus = (ASSET_STATUSES as readonly string[]).includes(rawStatus)
    ? (rawStatus as AssetStatus)
    : "tersedia";

  return {
    ...dbAsset,
    id: dbAsset.id,
    assetsId: dbAsset.id,
    name: dbAsset.name || "Aset Tanpa Nama",
    category: dbAsset.category || "Umum",
    location: dbAsset.location || "-",
    status,
    type: normalizedType,

    addedBy: safeString(dbAsset.added_by),
    serialNumber: safeString(dbAsset.serial_number),
    licensePlate: safeString(dbAsset.license_plate),
    vehicleType: safeString(dbAsset.vehicle_type),
    fuelType: safeString(dbAsset.fuel_type),
    material: safeString(dbAsset.material),
    dimensions: safeString(dbAsset.dimensions),
    roomSize: safeString(dbAsset.room_size),
    brand: safeString(dbAsset.brand),
    model: safeString(dbAsset.model),
    notes: safeString(dbAsset.notes),
    lastBorrowedBy: safeString(dbAsset.last_borrowed_by),

    year: safeParseInt(dbAsset.year),
    month: safeParseInt(dbAsset.month),
    stnkYear: safeParseInt(dbAsset.stnk_year),
    stnkMonth: safeParseInt(dbAsset.stnk_month),
    mileage: safeParseInt(dbAsset.mileage),
    capacity: safeParseInt(dbAsset.capacity),
    floor: safeParseInt(dbAsset.floor),
    facilities: safeParseStringArray(dbAsset.facilities),

    lastBorrowedAt:
      typeof dbAsset.last_borrowed_at === "string"
        ? new Date(dbAsset.last_borrowed_at)
        : undefined,
    lastReturnedAt:
      typeof dbAsset.last_returned_at === "string"
        ? new Date(dbAsset.last_returned_at)
        : undefined,
    createdAt: dbAsset.created_at ? new Date(dbAsset.created_at) : new Date(),
    updatedAt: dbAsset.updated_at ? new Date(dbAsset.updated_at) : new Date(),
  } as unknown as Asset;
};

export const AssetService = {
  async getAssets(): Promise<Asset[]> {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from("assets")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    if (!data) return [];
    return data.map((d) => mapDatabaseAssetToDomain(d as DatabaseAsset));
  },

  async deleteAsset(id: string): Promise<void> {
    if (!id.trim()) throw new Error("Invalid asset ID");
    const supabase = createBrowserClient();
    const { error } = await supabase.from("assets").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },

  async getActiveBookings(assetIds: string[]): Promise<Record<string, boolean>> {
    if (assetIds.length === 0) return {};
    const supabase = createBrowserClient();
    const now = new Date();

    const { data: bookings } = await supabase
      .from("room_bookings")
      .select("room_ids, payload")
      .eq("status", "confirmed")
      .overlaps("room_ids", assetIds);

    const busyMap: Record<string, boolean> = {};

    if (bookings) {
      bookings.forEach((booking) => {
        const payload = booking.payload as {
          bookingStart?: string;
          bookingEnd?: string;
          startTime?: string;
          endTime?: string;
        } | null;
        if (!payload) return;

        const combineDateAndTime = (d?: string, t?: string, isEnd = false) => {
          if (!d) return null;
          const date = new Date(d);
          if (isNaN(date.getTime())) return null;

          if (!t) {
            if (isEnd) date.setHours(23, 59, 59, 999);
            else date.setHours(0, 0, 0, 0);
            return date;
          }

          const [h, m, s] = t.split(":").map(Number);
          date.setHours(h || 0, m || 0, s || (isEnd ? 59 : 0), isEnd ? 999 : 0);
          return date;
        };

        const start = combineDateAndTime(payload.bookingStart, payload.startTime, false);
        const end = combineDateAndTime(payload.bookingEnd || payload.bookingStart, payload.endTime, true);

        if (start && end && now >= start && now <= end) {
          const ids = booking.room_ids;
          if (Array.isArray(ids)) {
            ids.forEach((id: string) => {
              busyMap[id] = true;
            });
          }
        }
      });
    }
    return busyMap;
  },
};
