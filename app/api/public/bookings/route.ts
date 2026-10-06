import { NextRequest, NextResponse } from "next/server";
import { bookingApiSchema, bookingRangeSchema, fetchBookingSchedule } from "@/features/booking/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isCmsAdmin } from "@/lib/security/admin-policy";
import { guardMutation, readJsonBody, securityFailure, RequestSecurityError } from "@/lib/security/request-guard";

export async function GET(request: NextRequest) {
  try {
    const parsed = bookingRangeSchema.safeParse({ start: request.nextUrl.searchParams.get("start"), end: request.nextUrl.searchParams.get("end") });
    if (!parsed.success) return NextResponse.json({ error: "Rentang jadwal tidak valid (maksimal 120 hari)." }, { status: 400 });
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    const admin = !authError && isCmsAdmin(user);
    const rows = await fetchBookingSchedule(supabase, admin, parsed.data.start, parsed.data.end);
    return NextResponse.json({ data: rows }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return securityFailure(error); }
}

export async function POST(request: NextRequest) {
  try {
    await guardMutation(request, "public-booking", 5, 15 * 60000);
    const parsed = bookingApiSchema.safeParse(await readJsonBody(request, 256 * 1024));
    if (!parsed.success) return NextResponse.json({ error: "Data peminjaman tidak valid." }, { status: 400 });
    let backend;
    try { backend = createAdminClient(); } catch { throw new RequestSecurityError("Layanan peminjaman belum dikonfigurasi.", 503); }
    // Database function validates assets and locks the shared schedule to prevent booking races.
    const { data, error } = await backend.rpc("create_validated_booking", { input: parsed.data });
    if (error) {
      if (error.code === "P0001") return NextResponse.json({ error: "Ruangan tidak tersedia atau data peminjaman tidak valid." }, { status: 409 });
      throw error;
    }
    if (typeof data !== "string") throw new Error("Invalid booking result");
    return NextResponse.json({ id: data }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) { return securityFailure(error); }
}
