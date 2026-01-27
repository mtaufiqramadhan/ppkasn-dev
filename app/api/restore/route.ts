import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
    const supabase = await createClient();

    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const table = formData.get("table") as string || "assets";

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            );
        }

        if (!["assets", "room_bookings"].includes(table)) {
            return NextResponse.json({ error: "Invalid table" }, { status: 400 });
        }

        const buffer = await file.arrayBuffer();
        const content = new TextDecoder().decode(buffer);
        const filename = file.name.toLowerCase();

        let dataToUpsert: any[] = [];

        if (filename.endsWith(".json")) {
            try {
                dataToUpsert = JSON.parse(content);
                if (!Array.isArray(dataToUpsert)) {
                    dataToUpsert = [dataToUpsert];
                }
            } catch (e) {
                return NextResponse.json(
                    { error: "Invalid JSON format" },
                    { status: 400 }
                );
            }
        } else if (filename.endsWith(".csv")) {
            const lines = content.split(/\r?\n/).filter(line => line.trim() !== "");
            if (lines.length < 2) {
                return NextResponse.json(
                    { error: "CSV file is empty or missing headers" },
                    { status: 400 }
                );
            }
            const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));

            dataToUpsert = lines.slice(1).map((line) => {
                const values: string[] = [];
                let inQuotes = false;
                let currentValue = "";

                for (let i = 0; i < line.length; i++) {
                    const char = line[i];
                    if (char === '"') {
                        if (i + 1 < line.length && line[i + 1] === '"') {
                            currentValue += '"'; // Escaped quote
                            i++;
                        } else {
                            inQuotes = !inQuotes;
                        }
                    } else if (char === ',' && !inQuotes) {
                        values.push(currentValue);
                        currentValue = "";
                    } else {
                        currentValue += char;
                    }
                }
                values.push(currentValue);

                const obj: any = {};
                headers.forEach((header, index) => {
                    let value = values[index];
                    if (value) {
                        value = value.trim();
                        if (value.startsWith('"') && value.endsWith('"')) {
                            value = value.slice(1, -1);
                        }
                    }
                    if (value === "") value = null as any;

                    if (value && (value.startsWith('{') || value.startsWith('['))) {
                        try {
                            const parsed = JSON.parse(value);
                            value = parsed;
                        } catch (e) {

                        }
                    }

                    obj[header] = value;
                });
                return obj;
            });
        } else if (filename.endsWith(".sql")) {
            return NextResponse.json(
                { error: "SQL Restore is not supported via this interface." },
                { status: 400 }
            );
        } else {
            return NextResponse.json(
                { error: "Unsupported file format" },
                { status: 400 }
            );
        }

        if (dataToUpsert.length === 0) {
            return NextResponse.json(
                { error: "No data to restore" },
                { status: 400 }
            );
        }

        const { error } = await supabase.from(table).upsert(dataToUpsert);

        if (error) {
            console.error("Supabase upsert error:", error);
            return NextResponse.json(
                { error: `Database error: ${error.message}` },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, count: dataToUpsert.length });

    } catch (error) {
        console.error("Restore error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
