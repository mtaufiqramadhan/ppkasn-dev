import { z } from "zod";

export const ASSET_STATUSES = ["tersedia", "dipinjam", "rusak", "hilang", "perbaikan"] as const;
export type AssetStatus = (typeof ASSET_STATUSES)[number];

export const VALID_ASSET_TYPES = ["elektronik", "perabot", "kendaraan", "ruangan", "asrama", "lainnya"] as const;
export type ValidAssetType = (typeof VALID_ASSET_TYPES)[number];

export function normalizeAssetType(type?: string | null): ValidAssetType {
  if (!type) return "lainnya";
  const t = type.toLowerCase().trim().replace(/[\s-_]+/g, "");
  if (t === "elektronik" || t === "electronic" || t === "electronics") return "elektronik";
  if (t === "perabot" || t === "furniture" || t === "mebel") return "perabot";
  if (t === "kendaraan" || t === "vehicle" || t === "mobil" || t === "motor") return "kendaraan";
  if (t === "ruangan" || t === "ruang" || t === "ruangrapat" || t === "meetingroom" || t === "room") return "ruangan";
  if (t === "asrama" || t === "dorm" || t === "dormitory" || t === "kamar") return "asrama";
  return "lainnya";
}

const nullableNumber = (minVal: number, maxVal = Infinity) =>
  z.union([z.string(), z.number(), z.null(), z.undefined()])
    .transform((val) => {
      if (val === "" || val === null || val === undefined) return undefined;
      const n = Number(val);
      return isNaN(n) ? undefined : n;
    })
    .pipe(z.number().int().min(minVal).max(maxVal).optional());

export const baseAssetSchema = z.object({
  id: z.string().max(100),
  assetsId: z.string().max(100).optional(),
  name: z.string().min(1, "Nama aset wajib diisi").max(200, "Nama aset maksimal 200 karakter").transform((s) => s.trim()),
  category: z.string().min(1, "Kategori wajib diisi").max(100, "Kategori maksimal 100 karakter").transform((s) => s.trim()),
  location: z.string().min(1, "Lokasi wajib diisi").max(100, "Lokasi maksimal 100 karakter").transform((s) => s.trim()),
  status: z.enum(ASSET_STATUSES),
  brand: z.string().max(100, "Merek maksimal 100 karakter").optional().transform((v) => v?.trim()),
  model: z.string().max(100, "Model maksimal 100 karakter").optional().transform((v) => v?.trim()),
  notes: z.string().max(2000, "Catatan maksimal 2000 karakter").optional().transform((v) => v?.trim()),
  createdAt: z.date(),
  updatedAt: z.date(),
  addedBy: z.string().max(100).optional().transform((v) => v?.trim()),
  lastBorrowedBy: z.string().max(100).optional().transform((v) => v?.trim()),
  lastBorrowedAt: z.union([z.date(), z.string()]).optional(),
  lastReturnedAt: z.union([z.date(), z.string()]).optional(),
});

export const electronicSchema = z.object({
  type: z.literal("elektronik"),
  serialNumber: z.string().max(100, "Nomor seri maksimal 100 karakter").optional().transform((v) => v?.trim()),
});

export const furnitureSchema = z.object({
  type: z.literal("perabot"),
  material: z.string().max(100, "Bahan maksimal 100 karakter").optional().transform((v) => v?.trim()),
  dimensions: z.string().max(100, "Dimensi maksimal 100 karakter").optional().transform((v) => v?.trim()),
});

export const vehicleSchema = z.object({
  type: z.literal("kendaraan"),
  licensePlate: z.string().min(1, "Nomor polisi wajib diisi").max(30, "Nomor polisi maksimal 30 karakter").transform((s) => s.trim()),
  vehicleType: z.string().min(1, "Jenis kendaraan wajib diisi").max(100, "Jenis kendaraan maksimal 100 karakter").transform((s) => s.trim()),
  year: nullableNumber(1900, new Date().getFullYear()),
  month: nullableNumber(1, 12),
  stnkYear: nullableNumber(1900, new Date().getFullYear() + 5),
  stnkMonth: nullableNumber(1, 12),
  mileage: nullableNumber(0, 5000000),
  fuelType: z.string().max(50, "Bahan bakar maksimal 50 karakter").optional().transform((v) => v?.trim()),
});

export const roomSchema = z.object({
  type: z.literal("ruangan"),
  capacity: z.number().int().min(1, "Kapasitas minimal 1").max(50000, "Kapasitas maksimal 50.000"),
  roomSize: z.string().max(50, "Ukuran ruangan maksimal 50 karakter").optional().transform((v) => v?.trim()),
  facilities: z.union([
    z.string().max(1000).optional().transform((v) => v?.trim()),
    z.array(z.string().max(100).trim()).max(100).optional(),
  ]),
  floor: z.number({ invalid_type_error: "Lantai wajib diisi" }).int().min(1, "Lantai minimal 1").max(200, "Lantai maksimal 200"),
});

export const dormitorySchema = z.object({
  type: z.literal("asrama"),
  capacity: z.number().int().min(1, "Kapasitas minimal 1").max(50000, "Kapasitas maksimal 50.000"),
  roomSize: z.string().max(50, "Ukuran ruangan maksimal 50 karakter").optional().transform((v) => v?.trim()),
  facilities: z.union([
    z.string().max(1000).optional().transform((v) => v?.trim()),
    z.array(z.string().max(100).trim()).max(100).optional(),
  ]),
  floor: z.number({ invalid_type_error: "Lantai wajib diisi" }).int().min(1, "Lantai minimal 1").max(200, "Lantai maksimal 200"),
});

export const otherSchema = z.object({ type: z.literal("lainnya") });

export const assetSchema = z
  .discriminatedUnion("type", [
    electronicSchema,
    furnitureSchema,
    vehicleSchema,
    roomSchema,
    dormitorySchema,
    otherSchema,
  ])
  .and(baseAssetSchema);

export type Asset = z.infer<typeof assetSchema>;

const relaxedVehicleSchema = vehicleSchema.extend({
  licensePlate: z.string().max(30).optional(),
  vehicleType: z.string().max(100).optional(),
});

const relaxedRoomSchema = roomSchema.extend({
  capacity: z.number().int().min(0).max(50000).optional(),
  floor: z.number().max(200).optional(),
});

const relaxedDormitorySchema = dormitorySchema.extend({
  capacity: z.number().int().min(0).max(50000).optional(),
  floor: z.number().max(200).optional(),
});

export const displayAssetSchema = z
  .discriminatedUnion("type", [
    electronicSchema,
    furnitureSchema,
    relaxedVehicleSchema,
    relaxedRoomSchema,
    relaxedDormitorySchema,
    otherSchema,
  ])
  .and(baseAssetSchema);
