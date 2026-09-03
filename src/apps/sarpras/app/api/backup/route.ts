import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
    const supabase = await createClient();

    // Verifikasi autentikasi user
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json(
            { error: "Unauthorized. Silakan login terlebih dahulu untuk mengakses data backup." },
            { status: 401 }
        );
    }

    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get("format") || "json";
    const table = searchParams.get("table") || "all";
    const isStats = searchParams.get("stats") === "true";

    // Stats endpoint to show live database summary
    if (isStats) {
        try {
            const [
                { count: assetsCount, error: assetsErr },
                { count: bookingsCount, error: bookingsErr },
            ] = await Promise.all([
                supabase.from("assets").select("*", { count: "exact", head: true }),
                supabase.from("room_bookings").select("*", { count: "exact", head: true }),
            ]);

            if (assetsErr || bookingsErr) {
                const errMessage = assetsErr?.message || bookingsErr?.message;
                return NextResponse.json({ error: errMessage }, { status: 500 });
            }

            return NextResponse.json({
                success: true,
                stats: {
                    assets: assetsCount || 0,
                    room_bookings: bookingsCount || 0,
                    total: (assetsCount || 0) + (bookingsCount || 0),
                    timestamp: new Date().toISOString(),
                },
            });
        } catch (error) {
            return NextResponse.json(
                { error: error instanceof Error ? error.message : "Failed to fetch stats" },
                { status: 500 }
            );
        }
    }

    if (!["all", "assets", "room_bookings"].includes(table)) {
        return NextResponse.json({ error: "Invalid table parameter. Allowed: all, assets, room_bookings" }, { status: 400 });
    }

    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

        if (table === "all") {
            const [
                { data: assets, error: assetsErr },
                { data: bookings, error: bookingsErr },
            ] = await Promise.all([
                supabase.from("assets").select("*").order("created_at", { ascending: false }),
                supabase.from("room_bookings").select("*").order("created_at", { ascending: false }),
            ]);

            if (assetsErr || bookingsErr) {
                return NextResponse.json(
                    { error: assetsErr?.message || bookingsErr?.message },
                    { status: 500 }
                );
            }

            const assetsList = assets || [];
            const bookingsList = bookings || [];

            if (assetsList.length === 0 && bookingsList.length === 0) {
                return NextResponse.json({ error: "Belum ada data untuk dibackup" }, { status: 404 });
            }

            const filename = `sarpras-full-backup-${timestamp}.${format}`;

            if (format === "json") {
                const fullBackupPayload = {
                    app: "sarpras-ai",
                    version: "1.0",
                    type: "full_backup",
                    exported_at: new Date().toISOString(),
                    summary: {
                        assets_count: assetsList.length,
                        room_bookings_count: bookingsList.length,
                        total_records: assetsList.length + bookingsList.length,
                    },
                    tables: {
                        assets: assetsList,
                        room_bookings: bookingsList,
                    },
                };

                return new NextResponse(JSON.stringify(fullBackupPayload, null, 2), {
                    headers: {
                        "Content-Type": "application/json",
                        "Content-Disposition": `attachment; filename="${filename}"`,
                    },
                });
            } else if (format === "sql") {
                let sqlScript = `-- =============================================\n`;
                sqlScript += `-- SARPRAS AI - Full Database Backup\n`;
                sqlScript += `-- Exported At: ${new Date().toISOString()}\n`;
                sqlScript += `-- Total Assets: ${assetsList.length}\n`;
                sqlScript += `-- Total Room Bookings: ${bookingsList.length}\n`;
                sqlScript += `-- =============================================\n\n`;

                if (assetsList.length > 0) {
                    sqlScript += `-- --- TABLE: assets ---\n`;
                    const columns = Object.keys(assetsList[0]).map(escapeSqlIdentifier).join(", ");
                    const assetInserts = assetsList.map((record) => {
                        const values = Object.values(record).map((value) => formatSqlValue(value)).join(", ");
                        return `INSERT INTO "assets" (${columns}) VALUES (${values});`;
                    }).join("\n");
                    sqlScript += `${assetInserts}\n\n`;
                }

                if (bookingsList.length > 0) {
                    sqlScript += `-- --- TABLE: room_bookings ---\n`;
                    const columns = Object.keys(bookingsList[0]).map(escapeSqlIdentifier).join(", ");
                    const bookingInserts = bookingsList.map((record) => {
                        const values = Object.values(record).map((value) => formatSqlValue(value)).join(", ");
                        return `INSERT INTO "room_bookings" (${columns}) VALUES (${values});`;
                    }).join("\n");
                    sqlScript += `${bookingInserts}\n\n`;
                }

                return new NextResponse(sqlScript, {
                    headers: {
                        "Content-Type": "application/sql",
                        "Content-Disposition": `attachment; filename="${filename}"`,
                    },
                });
            } else if (format === "csv") {
                const csvParts: string[] = [];
                csvParts.push(`### TABLE: assets (${assetsList.length} records)`);
                if (assetsList.length > 0) {
                    csvParts.push(convertToCsv(assetsList));
                }
                csvParts.push(`\n### TABLE: room_bookings (${bookingsList.length} records)`);
                if (bookingsList.length > 0) {
                    csvParts.push(convertToCsv(bookingsList));
                }

                return new NextResponse(csvParts.join("\n"), {
                    headers: {
                        "Content-Type": "text/csv; charset=utf-8",
                        "Content-Disposition": `attachment; filename="${filename}"`,
                    },
                });
            }

            return NextResponse.json({ error: "Format tidak didukung" }, { status: 400 });
        }

        // Single table backup
        const { data: records, error } = await supabase
            .from(table)
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!records || records.length === 0) {
            return NextResponse.json({ error: `Data ${table} kosong` }, { status: 404 });
        }

        const filename = `${table}-backup-${timestamp}.${format}`;

        if (format === "json") {
            return new NextResponse(JSON.stringify(records, null, 2), {
                headers: {
                    "Content-Type": "application/json",
                    "Content-Disposition": `attachment; filename="${filename}"`,
                },
            });
        } else if (format === "csv") {
            const csv = convertToCsv(records);
            return new NextResponse(csv, {
                headers: {
                    "Content-Type": "text/csv; charset=utf-8",
                    "Content-Disposition": `attachment; filename="${filename}"`,
                },
            });
        } else if (format === "sql") {
            const columns = Object.keys(records[0]).map(escapeSqlIdentifier).join(", ");
            const sqlStatements = records.map((record) => {
                const values = Object.values(record).map((value) => formatSqlValue(value)).join(", ");
                return `INSERT INTO "${table}" (${columns}) VALUES (${values});`;
            }).join("\n");

            return new NextResponse(sqlStatements, {
                headers: {
                    "Content-Type": "application/sql",
                    "Content-Disposition": `attachment; filename="${filename}"`,
                },
            });
        }

        return NextResponse.json({ error: "Format tidak valid" }, { status: 400 });
    } catch (error) {
        console.error("Backup error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

function escapeSqlIdentifier(id: string): string {
    return `"${id.replace(/"/g, '""')}"`;
}

function formatSqlValue(value: unknown): string {
    if (value === null || value === undefined) return "NULL";
    if (typeof value === "string") return `'${value.replace(/'/g, "''")}'`;
    if (typeof value === "number") return Number.isFinite(value) ? String(value) : "NULL";
    if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
    if (value instanceof Date) return `'${value.toISOString()}'`;
    if (typeof value === "object") {
        if (Array.isArray(value) && value.every(v => typeof v === 'string')) {
            // PostgreSQL text array literal: '{"val1", "val2"}'
            const arrayContent = value.map(v => `"${String(v).replace(/"/g, '\\"')}"`).join(",");
            return `'{${arrayContent}}'`;
        }
        return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
    }
    return `'${String(value).replace(/'/g, "''")}'`;
}

function convertToCsv(records: Record<string, unknown>[]): string {
    if (records.length === 0) return "";
    const rawHeaders = Object.keys(records[0]);
    const headers = rawHeaders.map((h) => `"${h.replace(/"/g, '""')}"`).join(",");
    const rows = records.map((record) =>
        rawHeaders
            .map((header) => {
                const value = record[header];
                if (value === null || value === undefined) return "";
                if (typeof value === "object") {
                    return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
                }
                let str = String(value);
                // Mitigasi CSV Formula Injection (DDE)
                if (/^[=+\-@\t\r]/.test(str)) {
                    str = `'${str}`;
                }
                return `"${str.replace(/"/g, '""')}"`;
            })
            .join(",")
    );
    return [headers, ...rows].join("\n");
}
