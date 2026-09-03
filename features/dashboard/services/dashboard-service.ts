import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { type Asset, type RouteResolution } from "../types";

const bookingPayloadSchema = z
  .object({
    bookingStart: z.string().optional().nullable(),
    bookingEnd: z.string().optional().nullable(),
    startTime: z.string().optional().nullable(),
    endTime: z.string().optional().nullable(),
  })
  .passthrough();

export function combineDateAndTime(
  dateValue?: unknown,
  timeValue?: unknown,
  isEnd = false
): Date | null {
  if (!dateValue || typeof dateValue !== "string") return null;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;

  if (!timeValue || typeof timeValue !== "string") {
    if (isEnd) {
      date.setHours(23, 59, 59, 999);
      return date;
    }
    date.setHours(0, 0, 0, 0);
    return date;
  }

  const [hoursStr, minutesStr, secondsStr] = timeValue.split(":");
  const hours = Number.parseInt(hoursStr ?? "0", 10);
  const minutes = Number.parseInt(minutesStr ?? "0", 10);
  const seconds = Number.parseInt(secondsStr ?? (isEnd ? "59" : "0"), 10);
  date.setHours(hours, minutes, seconds, isEnd ? 999 : 0);
  return date;
}

export function isInRange(
  start: Date | null | undefined,
  end: Date | null | undefined,
  filterStart: Date | null | undefined,
  filterEnd: Date | null | undefined
): boolean {
  if (!start || !end || !filterStart) return false;

  const effectiveFilterEnd = filterEnd
    ? filterEnd
    : new Date(
        filterStart.getFullYear(),
        filterStart.getMonth(),
        filterStart.getDate(),
        23,
        59,
        59,
        999
      );
  return (
    start.getTime() <= effectiveFilterEnd.getTime() &&
    end.getTime() >= filterStart.getTime()
  );
}

export function sortByName(a?: Asset, b?: Asset): number {
  const na = (a?.name ?? a?.id ?? "").toString().toLowerCase();
  const nb = (b?.name ?? b?.id ?? "").toString().toLowerCase();
  if (na < nb) return -1;
  if (na > nb) return 1;
  return 0;
}

export function partitionAndSortByName(items: Asset[]): {
  available: Asset[];
  booked: Asset[];
} {
  const available = items
    .filter((i) => i.status === "tersedia")
    .sort(sortByName);
  const booked = items
    .filter((i) => i.status !== "tersedia")
    .sort(sortByName);
  return { available, booked };
}

export function groupAssetsByType(assets: Asset[]): Record<string, Asset[]> {
  return assets.reduce<Record<string, Asset[]>>((acc, asset) => {
    const type = (asset.type?.trim() || "lainnya").toLowerCase();
    if (!acc[type]) acc[type] = [];
    acc[type].push(asset);
    return acc;
  }, {});
}

const typeRouteMap: Record<string, RouteResolution> = {
  elektronik: { detailPath: "/assets" },
  perabot: { detailPath: "/assets" },
  kendaraan: { detailPath: "/assets" },
  ruangan: { detailPath: "/room", bookingPath: "/room/add" },
  asrama: { detailPath: "/dorm", bookingPath: "/dorm" },
  lainnya: { detailPath: "/assets" },
};

export function resolveRoutesForType(type: string): RouteResolution {
  const key = typeRouteMap[type] ? type : "lainnya";
  return typeRouteMap[key];
}

export const DashboardService = {
  async fetchAssets(
    filterStart?: Date,
    filterEnd?: Date
  ): Promise<Asset[]> {
    const supabase = createClient();

    const { data: rawAssets, error: assetsError } = await supabase
      .from("assets")
      .select("*");

    if (assetsError) {
      throw new Error(assetsError.message);
    }

    const raw: Asset[] = (rawAssets || []).map((d) => ({
      id: d.id,
      ...(d as Record<string, unknown>),
    }));

    const effectiveFilterEnd = filterEnd
      ? filterEnd
      : filterStart
      ? new Date(
          filterStart.getFullYear(),
          filterStart.getMonth(),
          filterStart.getDate(),
          23,
          59,
          59,
          999
        )
      : undefined;

    const { data: bookingsData } = await supabase
      .from("room_bookings")
      .select("*")
      .eq("status", "confirmed");

    const bookings = bookingsData || [];

    const annotated = raw.map((asset) => {
      if (asset.type !== "ruangan" && asset.type !== "asrama") {
        return { ...asset, status: "tersedia" };
      }

      let isBooked = false;

      const relevantBookings = bookings.filter((b) => {
        const roomIds = b.room_ids || [];
        return roomIds.includes(asset.id) || b.assetId === asset.id;
      });

      for (const rawDoc of relevantBookings) {
        const rawPayload = (rawDoc.payload ?? {}) as unknown;
        const parsed = bookingPayloadSchema.safeParse(rawPayload);
        if (!parsed.success) continue;

        const payload = parsed.data;
        const start = combineDateAndTime(
          payload.bookingStart ?? null,
          payload.startTime ?? null,
          false
        );
        const end = combineDateAndTime(
          payload.bookingEnd ?? payload.bookingStart ?? null,
          payload.endTime ?? null,
          true
        );

        if (isInRange(start, end, filterStart, effectiveFilterEnd)) {
          isBooked = true;
          break;
        }
      }

      return { ...asset, status: isBooked ? "dipinjam" : "tersedia" } as Asset;
    });

    return annotated;
  },
};
