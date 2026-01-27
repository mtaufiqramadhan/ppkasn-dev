import { z } from "zod";

export const ASSET_STATUSES = ["tersedia", "dipinjam"] as const;
export type AssetStatus = (typeof ASSET_STATUSES)[number];

const nullableNumber = (minVal: number, maxVal = Infinity) =>
    z.union([z.string(), z.number(), z.null(), z.undefined()])
        .transform((val) => {
            if (val === "" || val === null || val === undefined) return undefined;
            const n = Number(val);
            return isNaN(n) ? undefined : n;
        })
        .pipe(z.number().int().min(minVal).max(maxVal).optional());

export const baseAssetSchema = z.object({
    id: z.string(),
    assetsId: z.string().optional(),
    name: z.string().min(1, "Nama aset wajib diisi").transform((s) => s.trim()),
    category: z.string().min(1, "Kategori wajib diisi").transform((s) => s.trim()),
    location: z.string().min(1, "Lokasi wajib diisi").transform((s) => s.trim()),
    status: z.enum(ASSET_STATUSES),
    brand: z.string().optional().transform((v) => v?.trim()),
    model: z.string().optional().transform((v) => v?.trim()),
    notes: z.string().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
    addedBy: z.string().optional(),
    lastBorrowedBy: z.string().optional(),
    lastBorrowedAt: z.union([z.date(), z.string()]).optional(),
    lastReturnedAt: z.union([z.date(), z.string()]).optional(),
});

export const electronicSchema = z.object({
    type: z.literal("elektronik"),
    serialNumber: z.string().optional().transform((v) => v?.trim()),
});

export const furnitureSchema = z.object({
    type: z.literal("perabot"),
    material: z.string().optional().transform((v) => v?.trim()),
    dimensions: z.string().optional().transform((v) => v?.trim()),
});

export const vehicleSchema = z.object({
    type: z.literal("kendaraan"),
    licensePlate: z.string().min(1, "Nomor polisi wajib diisi").transform((s) => s.trim()),
    vehicleType: z.string().min(1, "Jenis kendaraan wajib diisi").transform((s) => s.trim()),
    year: nullableNumber(1900, new Date().getFullYear()),
    month: nullableNumber(1, 12),
    stnkYear: nullableNumber(1900, new Date().getFullYear() + 5),
    stnkMonth: nullableNumber(1, 12),
    mileage: nullableNumber(0),
    fuelType: z.string().optional().transform((v) => v?.trim()),
});

export const roomSchema = z.object({
    type: z.literal("ruangan"),
    capacity: z.number().int().min(1, "Kapasitas minimal 1"),
    roomSize: z.string().optional().transform((v) => v?.trim()),
    facilities: z.union([
        z.string().optional().transform((v) => v?.trim()),
        z.array(z.string().trim()).optional(),
    ]),
    floor: z.number({ invalid_type_error: "Lantai wajib diisi" }).int().min(1, "Lantai minimal 1"),
});

export const dormitorySchema = z.object({
    type: z.literal("asrama"),
    capacity: z.number().int().min(1, "Kapasitas minimal 1"),
    roomSize: z.string().optional().transform((v) => v?.trim()),
    facilities: z.union([
        z.string().optional().transform((v) => v?.trim()),
        z.array(z.string().trim()).optional(),
    ]),
    floor: z.number({ invalid_type_error: "Lantai wajib diisi" }).int().min(1, "Lantai minimal 1"),
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
    licensePlate: z.string().optional(),
    vehicleType: z.string().optional(),
});

const relaxedRoomSchema = roomSchema.extend({
    capacity: z.number().int().min(0).optional(),
    floor: z.number().optional(),
});

const relaxedDormitorySchema = dormitorySchema.extend({
    capacity: z.number().int().min(0).optional(),
    floor: z.number().optional(),
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
