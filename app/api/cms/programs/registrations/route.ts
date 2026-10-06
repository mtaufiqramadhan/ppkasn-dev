import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { CmsStore } from "@/lib/cms-store";
import { requireCmsAdmin, guardMutation, readJsonBody, securityFailure } from "@/lib/security/request-guard";
const updateSchema = z.object({ registrationCode: z.string().trim().min(1).max(100), status: z.enum(["Menunggu Seleksi Administrasi", "Terverifikasi", "Ditolak"]) }).strict();
export async function GET() {
  try {
    await requireCmsAdmin();
    return NextResponse.json({ success: true, data: CmsStore.getRegistrations() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return securityFailure(error); }
}
export async function PATCH(request: NextRequest) {
  try {
    await requireCmsAdmin();
    await guardMutation(request, "cms-registrations");
    const parsed = updateSchema.safeParse(await readJsonBody(request, 2048));
    if (!parsed.success) return NextResponse.json({ error: "Status pendaftaran tidak valid." }, { status: 400 });
    const registrations = CmsStore.getRegistrations();
    const item = registrations.find(value => value.registrationCode === parsed.data.registrationCode);
    if (!item) return NextResponse.json({ error: "Pendaftaran tidak ditemukan." }, { status: 404 });
    item.status = parsed.data.status;
    CmsStore.saveRegistrations(registrations);
    return NextResponse.json({ success: true, data: item });
  } catch (error) { return securityFailure(error); }
}
