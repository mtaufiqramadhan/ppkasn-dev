import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get("format") || "json";
    const table = searchParams.get("table") || "assets";
    const supabase = await createClient();

    if (!["assets", "room_bookings"].includes(table)) {
        return NextResponse.json({ error: "Invalid table" }, { status: 400 });
    }

    try {
        const { data: records, error } = await supabase
            .from(table)
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!records || records.length === 0) {
            return NextResponse.json({ error: "No data found" }, { status: 404 });
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const filename = `${table}-backup-${timestamp}.${format}`;

        if (format === "json") {
            return new NextResponse(JSON.stringify(records, null, 2), {
                headers: {
                    "Content-Type": "application/json",
                    "Content-Disposition": `attachment; filename="${filename}"`,
                },
            });
        } else if (format === "csv") {
            const headers = Object.keys(records[0]).join(",");
            const rows = records.map((record) =>
                Object.values(record)
                    .map((value) => {
                        if (value === null || value === undefined) return "";
                        if (typeof value === "object") {
                            // Stringify objects/arrays (like JSONB or arrays)
                            return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
                        }
                        if (typeof value === "string") return `"${value.replace(/"/g, '""')}"`;
                        return value;
                    })
                    .join(",")
            );
            const csv = [headers, ...rows].join("\n");

            return new NextResponse(csv, {
                headers: {
                    "Content-Type": "text/csv",
                    "Content-Disposition": `attachment; filename="${filename}"`,
                },
            });
        } else if (format === "sql") {
            const columns = Object.keys(records[0]).join(", ");

            const sqlStatements = records.map(record => {
                const values = Object.values(record).map(value => {
                    if (value === null) return "NULL";
                    if (typeof value === "string") return `'${value.replace(/'/g, "''")}'`;
                    if (value instanceof Date) return `'${value.toISOString()}'`;
                    if (typeof value === 'object') return `'${JSON.stringify(value)}'`;
                    return value;
                }).join(", ");
                return `INSERT INTO ${table} (${columns}) VALUES (${values});`;
            }).join("\n");

            return new NextResponse(sqlStatements, {
                headers: {
                    "Content-Type": "application/sql",
                    "Content-Disposition": `attachment; filename="${filename}"`,
                },
            });
        }

        return NextResponse.json({ error: "Invalid format" }, { status: 400 });
    } catch (error) {
        console.error("Backup error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
