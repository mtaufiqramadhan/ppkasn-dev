import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

const ALLOWED_ASSET_COLUMNS = new Set([
    "id",
    "name",
    "category",
    "location",
    "status",
    "brand",
    "model",
    "notes",
    "type",
    "added_by",
    "serial_number",
    "material",
    "dimensions",
    "license_plate",
    "vehicle_type",
    "year",
    "month",
    "stnk_year",
    "stnk_month",
    "mileage",
    "fuel_type",
    "capacity",
    "room_size",
    "floor",
    "facilities",
    "created_at",
    "updated_at",
    "last_borrowed_by",
    "last_borrowed_at",
    "last_returned_at",
]);

const ALLOWED_BOOKING_COLUMNS = new Set([
    "id",
    "room_ids",
    "payload",
    "status",
    "created_at",
]);

function isDangerousKey(key: string): boolean {
    return key === "__proto__" || key === "constructor" || key === "prototype";
}

function sanitizeText(val: unknown): string | null {
    if (val === null || val === undefined) return null;
    const str = String(val)
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
        .trim();
    return str === "" ? null : str;
}

export async function POST(request: NextRequest) {
    const supabase = await createClient();

    // 1. Verifikasi autentikasi user
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json(
            { error: "Unauthorized. Silakan login terlebih dahulu untuk memulihkan data." },
            { status: 401 }
        );
    }

    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const targetTable = (formData.get("table") as string) || "all";

        if (!file) {
            return NextResponse.json(
                { error: "Silakan pilih file backup terlebih dahulu" },
                { status: 400 }
            );
        }

        // 2. Proteksi ukuran file (DoS / Memory exhaustion)
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: "Ukuran file terlalu besar (maksimal 10 MB)" },
                { status: 400 }
            );
        }

        if (!["all", "assets", "room_bookings"].includes(targetTable)) {
            return NextResponse.json(
                { error: "Tabel tujuan tidak valid (pilihan: all, assets, room_bookings)" },
                { status: 400 }
            );
        }

        const buffer = await file.arrayBuffer();
        const content = new TextDecoder().decode(buffer);
        const filename = file.name.toLowerCase();

        let assetsData: Record<string, unknown>[] = [];
        let bookingsData: Record<string, unknown>[] = [];

        // 1. FORMAT JSON
        if (filename.endsWith(".json")) {
            let parsedJson: unknown;
            try {
                parsedJson = JSON.parse(content);
            } catch {
                return NextResponse.json(
                    { error: "Format JSON tidak valid atau rusak" },
                    { status: 400 }
                );
            }

            // A. Full bundle with "tables" wrapper: { tables: { assets: [], room_bookings: [] } }
            if (parsedJson && typeof parsedJson === "object" && "tables" in parsedJson) {
                const tables = (parsedJson as { tables: { assets?: Record<string, unknown>[]; room_bookings?: Record<string, unknown>[] } }).tables;
                if (Array.isArray(tables.assets)) {
                    assetsData = tables.assets;
                }
                if (Array.isArray(tables.room_bookings)) {
                    bookingsData = tables.room_bookings;
                }
            }
            // B. Direct object keys: { assets: [], room_bookings: [] }
            else if (
                parsedJson &&
                typeof parsedJson === "object" &&
                !Array.isArray(parsedJson) &&
                ("assets" in parsedJson || "room_bookings" in parsedJson)
            ) {
                const container = parsedJson as { assets?: Record<string, unknown>[]; room_bookings?: Record<string, unknown>[] };
                if (Array.isArray(container.assets)) {
                    assetsData = container.assets;
                }
                if (Array.isArray(container.room_bookings)) {
                    bookingsData = container.room_bookings;
                }
            }
            // C. Single array of records: [ ... ]
            else if (Array.isArray(parsedJson)) {
                if (targetTable === "assets") {
                    assetsData = parsedJson as Record<string, unknown>[];
                } else if (targetTable === "room_bookings") {
                    bookingsData = parsedJson as Record<string, unknown>[];
                } else {
                    const sample = (parsedJson[0] || {}) as Record<string, unknown>;
                    if ("room_ids" in sample || "payload" in sample) {
                        bookingsData = parsedJson as Record<string, unknown>[];
                    } else {
                        assetsData = parsedJson as Record<string, unknown>[];
                    }
                }
            } else if (typeof parsedJson === "object" && parsedJson !== null) {
                const obj = parsedJson as Record<string, unknown>;
                if (targetTable === "room_bookings" || "room_ids" in obj) {
                    bookingsData = [obj];
                } else {
                    assetsData = [obj];
                }
            }
        }
        // 2. FORMAT SQL
        else if (filename.endsWith(".sql")) {
            const parsedSql = parseSqlStatements(content);
            if (targetTable === "assets") {
                assetsData = parsedSql.assets;
            } else if (targetTable === "room_bookings") {
                bookingsData = parsedSql.room_bookings;
            } else {
                assetsData = parsedSql.assets;
                bookingsData = parsedSql.room_bookings;
            }
        }
        // 3. FORMAT CSV
        else if (filename.endsWith(".csv")) {
            if (content.includes("### TABLE: assets") || content.includes("### TABLE: room_bookings")) {
                const sections = content.split(/### TABLE:\s*/);
                for (const section of sections) {
                    if (section.startsWith("assets")) {
                        const csvContent = section.replace(/^assets[^\n]*\n/, "").trim();
                        assetsData = parseCsv(csvContent);
                    } else if (section.startsWith("room_bookings")) {
                        const csvContent = section.replace(/^room_bookings[^\n]*\n/, "").trim();
                        bookingsData = parseCsv(csvContent);
                    }
                }
            } else {
                const singleCsvData = parseCsv(content);
                if (targetTable === "assets") {
                    assetsData = singleCsvData;
                } else if (targetTable === "room_bookings") {
                    bookingsData = singleCsvData;
                } else {
                    const sample = (singleCsvData[0] || {}) as Record<string, unknown>;
                    if ("room_ids" in sample || "payload" in sample) {
                        bookingsData = singleCsvData;
                    } else {
                        assetsData = singleCsvData;
                    }
                }
            }
        } else {
            return NextResponse.json(
                { error: "Format file tidak didukung. Harap upload file .json, .csv, atau .sql" },
                { status: 400 }
            );
        }

        // Filter based on targetTable if user specifically wanted only one table
        if (targetTable === "assets") {
            bookingsData = [];
        } else if (targetTable === "room_bookings") {
            assetsData = [];
        }

        const totalRecords = assetsData.length + bookingsData.length;
        if (totalRecords === 0) {
            return NextResponse.json(
                { error: "Tidak ada data valid yang ditemukan dalam file untuk dipulihkan" },
                { status: 400 }
            );
        }

        // Clean & sanitize records with whitelist before upsert
        const sanitizedAssets = sanitizeAssets(assetsData);
        const sanitizedBookings = sanitizeBookings(bookingsData);

        let restoredAssets = 0;
        let restoredBookings = 0;

        if (sanitizedAssets.length > 0) {
            restoredAssets = await batchUpsert(supabase, "assets", sanitizedAssets);
        }

        if (sanitizedBookings.length > 0) {
            restoredBookings = await batchUpsert(supabase, "room_bookings", sanitizedBookings);
        }

        const detailsText: string[] = [];
        if (restoredAssets > 0) detailsText.push(`${restoredAssets} data aset`);
        if (restoredBookings > 0) detailsText.push(`${restoredBookings} data peminjaman`);

        return NextResponse.json({
            success: true,
            count: restoredAssets + restoredBookings,
            details: {
                assets: restoredAssets,
                room_bookings: restoredBookings,
            },
            message: `Berhasil memulihkan ${detailsText.join(" dan ")} ke database.`,
        });
    } catch (error) {
        console.error("Restore error:", error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "Terjadi kesalahan internal saat restore data",
            },
            { status: 500 }
        );
    }
}

