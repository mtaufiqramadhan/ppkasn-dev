import { NextResponse } from "next/server";
import { requireCmsAdmin, securityFailure } from "@/lib/security/request-guard";
export async function GET() {
  try {
    const { supabase } = await requireCmsAdmin();
    const { data, error } = await supabase.from("assets").select("name, type").limit(20);
    if (error) throw error;
    return NextResponse.json({ count: data?.length, data }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return securityFailure(error); }
}
