import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("assets")
        .select("name, type")
        .limit(20);

    return NextResponse.json({ count: data?.length, data, error });
}