async function batchUpsert(
    supabase: Awaited<ReturnType<typeof createClient>>,
    table: string,
    records: Record<string, unknown>[],
    batchSize = 100
): Promise<number> {
    let total = 0;
    for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        const { error } = await supabase.from(table).upsert(batch);
        if (error) {
            throw new Error(`Gagal menyimpan ke tabel ${table}: ${error.message}`);
        }
        total += batch.length;
    }
    return total;
}

function sanitizeAssets(records: Record<string, unknown>[]): Record<string, unknown>[] {
    return records
        .filter((r) => r && typeof r === "object" && !Array.isArray(r))
        .map((record) => {
            const cleanItem: Record<string, unknown> = {};

            // Whitelist allowed columns only
            Object.keys(record).forEach((key) => {
                if (isDangerousKey(key)) return;
                const dbKey = key.toLowerCase();
                if (ALLOWED_ASSET_COLUMNS.has(dbKey)) {
                    cleanItem[dbKey] = record[key];
                }
            });

            // Ensure ID exists
            if (!cleanItem.id && record.assetsId) cleanItem.id = sanitizeText(record.assetsId);
            if (!cleanItem.id && cleanItem.name) {
                cleanItem.id = `AST-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
            }

            // Normalize JSON / Arrays for facilities
            if (typeof cleanItem.facilities === "string") {
                const trimmed = cleanItem.facilities.trim();
                if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
                    try {
                        const parsed = JSON.parse(trimmed);
                        cleanItem.facilities = Array.isArray(parsed) ? parsed.join(", ") : trimmed;
                    } catch {
                        cleanItem.facilities = trimmed;
                    }
                }
            } else if (Array.isArray(cleanItem.facilities)) {
                cleanItem.facilities = (cleanItem.facilities as unknown[])
                    .filter((f): f is string => typeof f === "string")
                    .join(", ");
            }

            // Numeric fields conversion
            const numericFields = ["year", "month", "stnk_year", "stnk_month", "mileage", "capacity", "floor"];
            numericFields.forEach((field) => {
                if (field in cleanItem && cleanItem[field] !== null && cleanItem[field] !== "") {
                    const parsed = Number(cleanItem[field]);
                    cleanItem[field] = Number.isFinite(parsed) ? parsed : null;
                }
            });

            // Text fields sanitization
            const textFields = [
                "name", "category", "location", "status", "brand", "model",
                "notes", "type", "added_by", "serial_number", "material",
                "dimensions", "license_plate", "vehicle_type", "fuel_type", "room_size"
            ];
            textFields.forEach((field) => {
                if (field in cleanItem && typeof cleanItem[field] === "string") {
                    cleanItem[field] = sanitizeText(cleanItem[field]);
                }
            });

            return cleanItem;
        });
}

function sanitizeBookings(records: Record<string, unknown>[]): Record<string, unknown>[] {
    return records
        .filter((r) => r && typeof r === "object" && !Array.isArray(r))
        .map((record) => {
            const cleanItem: Record<string, unknown> = {};

            // Whitelist allowed columns only
            Object.keys(record).forEach((key) => {
                if (isDangerousKey(key)) return;
                const dbKey = key.toLowerCase();
                if (ALLOWED_BOOKING_COLUMNS.has(dbKey)) {
                    cleanItem[dbKey] = record[key];
                }
            });

            // Normalize room_ids
            let rawRoomIds = cleanItem.room_ids || record.roomIds;
            if (typeof rawRoomIds === "string") {
                if (rawRoomIds.startsWith("{") && rawRoomIds.endsWith("}")) {
                    rawRoomIds = rawRoomIds
                        .slice(1, -1)
                        .split(",")
                        .map((s: string) => s.replace(/^"|"$/g, "").trim())
                        .filter(Boolean);
                } else if (rawRoomIds.startsWith("[") && rawRoomIds.endsWith("]")) {
                    try {
                        rawRoomIds = JSON.parse(rawRoomIds);
                    } catch {
                        rawRoomIds = [rawRoomIds];
                    }
                } else {
                    rawRoomIds = rawRoomIds.split(",").map((s: string) => s.trim()).filter(Boolean);
                }
            }
            if (!Array.isArray(rawRoomIds)) {
                rawRoomIds = rawRoomIds ? [String(rawRoomIds)] : [];
            }
            cleanItem.room_ids = (rawRoomIds as unknown[]).filter(
                (id): id is string => typeof id === "string" && id.trim() !== ""
            );

            // Normalize payload
            let rawPayload = cleanItem.payload;
            if (typeof rawPayload === "string") {
                try {
                    rawPayload = JSON.parse(rawPayload);
                } catch {
                    rawPayload = {};
                }
            }
            if (!rawPayload || typeof rawPayload !== "object" || Array.isArray(rawPayload)) {
                rawPayload = {};
            }

            // Strip prototype pollution keys from payload
            const safePayload: Record<string, unknown> = {};
            Object.keys(rawPayload as Record<string, unknown>).forEach((k) => {
                if (!isDangerousKey(k)) {
                    safePayload[k] = (rawPayload as Record<string, unknown>)[k];
                }
            });

            cleanItem.payload = safePayload;
            cleanItem.status = cleanItem.status === "cancelled" ? "cancelled" : "confirmed";

            return cleanItem;
        });
}

function parseCsv(content: string): Record<string, unknown>[] {
    const lines = content.split(/\r?\n/).filter((line) => line.trim() !== "");
    if (lines.length < 2) return [];

    const headers = parseCsvRow(lines[0]);

    return lines.slice(1).map((line) => {
        const values = parseCsvRow(line);
        const obj: Record<string, unknown> = {};

        headers.forEach((header, index) => {
            if (isDangerousKey(header)) return;
            let val = values[index];
            if (val === undefined || val === null || val === "") {
                obj[header] = null;
            } else {
                val = val.trim();
                // Strip formula escape prefix if present
                if (val.startsWith("'=") || val.startsWith("'+") || val.startsWith("'-") || val.startsWith("'@")) {
                    val = val.substring(1);
                }
                if ((val.startsWith("{") && val.endsWith("}")) || (val.startsWith("[") && val.endsWith("]"))) {
                    try {
                        obj[header] = JSON.parse(val);
                    } catch {
                        obj[header] = val;
                    }
                } else {
                    obj[header] = val;
                }
            }
        });
        return obj;
    });
}

function parseCsvRow(row: string): string[] {
    const values: string[] = [];
    let inQuotes = false;
    let currentValue = "";

    for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (char === '"') {
            if (i + 1 < row.length && row[i + 1] === '"') {
                currentValue += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === "," && !inQuotes) {
            values.push(currentValue);
            currentValue = "";
        } else {
            currentValue += char;
        }
    }
    values.push(currentValue);
    return values.map((v) => {
        v = v.trim();
        if (v.startsWith('"') && v.endsWith('"')) {
            return v.slice(1, -1).replace(/""/g, '"');
        }
        return v;
    });
}

function parseSqlStatements(sqlContent: string): {
    assets: Record<string, unknown>[];
    room_bookings: Record<string, unknown>[];
} {
    const assets: Record<string, unknown>[] = [];
    const room_bookings: Record<string, unknown>[] = [];

    // Match statements like: INSERT INTO "assets" ("col1", "col2") VALUES (val1, val2);
    const insertRegex = /INSERT\s+INTO\s+["`']?(assets|room_bookings)["`']?\s*\(([^)]+)\)\s*VALUES\s*\(([\s\S]*?)\);/gi;
    let match: RegExpExecArray | null;

    while ((match = insertRegex.exec(sqlContent)) !== null) {
        const tableName = match[1].toLowerCase();
        const columns = match[2].split(",").map((c) => c.trim().replace(/^["`']|["`']$/g, ""));
        const rawValues = match[3];

        const parsedValues = parseSqlValues(rawValues);
        const record: Record<string, unknown> = {};

        columns.forEach((col, idx) => {
            if (!isDangerousKey(col)) {
                record[col] = parsedValues[idx] !== undefined ? parsedValues[idx] : null;
            }
        });

        if (tableName === "assets") {
            assets.push(record);
        } else if (tableName === "room_bookings") {
            room_bookings.push(record);
        }
    }

    return { assets, room_bookings };
}

function parseSqlValues(raw: string): (string | number | boolean | null | Record<string, unknown>)[] {
    const values: (string | number | boolean | null | Record<string, unknown>)[] = [];
    let inString = false;
    let current = "";

    for (let i = 0; i < raw.length; i++) {
        const char = raw[i];
        if (char === "'") {
            if (i + 1 < raw.length && raw[i + 1] === "'") {
                current += "'";
                i++;
            } else {
                inString = !inString;
            }
        } else if (char === "," && !inString) {
            values.push(cleanSqlValue(current));
            current = "";
        } else {
            current += char;
        }
    }
    values.push(cleanSqlValue(current));
    return values;
}

function cleanSqlValue(str: string): string | number | boolean | null | Record<string, unknown> {
    const trimmed = str.trim();
    if (trimmed.toUpperCase() === "NULL" || trimmed === "") return null;
    if (trimmed.toUpperCase() === "TRUE") return true;
    if (trimmed.toUpperCase() === "FALSE") return false;
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);

    let val = trimmed;
    if (val.startsWith("'") && val.endsWith("'")) {
        val = val.slice(1, -1).replace(/''/g, "'");
    }

    if ((val.startsWith("{") && val.endsWith("}")) || (val.startsWith("[") && val.endsWith("]"))) {
        try {
            return JSON.parse(val);
        } catch {}
    }

    return val;
}
